import { prepareImage } from "./imageHelpers";
import { uploadMediaToStorage } from "./mediaApi";

export const getVideoMetadata = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const { videoWidth: width, videoHeight: height } = video;
      URL.revokeObjectURL(video.src); // Cleanup
      resolve({ width, height });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src); // Cleanup
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
};

export const captureFrame = (
  frameTime: number,
  video: HTMLVideoElement,
): HTMLImageElement | null => {
  video.currentTime = frameTime;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = new Image();
    frame.src = canvas.toDataURL();
    return frame;
  } else {
    return null;
  }
};

export const prepareVideo = (
  file: File,
  boardId: string,
  baseUrl?: string,
): Promise<{
  url: string;
  previewUrl: string;
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      video.onseeked = () => {
        video.onseeked = null;
        const capturedFrame = captureFrame(0.1, video);
        if (!capturedFrame) {
          reject(new Error("Failed to capture video frame"));
          return;
        }
        prepareImage(capturedFrame.src, boardId, baseUrl)
          .then((imageData) => {
            uploadMediaToStorage(file, boardId, "video", baseUrl)
              .then((url) => {
                resolve({
                  url,
                  previewUrl: imageData.storageLink,
                });
              })
              .catch(reject);
          })
          .catch(() => reject(new Error("Failed to load video preview")));
      };
      video.currentTime = 0.1;
    };
    video.onerror = () => {
      reject(new Error("Failed to load video"));
    };
  });
};
