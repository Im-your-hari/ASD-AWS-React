import React, { useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  uploadDirect,
  createMultipartUpload,
  uploadPart,
  completeMultipartUpload,
} from "../Methods/multipart-upload-service";
import SocketService from "../Methods/socket-service";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const video_API_URL =
  "https://zoxpu8wuzg.execute-api.us-east-1.amazonaws.com/Staging/videoAnalysis";
const videoCheckingApi =
  "https://oaoqzhl83h.execute-api.us-east-1.amazonaws.com/staging";

interface VideoFile {
  timeStampName: string;
  name: string;
  size: number;
  uploadStatus: string;
  analyzingStatus: string;
  progress: number; // New field for tracking upload progress
}

type ExtractedData = {
  name: string | null;
  dob: string | null;
  age: number | null;
  phone: string | null;
  email: string | null;
};

const VideoUploadComponent: React.FC = ({
  responseData,
}: {
  responseData: ExtractedData | null;
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<VideoFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setFiles(null);
      clearFileInput();
      try {
        if (file.size <= CHUNK_SIZE) {
          // Direct upload for small files
          await uploadDirect(file, fileName, (progress) => {
            updatedVideoFiles[index].progress = progress;
            updatedVideoFiles[index].timeStampName = fileName;
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
                  updatedVideoFiles[index].timeStampName = fileName;
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
        updatedVideoFiles[index].timeStampName = fileName;
        setVideoFiles([...updatedVideoFiles]);
        registerVideoToDb(fileName);
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

  const registerVideoToDb = async (fileName: string) => {
    try {
      const response = await fetch(video_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: responseData?.name,
          dob: responseData?.dob,
          objectKey: fileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API Success:", data);

      // Perform some function on success
      // listenToScoket();
      fetchDataRecursively(fileName);
    } catch (error) {
      console.error("API Call Failed:", error);
    }
  };

  const listenToScoket = () => {
    console.log("Performing some function after API success...");

    const socketService = SocketService.getInstance();

    // Listen for database updates
    const handleSocketUpdate = (data: any) => {
      if (data.type === "db_update") {
        console.log("Database changed!", data);
        // Perform your action here
      }
    };

    // Register listener
    socketService.addListener(handleSocketUpdate);

    // Optionally, remove the listener when no longer needed
    return () => {
      socketService.removeListener(handleSocketUpdate);
    };
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear input field
    }
  };

  const fetchDataRecursively = async (fileName: string): Promise<void> => {
    try {
      const response = await fetch(videoCheckingApi);
      const data = await response.json();

      if (data.body) {
        const rows = JSON.parse(data.body);
        console.log(rows);
        const isCompleted = rows.filter(
          (x: any) => x.fileName == fileName && x.videoStatus == "COMPLETED"
        );
        // if (isCompleted && isCompleted.length > 0) {
        //   const updatedVideoFiles = [...videoFiles];
        //   const videoIndex = isCompleted.findIndex(
        //     (x) => x.fileName == fileName && x.videoStatus == "COMPLETED"
        //   );
        //   updatedVideoFiles[videoIndex].analyzingStatus = "Completed";
        //   setVideoFiles([...updatedVideoFiles]);
        //   return;
        // }

        const completedVideo = rows.find(
          (x: any) => x.fileName === fileName && x.videoStatus === "COMPLETED"
        );

        if (completedVideo) {
          setVideoFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.timeStampName === fileName
                ? { ...file, analyzingStatus: "Completed" }
                : file
            )
          );
          return;
        }
      }

      // If not found, call the API recursively with a delay (optional)
      return await new Promise((resolve) =>
        setTimeout(() => resolve(fetchDataRecursively(fileName)), 3000)
      );
    } catch (error) {
      console.error("Error fetching data", error);
      throw error; // Throw error to handle it outside
    }
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
          ref={fileInputRef}
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
                  disabled={file.analyzingStatus !== "Completed"}
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
