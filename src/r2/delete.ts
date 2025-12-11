import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { CLOUDFLARE_MEDIA_BUCKET } from "../constants.js";
import { s3Client } from "./client.js";

export const deleteFromR2 = async (objectNames: string[]) => {
  if (!objectNames.length) return;

  const cmd = new DeleteObjectsCommand({
    Bucket: CLOUDFLARE_MEDIA_BUCKET,
    Delete: {
      Objects: objectNames.map((obj) => ({ Key: obj }))
    }
  });

  await s3Client.send(cmd);
};
