// import {
//   AnalyzeDocumentCommand,
//   AnalyzeDocumentCommandOutput,
// } from "@aws-sdk/client-textract/dist-types/commands/AnalyzeDocumentCommand";
// import { TextractClient } from "@aws-sdk/client-textract/dist-types/TextractClient";
// import React, { useState } from "react";

// const Textract = () => {
//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);

//   const textractClient = new TextractClient({
//     region: "us-east-1",
//     credentials: {
//       accessKeyId: "",
//       secretAccessKey: "",
//     },
//   });

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleAnalyzeDocument = async () => {
//     if (!file) return;

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const params = {
//         Document: {
//           Bytes: new Uint8Array(arrayBuffer),
//         },
//         FeatureTypes: ["FORMS", "TABLES"], // Specify the type of features to extract
//       };

//       const command = new AnalyzeDocumentCommand(params);
//       const response = await textractClient.send(command);

//       setResult(response);
//     } catch (error) {
//       console.error("Error analyzing document:", error);
//     }
//   };

//   const extractText = (blocks) => {
//     return blocks
//       .filter((block) => block.BlockType === "LINE")
//       .map((line) => line.Text)
//       .join("\n");
//   };

//   return (
//     <div>
//       <input
//         type="file"
//         accept="image/*,application/pdf"
//         onChange={handleFileChange}
//       />
//       <button onClick={handleAnalyzeDocument}>Analyze Document</button>
//       {result && (
//         <div>
//           <h2>Extracted Text:</h2>
//           <pre>{extractText(result.Blocks || [])}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Textract;

import React, { useState } from "react";
import {
  TextractClient,
  AnalyzeDocumentCommand,
  AnalyzeDocumentCommandOutput,
} from "@aws-sdk/client-textract";
import { json } from "stream/consumers";

const Textract: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeDocumentCommandOutput | null>(
    null
  );

  type ExtractedData = {
    name: string;
    dob: string;
    age: number;
  };
  
  const processText = (text: string): ExtractedData | null => {
    const nameMatch = text.match(/Name\s*:\s*(.+)/i);
    const dobMatch = text.match(/DOB\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/);
    const ageMatch = text.match(/Age\s*:\s*(\d+)/i);
  
    if (nameMatch && dobMatch && ageMatch) {
      const name = nameMatch[1].trim();
      const dob = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`;
      const age = parseInt(ageMatch[1], 10);
  
      return { name, dob, age };
    }
    return null;
  };


  const textractClient = new TextractClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: "", // textract accesskey
      secretAccessKey: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const params = {
        Document: {
          Bytes: new Uint8Array(arrayBuffer),
        },
        FeatureTypes: ["FORMS", "TABLES"],
      };

      const command = new AnalyzeDocumentCommand(params);
      const response: AnalyzeDocumentCommandOutput = await textractClient.send(
        command
      );
      setResult(response);
    } catch (error) {
      console.error("Error analyzing document:", error);
    }
  };

  const extractText = (blocks: any[] = []): string => {
    console.log(blocks);
    const data = blocks
      .filter((block) => block.BlockType === "LINE")
      .map((line) => line.Text)
      .join("\n");
    // const json = JSON.parse(data);
    console.log("Form data : ", processText(data));

    return data;
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />
      <button onClick={handleAnalyzeDocument}>Analyze Document</button>
      {result && (
        <div>
          <h2>Extracted Text:</h2>
          <pre>{extractText(result.Blocks || [])}</pre>
        </div>
      )}
    </div>
  );
};


export default Textract;
