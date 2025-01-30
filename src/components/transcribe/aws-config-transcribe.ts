import { S3Client } from "@aws-sdk/client-s3";

export const s3ClientTranscribe = new S3Client({
    region: "us-east-1", // e.g., "us-east-1"
    credentials: {
      accessKeyId: "",  // transcribe creds
      secretAccessKey: "",
    },
});
