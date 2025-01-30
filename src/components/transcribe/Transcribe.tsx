import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  GetTranscriptionJobCommand,
  StartTranscriptionJobCommand,
  TranscribeClient,
} from "@aws-sdk/client-transcribe";
import React, { useState } from "react";
import { accessKeyId, s3Client, secretAccessKey } from "../Methods/aws-config";

const Transcribe = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const transcribeClient = new TranscribeClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: accessKeyId, // Add Transcribe credentials
      secretAccessKey: secretAccessKey,
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
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
      });

      await s3Client.send(command);
      console.log("S3 Upload Successful:", objectKey);
      return `s3://${bucketName}/${objectKey}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return null;
    }
  };

  const startTranscriptionJob = async (s3Uri: string): Promise<string | null> => {
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
      setIsLoading(false);
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
          setTranscription(data.results.transcripts.map((t: any) => t.transcript).join(" "));
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
    setIsLoading(true);
    const s3Uri = await uploadFileToS3();
    if (!s3Uri) return;

    const jobName = await startTranscriptionJob(s3Uri);
    if (!jobName) return;

    await getTranscriptionResult(jobName);
  };

  return (
    <div className="container-fluid p-3">
      <div className="card p-3 shadow-sm">
        <h6 className="card-title mb-2">Upload an Audio File</h6>
        <div className="d-flex align-items-center mb-2">
          <input
            type="file"
            className="form-control form-control-sm me-2"
            onChange={handleFileChange}
            accept="audio/*"
            style={{ width: "250px" }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleTranscribe} disabled={!file}>
            Upload & Analyze
          </button>
        </div>
        {isLoading && <div className="text-primary fw-bold">Analyzing...</div>} {/* ✅ Show "Analyzing..." */}
      </div>

      {transcription && (
        <div className="card p-2 shadow-sm mt-3">
          <h6 className="card-title mb-2">Transcription Result</h6>
          <textarea
            className="form-control"
            value={transcription}
            readOnly
            rows={8}
            placeholder="Transcription will appear here..."
          />
        </div>
      )}
    </div>
  );
};

export default Transcribe;
