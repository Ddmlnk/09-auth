import { cookies } from "next/headers";
import type { AxiosResponse } from "axios";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";
import { api } from "./api";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface SessionResponse {
  success: boolean;
}

const getCookieHeaders = async () => {
  const cookieStore = await cookies();
  return { Cookie: cookieStore.toString() };
};

export const fetchNotes = async (
  page: number,
  search?: string,
  tag?: string,
): Promise<FetchNotesResponse> => {
  const { data } = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage: 12,
      search: search || undefined,
      tag: tag || undefined,
    },
    headers: await getCookieHeaders(),
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`, {
    headers: await getCookieHeaders(),
  });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/users/me", {
    headers: await getCookieHeaders(),
  });
  return data;
};

export const checkSession = async (): Promise<
  AxiosResponse<SessionResponse>
> => {
  return api.get<SessionResponse>("/auth/session", {
    headers: await getCookieHeaders(),
  });
};
