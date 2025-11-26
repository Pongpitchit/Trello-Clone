import { Client } from "minio";
import formidable from "formidable";

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: Number(process.env.MINIO_PORT!),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function uploadFile(file: formidable.File, folder = "boards") {
  const fileName = `${folder}/${Date.now()}-${file.originalFilename}`;
  await minioClient.fPutObject(
    process.env.MINIO_BUCKET!,
    fileName,
    file.filepath // <-- expects a path on disk
  );
  return `${process.env.MINIO_BASE_URL}/${fileName}`;
}
