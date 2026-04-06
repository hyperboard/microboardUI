import { conf } from "microboard-temp";
import { authenticatedFetch } from "../base/authenticatedFetch";

const uploadSvgDirectly = async (
  blob: Blob,
  boardId: string,
  baseUrl?: string,
): Promise<string> => {
  const response = await authenticatedFetch(
    `${baseUrl || ""}/svg/${boardId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "image/svg+xml",
      },
      body: blob,
    },
    boardId,
  );

  if (!response.ok) {
    conf.hooks.onUploadMediaError(response, "image");
    throw new Error(`Failed to upload SVG. Status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.url) {
    throw new Error("Server did not provide a key for the uploaded SVG.");
  }

  return data.url;
};

const uploadWithPresignedUrl = async (
  blob: Blob,
  boardId: string,
  type: "video" | "audio" | "image",
  baseUrl?: string,
): Promise<string> => {
  const generateUrlResponse = await authenticatedFetch(
    `${baseUrl || ""}/media/upload`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileSize: blob.size,
        fileType: blob.type,
        boardId: boardId,
      }),
    },
    boardId,
  );

  if (!generateUrlResponse.ok) {
    conf.hooks.onUploadMediaError(generateUrlResponse, type);
    throw new Error(
      `Failed to get presigned URL. Status: ${generateUrlResponse.status}`,
    );
  }

  const data = await generateUrlResponse.json();
  const { uploadUrl, url } = data;

  if (!uploadUrl || !url) {
    throw new Error(
      "Server did not provide an uploadUrl or key in the response.",
    );
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": blob.type,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    console.error(
      "Direct upload to storage failed:",
      uploadResponse.status,
      uploadResponse.statusText,
    );
    throw new Error(
      `Direct upload to storage failed. Status: ${uploadResponse.status}`,
    );
  }

  return url;
};

export const uploadMediaToStorage = async (
  blob: Blob,
  boardId: string,
  type: "video" | "audio" | "image",
  baseUrl?: string,
): Promise<string> => {
  try {
    if (blob.type === "image/svg+xml") {
      return await uploadSvgDirectly(blob, boardId, baseUrl);
    } else {
      return await uploadWithPresignedUrl(blob, boardId, type, baseUrl);
    }
  } catch (error) {
    console.error("Media upload process error:", error);
    throw error;
  }
};
