import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {  uploadDirectImage } from "../Methods/multipart-upload-service";
const API_URL = "https://zoxpu8wuzg.execute-api.us-east-1.amazonaws.com/Staging";
type ExtractedData = {
  name: string | null;
  dob: string | null;
  age: number | null;
  phone: string | null;
  email: string | null;
};

const ImageUploader: React.FC =  ({ responseData }: { responseData: ExtractedData | null }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number | null>(null);

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Preview image
      setPercentage(null); // Reset previous percentage
    }
  };

  // Upload image to S3
  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    setUploading(true);

    try {
      // Generate file name
      const objectKey = `${Date.now()}-${image.name}`;

      // Upload image to S3
      await uploadDirectImage(image);

      // Construct S3 image URL (modify based on your bucket configuration)
      // const imageUrl = `https://your-bucket-name.s3.YOUR_REGION.amazonaws.com/${objectKey}`;

      // Prepare request body
      const requestBody = {
        name: responseData?.name,
        dob: responseData?.dob,
        objectKey: objectKey,
        asdPercentage: 60
      };

      // Call API with uploaded image data
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to get percentage response from API.");
      }

      const data = await response.json();
 
      const h = JSON.parse(data.body);
      console.log(h);
      setPercentage(h.asdPercentage);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to upload image or fetch percentage.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card p-3 shadow-sm">
        <h6 className="card-title mb-3">Upload Image</h6>

        {/* File Input */}
        <div className="d-flex flex-column align-items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control form-control-sm mb-2"
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-3 text-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="img-fluid mb-2"
              style={{ maxHeight: "200px", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Upload Button */}
        {image && (
          <button
            className="btn btn-primary btn-sm w-100"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        )}

        {/* Display Percentage Response */}
        {percentage !== null && (
          <div className="mt-3 text-center">
          <strong>Autism Spectrum Assessment Score: </strong>
          <span 
            className="fw-bolder" 
            style={{ color: percentage >= 60 ? '#dc3545' : 'inherit' }}
          >
            {percentage}%
          </span>
        </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
