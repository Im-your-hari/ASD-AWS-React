import React, { useState } from "react";
import {
  createMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  UploadedPart,
  uploadDirect,
} from "./multipart-upload-service";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

const MultipartUpload: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const uploadFiles = async (): Promise<void> => {
    if (!files) {
      alert("Please select files to upload!");
      return;
    }

    const progressArray = Array.from({ length: files.length }, () => 0);
    setUploadProgress(progressArray);

    const uploadTasks = Array.from(files).map(async (file, index) => {
      const fileName = `${Date.now()}-${file.name}`;
      
      if (file.size <= CHUNK_SIZE) {
        // Multipart upload for files less than or equal to 5MB
        const { UploadId } = await createMultipartUpload(fileName);
        const blob = file.slice(0, file.size); // The entire file as a single part
        
        const uploadedPart = await uploadPart(
          UploadId!,
          fileName,
          blob,
          1, // Only one part for small files
          file.size
        );
        
        await completeMultipartUpload(UploadId!, fileName, [uploadedPart]);
        progressArray[index] = 100;
        setUploadProgress([...progressArray]);
      } else {
        // Multipart upload for files greater than 5MB
        const { UploadId } = await createMultipartUpload(fileName);
        const totalParts = Math.ceil(file.size / CHUNK_SIZE);
        const uploadPromises: Promise<UploadedPart>[] = [];
        let uploadedSize = 0;

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          const start = (partNumber - 1) * CHUNK_SIZE;
          const end = partNumber * CHUNK_SIZE;
          const blob = file.slice(start, end);

          uploadPromises.push(
            uploadPart(UploadId!, fileName, blob, partNumber, file.size).then((uploadedPart) => {
              uploadedSize += blob.size;
              const progress = Math.min((uploadedSize / file.size) * 100, 100);
              progressArray[index] = progress;
              setUploadProgress([...progressArray]);
              return uploadedPart;
            })
          );
        }

        const uploadedParts = await Promise.all(uploadPromises);
        await completeMultipartUpload(UploadId!, fileName, uploadedParts);
        progressArray[index] = 100;
        setUploadProgress([...progressArray]);
      }
    });

    try {
      await Promise.all(uploadTasks);
      alert("All files uploaded successfully!");
    } catch (error) {
      console.error("Error during file upload:", error);
      alert("File upload failed. Check console for details.");
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={uploadFiles}>Upload Files</button>
      {uploadProgress.length > 0 &&
        uploadProgress.map((progress, index) => (
          <p key={index}>File {index + 1}: {progress.toFixed(2)}%</p>
        ))}
    </div>
  );
};

export default MultipartUpload;
