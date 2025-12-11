import { fileTypeFromBuffer } from "file-type";

export const getMimeType = async (buffer: Buffer<ArrayBufferLike>) => {
  const result = await fileTypeFromBuffer(buffer);
  return result?.mime || "";
};

export const isAnImage = async (buffer: Buffer<ArrayBufferLike>) =>
  (await getMimeType(buffer)).startsWith("image");
