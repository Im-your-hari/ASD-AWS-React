// // import { S3Client } from "@aws-sdk/client-s3";
// // import AWS from "aws-sdk";
// import {
//   GetTranscriptionJobCommand,
//   StartTranscriptionJobCommand,
//   TranscribeClient,
// } from "@aws-sdk/client-transcribe";
// import React, { useState } from "react";
// import { S3Client } from "@aws-sdk/client-s3";

// const Transcribe = () => {
//   const [file, setFile] = useState(null);
//   const [transcription, setTranscription] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const transcribeClient = new TranscribeClient({
//     region: "us-east-1", // Replace with your AWS region
//     credentials: {
//       accessKeyId: "", // Replace with your AWS access key
//       secretAccessKey: "", // Replace with your AWS secret key
//     },
//   });

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const uploadFileToS3 = async () => {
//     console.log("Uploading file to S3...");
//     const bucketName = "asd-transcribe-s3"; // Replace with your S3 bucket name
//     const region = "us-east-1"; // Replace with your AWS region
//     const accessKeyId = ""; // Replace with your AWS access key
//     const secretAccessKey = ""; // Replace with your AWS secret key

//     // AWS.config.update({
//     //   region,
//     //   accessKeyId,
//     //   secretAccessKey,
//     // });

//     // const s3 = new AWS.S3();
//     const s3 = new S3Client({
//         region:"us-east-1",
//         credentials:{
//             accessKeyId : "",
//             secretAccessKey : ""
//         },
//     })

//     const objectKey = `uploads/${file.name}`;

//     try {
//       const params = {
//         Bucket: bucketName,
//         Key: objectKey,
//         Body: file, // Use file directly here
//         ContentType: file.type, // Ensure the content type is set
//         // Remove ACL here as it is not supported
//       };

//       console.log("S3 upload params:", params);

//       const response = await s3.upload(params).promise();
//       console.log("S3 upload response:", response);
//       return `s3://${bucketName}/${objectKey}`; // Return the S3 URI for later use
//     } catch (error) {
//       console.error("Error uploading file to S3:", error);
//       return null;
//     }
//   };

//   const startTranscriptionJob = async (s3Uri) => {
//     const transcriptionJobName = `transcription-job-${Date.now()}`;
//     const languageCode = "en-US"; // Change to the desired language code

//     console.log("Starting transcription job...");
//     try {
//       const command = new StartTranscriptionJobCommand({
//         TranscriptionJobName: transcriptionJobName,
//         Media: { MediaFileUri: s3Uri },
//         MediaFormat: "mp3", // Use 'mp3' for MP3 files
//         LanguageCode: languageCode,
//         OutputBucketName: "asd-transcribe-s3", // Replace with the same S3 bucket name
//       });
//       console.log("Transcription job command:", command);
//       const response = await transcribeClient.send(command);
//       console.log("Transcription job response:", response);
//       return transcriptionJobName;
//     } catch (error) {
//       console.error("Error starting transcription job: ", error);
//       return null;
//     }
//   };

//   const getTranscriptionResult = async (jobName) => {
//     setIsLoading(true);
//     try {
//       console.log(`Fetching transcription job: ${jobName}`);
//       while (true) {
//         const response = await transcribeClient.send(
//           new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
//         );
//         const job = response.TranscriptionJob;

//         console.log(
//           `Job status: ${job.TranscriptionJobStatus}, job name: ${jobName}`
//         );

//         if (job.TranscriptionJobStatus === "COMPLETED") {
//           console.log("Job completed");
//           const result = await fetch(job.Transcript.TranscriptFileUri);
//           const data = await result.json();
//           console.log(
//             "Setting transcription to: ",
//             data.results.transcripts.map((t) => t.transcript).join(" ")
//           );
//           setTranscription(
//             data.results.transcripts.map((t) => t.transcript).join(" ")
//           );
//           break;
//         } else if (job.TranscriptionJobStatus === "FAILED") {
//           console.error("Job failed: ", job.FailureReason);
//           console.error("Transcription job failed: ", job.FailureReason);
//           break;
//         }

//         console.log("Waiting 5 seconds before polling again...");
//         await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
//       }
//     } catch (error) {
//       console.error("Error fetching transcription result: ", error);
//     }
//     setIsLoading(false);
//   };

//   const handleTranscribe = async () => {
//     const s3Uri = await uploadFileToS3();
//     if (!s3Uri) return;

//     const jobName = await startTranscriptionJob(s3Uri);
//     if (!jobName) return;

//     await getTranscriptionResult(jobName);
//   };

//   return (
//     <div className="app">
//       <h1>Audio File Transcription</h1>
//       <input type="file" accept="audio/*" onChange={handleFileChange} />
//       <button onClick={handleTranscribe} disabled={isLoading || !file}>
//         {isLoading ? "Transcribing..." : "Upload and Transcribe"}
//       </button>
//       <textarea
//         value={transcription}
//         readOnly
//         rows={10}
//         cols={50}
//         placeholder="Transcription will appear here..."
//       ></textarea>
//     </div>
//   );
// };

// export default Transcribe;

import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";
import React, { useState } from "react";
import { s3ClientTranscribe } from "./aws-config-transcribe";

const Transcribe = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const transcribeClient = new TranscribeClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: "",  // transcribe creds
      secretAccessKey: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFileToS3 = async (): Promise<string | null> => {
    if (!file) return null;
    console.log("Uploading file to S3...");
    const bucketName = "asd-transcribe";
    const objectKey = `uploads/${Date.now()}-${file.name}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: new Uint8Array(arrayBuffer), // Convert to Uint8Array
        ContentType: file.type,
      });

      await s3ClientTranscribe.send(command);
      console.log("S3 Upload Successful:", objectKey);
      return `s3://${bucketName}/${objectKey}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return null;
    }
  };

  const startTranscriptionJob = async (
    s3Uri: string
  ): Promise<string | null> => {
    const transcriptionJobName = `transcription-job-${Date.now()}`;
    const languageCode = "en-US";

    console.log("Starting transcription job...");
    try {
      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: transcriptionJobName,
        Media: { MediaFileUri: s3Uri },
        MediaFormat: "mp3",
        LanguageCode: languageCode,
        OutputBucketName: "asd-transcribe",
      });

      await transcribeClient.send(command);
      console.log("Transcription job started:", transcriptionJobName);
      return transcriptionJobName;
    } catch (error) {
      console.error("Error starting transcription job:", error);
      return null;
    }
  };

  const getTranscriptionResult = async (jobName: string) => {
    setIsLoading(true);
    try {
      console.log(`Fetching transcription result for job: ${jobName}`);
      while (true) {
        const response = await transcribeClient.send(
          new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
        );
        const job = response.TranscriptionJob;

        console.log(`Job status: ${job?.TranscriptionJobStatus}`);

        if (job?.TranscriptionJobStatus === "COMPLETED") {
          console.log("Job completed, fetching transcript...");
          const result = await fetch(job.Transcript?.TranscriptFileUri || "");
          const data = await result.json();
          setTranscription(
            data.results.transcripts.map((t: any) => t.transcript).join(" ")
          );
          break;
        } else if (job?.TranscriptionJobStatus === "FAILED") {
          console.error("Transcription job failed:", job.FailureReason);
          break;
        }

        console.log("Waiting before checking again...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error fetching transcription result:", error);
    }
    setIsLoading(false);
  };

  const handleTranscribe = async () => {
    const s3Uri = await uploadFileToS3();
    if (!s3Uri) return;

    const jobName = await startTranscriptionJob(s3Uri);
    if (!jobName) return;

    await getTranscriptionResult(jobName);
  };

  return (
    <div className="app">
      <h1>Audio File Transcription</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleTranscribe} disabled={isLoading || !file}>
        {isLoading ? "Transcribing..." : "Upload and Transcribe"}
      </button>
      <textarea
        value={transcription}
        readOnly
        rows={10}
        cols={50}
        placeholder="Transcription will appear here..."
      ></textarea>
    </div>
  );
};

export default Transcribe;
