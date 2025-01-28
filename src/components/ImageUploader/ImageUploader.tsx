import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);

  // Handle file input change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Preview image

      // Simulate API call after selecting the file
      try {
        // Simulate API call and get percentage response
        const simulatedPercentage = Math.floor(Math.random() * 100); // Random percentage for demonstration

        // Simulate a delay to mimic an API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Set the percentage response
        setPercentage(simulatedPercentage);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  return (
    <div className="card p-3 shadow-sm">
      <h6 className="card-title mb-3">Upload Image</h6>

      {/* File input */}
      <div className="d-flex flex-column align-items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="form-control form-control-sm mb-2"
        />
      </div>

      {/* Image Preview and Percentage Response */}
      {imagePreview && (
        <div className="mt-3 text-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="img-fluid mb-2"
            style={{ maxHeight: '200px', objectFit: 'cover', marginBottom: '10px' }}
          />
          {percentage !== null && (
            <div>
              <strong>Percentage:</strong> {percentage}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
