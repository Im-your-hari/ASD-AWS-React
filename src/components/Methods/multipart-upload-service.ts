import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "./aws-config";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploadedPart {
  ETag: string;
  PartNumber: number;
}

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

export const createMultipartUpload = async (fileName: string) => {
  const command = new CreateMultipartUploadCommand({
    Bucket: "asd-exp-image",
    Key: fileName,
  });
  return await s3Client.send(command);
};

export const uploadPart = async (
  uploadId: string,
  fileName: string,
  chunk: Blob,
  partNumber: number,
  fileSize: number,
  onProgress?: (progress: number) => void // Progress callback
): Promise<UploadedPart> => {
  const arrayBuffer = await blobToArrayBuffer(chunk);
  const command = new UploadPartCommand({
    Bucket: "asd-exp-image",
    Key: fileName,
    PartNumber: partNumber,
    UploadId: uploadId,
    Body: arrayBuffer,
  });

  const response = await s3Client.send(command);

  if (onProgress) {
    onProgress(Math.round((partNumber * chunk.size * 100) / fileSize)); // Update progress
  }

  return {
    ETag: response.ETag!,
    PartNumber: partNumber,
  };
};

export const completeMultipartUpload = async (
  uploadId: string,
  fileName: string,
  parts: UploadedPart[]
): Promise<void> => {
  const command = new CompleteMultipartUploadCommand({
    Bucket: "asd-exp-image",
    Key: fileName,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });

  await s3Client.send(command);
};

export const uploadDirect = async (
  file: File,
  onProgress?: (progress: number) => void // Progress callback
): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: "asd-exp-image",
    Key: file.name,
    Body: body,
    ContentType: file.type,
  });

  await s3Client.send(command);

  if (onProgress) {
    onProgress(100); // Mark as fully uploaded
  }
};

export const uploadDirectImage = async (file: File): Promise<void> => {
  const objectKey = `${Date.now()}-${file.name}`;

  // Convert File to ArrayBuffer before uploading
  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer); // Convert to Uint8Array

  const command = new PutObjectCommand({
    Bucket: "asd-exp-image",
    Key: objectKey,
    Body: body, // Pass Uint8Array instead of File/Blob
    ContentType: file.type, // Ensure correct MIME type
  });

  await s3Client.send(command);
};
