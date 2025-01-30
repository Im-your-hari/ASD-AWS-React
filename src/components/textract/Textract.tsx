import React, { useState } from "react";
import {
  TextractClient,
  AnalyzeDocumentCommand,
  AnalyzeDocumentCommandOutput,
} from "@aws-sdk/client-textract";
import { accessKeyId, secretAccessKey } from "../Methods/aws-config";

type ExtractedData = {
  name: string | null;
  dob: string | null;
  age: number | null;
  phone: string | null;
  email: string | null;
};

interface TextractProps {
  onExtractComplete: (data: ExtractedData | null) => void;
}

const Textract: React.FC<TextractProps> = ({ onExtractComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [responseData, setResponseData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // ✅ New loading state

  const processText = (text: string): ExtractedData | null => {
    console.log("Extracted Text:", text);
  
    const nameMatch = text.match(/Name\s*:\s*(.+)/i);
    const dobMatch = text.match(/DOB\s*:\s*(\d{2})\/\s*(\d{2})\/\s*(\d{4})/);
    const ageMatch = text.match(/Age\s*:\s*(\d+)/i);
    const phoneMatch = text.match(/Phone\s*:\s*([\+\d\s-]+)/i);
    const emailMatch = text.match(/Email\s*:\s*([\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,})/i);
  
    const extractedData: ExtractedData = {
      name: nameMatch ? nameMatch[1].trim() : null,
      dob: dobMatch ? `${dobMatch[2]}/${dobMatch[1]}/${dobMatch[3]}`.trim() : null, // MM-DD-YYYY format
      age: ageMatch ? parseInt(ageMatch[1], 10) : null,
      phone: phoneMatch ? phoneMatch[1].trim() : null,
      email: emailMatch ? emailMatch[1].trim() : null,
    };
  
    return extractedData.name || extractedData.dob || extractedData.age || extractedData.phone || extractedData.email
      ? extractedData
      : null;
  };
  
  

  const textractClient = new TextractClient({
    region: "us-east-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!file) return;

    setLoading(true); // ✅ Show "Analyzing..." message

    try {
      const arrayBuffer = await file.arrayBuffer();
      const params = {
        Document: {
          Bytes: new Uint8Array(arrayBuffer),
        },
        FeatureTypes: ["FORMS", "TABLES"],
      };

      const command = new AnalyzeDocumentCommand(params);
      const response: AnalyzeDocumentCommandOutput = await textractClient.send(command);

      if (response.Blocks) {
        const extractedText = response.Blocks.filter((block) => block.BlockType === "LINE")
          .map((line) => line.Text)
          .join("\n");

        const extractedData = processText(extractedText);
        setResponseData(extractedData);
        onExtractComplete(extractedData);
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
    }

    setLoading(false); // ✅ Hide "Analyzing..." message after processing
  };

  return (
    <div className="container-fluid p-3">
      {!responseData ? (
        <div className="card p-3 shadow-sm">
          <h6 className="card-title mb-2">Upload a Document</h6>
          <div className="d-flex align-items-center mb-2">
            <input
              type="file"
              className="form-control form-control-sm me-2"
              onChange={handleFileChange}
              style={{ width: "250px" }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleAnalyzeDocument} disabled={!file}>
              Analyze
            </button>
          </div>
          {loading && <div className="text-primary fw-bold">Analyzing...</div>} {/* ✅ Display "Analyzing..." */}
        </div>
      ) : (
        <div className="card p-2 shadow-sm">
          <h6 className="card-title mb-2">Extracted Profile Details</h6>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <strong>Name:</strong> <span className="fw-bold">{responseData.name || "N/A"}</span>
            </div>
            <div className="me-3">
              <strong>Age:</strong> <span className="fw-bold">{responseData.age || "N/A"}</span>
            </div>
            <div className="me-3">
              <strong>DOB:</strong> <span className="fw-bold">{responseData.dob || "N/A"}</span>
            </div>
            <div className="me-3">
              <strong>Phone:</strong> <span className="fw-bold">{responseData.phone || "N/A"}</span>
            </div>
            <div>
              <strong>Email:</strong> <span className="fw-bold">{responseData.email || "N/A"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Textract;
