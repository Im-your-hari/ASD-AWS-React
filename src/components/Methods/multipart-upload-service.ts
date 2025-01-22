import {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
  import { s3Client } from "./aws-config";
  
  const CHUNK_SIZE = 5 * 1024 * 1024;
  
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
    fileSize: number
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
  
  export const uploadDirect = async (file: File): Promise<void> => {
    const command = new PutObjectCommand({
      Bucket: "asd-exp-image",
      Key: `${Date.now()}-${file.name}`,
      Body: file,
    });
  
    await s3Client.send(command);
  };
  