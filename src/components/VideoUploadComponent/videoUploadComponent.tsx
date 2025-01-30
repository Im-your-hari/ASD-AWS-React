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
  progress: number; // New field for tracking upload progress
}

const VideoUploadComponent: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<VideoFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      const newVideoFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        uploadStatus: "Pending",
        analyzingStatus: "Pending",
        progress: 0, // Initialize progress to 0%
      }));
      setUploadedFiles(newVideoFiles);
    }
  };

  const uploadVideos = async (): Promise<void> => {
    if (!files) {
      alert("Please select video files to upload!");
      return;
    }

    const updatedVideoFiles = [...uploadedFiles];

    const uploadTasks = Array.from(files).map(async (file, index) => {
      const fileName = `${Date.now()}-${file.name}`;

      // Update upload status to "Uploading"
      updatedVideoFiles[index].uploadStatus = "Uploading";
      setVideoFiles([...updatedVideoFiles]);

      try {
        if (file.size <= CHUNK_SIZE) {
          // Direct upload for small files
          await uploadDirect(file, (progress) => {
            updatedVideoFiles[index].progress = progress;
            setVideoFiles([...updatedVideoFiles]);
          });
        } else {
          // Multipart upload for large files
          const { UploadId } = await createMultipartUpload(fileName);
          const totalParts = Math.ceil(file.size / CHUNK_SIZE);
          const uploadPromises = [];
          let uploadedSize = 0;

          for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
            const start = (partNumber - 1) * CHUNK_SIZE;
            const end = partNumber * CHUNK_SIZE;
            const blob = file.slice(start, end);

            uploadPromises.push(
              uploadPart(
                UploadId!,
                fileName,
                blob,
                partNumber,
                file.size,
                (progress) => {
                  uploadedSize += blob.size;
                  updatedVideoFiles[index].progress = Math.min(
                    100,
                    Math.round((uploadedSize / file.size) * 100)
                  );
                  setVideoFiles([...updatedVideoFiles]);
                }
              )
            );
          }

          const uploadedParts = await Promise.all(uploadPromises);
          await completeMultipartUpload(UploadId!, fileName, uploadedParts);
        }

        // Update upload status to "Uploaded"
        updatedVideoFiles[index].uploadStatus = "Uploaded";
        updatedVideoFiles[index].progress = 100;
        setVideoFiles([...updatedVideoFiles]);
      } catch (error) {
        console.error("Error uploading file:", file.name, error);
        updatedVideoFiles[index].uploadStatus = "Failed";
        updatedVideoFiles[index].progress = 0;
        setVideoFiles([...updatedVideoFiles]);
      }
    });

    await Promise.all(uploadTasks);

    // alert("All uploads completed!");
  };

  return (
    <div className="container mt-3">
      <h5 className="card-title mb-3">Video Upload</h5>
      <div
        className="mb-2"
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        <input
          style={{
            width: "70%",
            marginRight: "30px",
            height: "40px",
          }}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileChange}
          className="form-control"
        />
        <button
          className="btn btn-primary mb-4"
          onClick={uploadVideos}
          disabled={!files}
        >
          Upload Videos
        </button>
      </div>

      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>File Name</th>
            <th>Upload Status</th>
            {/* <th>Progress</th> */}
            <th>Analyzing Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videoFiles.map((file, index) => (
            <tr key={index}>
              <td>{file.name}</td>
              {/* <td>{file.uploadStatus}</td> */}
              <td>
                {file.uploadStatus === "Uploading" ? (
                  <div className="progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${file.progress}%` }}
                      aria-valuenow={file.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {file.progress}%
                    </div>
                  </div>
                ) : (
                  file.uploadStatus
                )}
              </td>
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
