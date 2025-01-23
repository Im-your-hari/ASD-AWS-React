import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: "us-west-2", // e.g., "us-east-1"
    credentials: {
      accessKeyId: "AKIAR7HWX6UDFDHK4B6J",
      secretAccessKey: "pcnUcl9N96aKEvcCvhyqB/6mNZ4QxpyXQ2ZqNMl2",
    },
});
