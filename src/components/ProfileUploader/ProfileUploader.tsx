import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

type ApiResponse = {
  name: string;
  age: number;
  email: string;
};

const ProfileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [responseData, setResponseData] = useState<ApiResponse | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // Simulate API call
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    try {
      // Simulated API response
      const simulatedApiResponse: ApiResponse = {
        name: "John Doe",
        age: 30,
        email: "john.doe@example.com",
      };

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResponseData(simulatedApiResponse);
      setFile(null); // Clear file after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  return (
    <div className="container-fluid p-3">
      {!responseData ? (
        <div className="card p-3 shadow-sm">
          <h6 className="card-title mb-2">Input a profile</h6>
          <div className="d-flex align-items-center mb-2">
            <input
              type="file"
              className="form-control form-control-sm me-2"
              onChange={handleFileChange}
              accept=".json, .txt"
              style={{ width: "250px" }} // Reduce the width of the file input
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleUpload}
              disabled={!file}
            >
              Upload
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-2 shadow-sm">
          <h6 className="card-title mb-2">Uploaded Profile Details</h6>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <strong>Name:</strong> {responseData.name}
            </div>
            <div className="me-3">
              <strong>Age:</strong> {responseData.age}
            </div>
            <div>
              <strong>Email:</strong> {responseData.email}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileUploader;
