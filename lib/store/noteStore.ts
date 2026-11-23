import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NoteFormValues } from "@/types/note";

type NoteDraftStore = {
  draft: NoteFormValues;
  setDraft: (note: Partial<NoteFormValues>) => void;
  clearDraft: () => void;
};

const initialDraft: NoteFormValues = {
  title: "",
  content: "",
  tag: "Todo",
};

export const useNoteStore = create<NoteDraftStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setDraft: (note) =>
        set((state) => ({ draft: { ...state.draft, ...note } })),
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "note-draft",
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);
