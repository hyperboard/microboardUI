import { api } from "../base/base";
import type { UpdateUserPayload, User, UpdateUserNewsletter } from "./types";

export function getMe() {
  return api.get<User>("/users/me");
}

export function getUsers(search?: string, limit = 20) {
  return api.get<User[]>("/users", {
    query: search
      ? new URLSearchParams({ search, limit: limit.toString() })
      : undefined,
  });
}

export function updateMe(payload: UpdateUserPayload, signal?: AbortSignal) {
  return api.patch("/users/me", payload, {
    signal,
  });
}

export function updateNewsletter(
  payload: UpdateUserNewsletter,
  signal?: AbortSignal,
) {
  return api.patch("/users/me/newsletter", payload, {
    signal,
  });
}

export async function uploadAvatar(avatar: File) {
  const response = await api.post<{ uploadUrl: string; url: string }>(
    "/users/me/avatar/upload-url",
    {
      fileSize: avatar.size,
      fileType: avatar.type,
    },
  );

  if (!response.data) {
    console.error("No response data");
    return;
  }

  const { uploadUrl, url } = response.data;

  const uploadResult = await api.putRawExternal(uploadUrl, avatar);

  if (!uploadResult.ok) {
    throw new Error("Failed to upload image to storage");
  }

  return { url };
}

export function removeAvatar() {
  return api.delete("/users/me/avatar");
}
