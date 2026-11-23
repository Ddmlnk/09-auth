import { isAxiosError } from "axios";
import type { Note, NoteFormValues } from "@/types/note";
import type { User } from "@/types/user";
import { api } from "./api";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface SessionResponse {
  success: boolean;
}

export type UpdateUserRequest = Pick<User, "username">;

interface ApiErrorResponse {
  error?: string;
  response?: {
    message?: string;
    validation?: { body?: { message?: string } };
  };
}

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    return (
      data?.response?.validation?.body?.message ??
      data?.response?.message ??
      data?.error ??
      error.message
    );
  }
  return "Something went wrong. Please try again.";
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
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (newNote: NoteFormValues): Promise<Note> => {
  const { data } = await api.post<Note>("/notes", newNote);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/notes/${id}`);
  return data;
};

export const register = async (credentials: AuthRequest): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", credentials);
  return data;
};

export const login = async (credentials: AuthRequest): Promise<User> => {
  const { data } = await api.post<User>("/auth/login", credentials);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const checkSession = async (): Promise<boolean> => {
  const { data } = await api.get<SessionResponse>("/auth/session");
  return data.success;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/users/me");
  return data;
};

export const updateMe = async (payload: UpdateUserRequest): Promise<User> => {
  const { data } = await api.patch<User>("/users/me", payload);
  return data;
};
