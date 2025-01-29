import React, { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import {
  uploadDirect,
  createMultipartUpload,
  uploadPart,
  completeMultipartUpload,
} from "../Methods/multipart-upload-service";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

interface VideoFile {
  name: string;
  size: number;
  uploadStatus: string;
  analyzingStatus: string;
}

const VideoUploadComponent: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      const newVideoFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        uploadStatus: "Pending",
        analyzingStatus: "Pending",
      }));
      setVideoFiles(newVideoFiles);
    }
  };

  const uploadVideos = async (): Promise<void> => {
    if (!files) {
      alert("Please select video files to upload!");
      return;
    }

    const updatedVideoFiles = [...videoFiles];

    const uploadTasks = Array.from(files).map(async (file, index) => {
      const fileName = `${Date.now()}-${file.name}`;

      // Update upload status to "Uploading"
      updatedVideoFiles[index].uploadStatus = "Uploading";
      setVideoFiles([...updatedVideoFiles]);

      try {
        if (file.size <= CHUNK_SIZE) {
          // Direct upload for small files
          await uploadDirect(file);
        } else {
          // Multipart upload for large files
          const { UploadId } = await createMultipartUpload(fileName);
          const totalParts = Math.ceil(file.size / CHUNK_SIZE);
          const uploadPromises = [];

          for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
            const start = (partNumber - 1) * CHUNK_SIZE;
            const end = partNumber * CHUNK_SIZE;
            const blob = file.slice(start, end);

            uploadPromises.push(
              uploadPart(UploadId!, fileName, blob, partNumber, file.size)
            );
          }

          const uploadedParts = await Promise.all(uploadPromises);
          await completeMultipartUpload(UploadId!, fileName, uploadedParts);
        }

        // Update upload status to "Uploaded"
        updatedVideoFiles[index].uploadStatus = "Uploaded";
        setVideoFiles([...updatedVideoFiles]);
      } catch (error) {
        console.error("Error uploading file:", file.name, error);
        updatedVideoFiles[index].uploadStatus = "Failed";
        setVideoFiles([...updatedVideoFiles]);
      }
    });

    await Promise.all(uploadTasks);

    alert("All uploads completed!");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Video Upload</h2>
      <div className="mb-4">
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileChange}
          className="form-control"
        />
      </div>
      <button
        className="btn btn-primary mb-4"
        onClick={uploadVideos}
        disabled={!files}
      >
        Upload Videos
      </button>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>File Name</th>
            <th>Upload Status</th>
            <th>Analyzing Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videoFiles.map((file, index) => (
            <tr key={index}>
              <td>{file.name}</td>
              <td>{file.uploadStatus}</td>
              <td>{file.analyzingStatus}</td>
              <td>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => alert(`Viewing file: ${file.name}`)}
                  disabled={file.uploadStatus !== "Uploaded"}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoUploadComponent;
