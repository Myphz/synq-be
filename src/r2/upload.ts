import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { CLOUDFLARE_MEDIA_BUCKET } from "../constants.js";
import { s3Client } from "./client.js";

export const getPresignedUrlForUpload = async ({
  keyPrefix,
  contentType
}: {
  keyPrefix?: string;
  contentType: string;
}) => {
  let key = uuidv4();
  if (keyPrefix) key = `${keyPrefix}/${key}`;

  const cmd = new PutObjectCommand({
    Bucket: CLOUDFLARE_MEDIA_BUCKET,
    Key: key,
    ContentType: contentType
  });

  return await getSignedUrl(s3Client, cmd, { expiresIn: 60 });
};
