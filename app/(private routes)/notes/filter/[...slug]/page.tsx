import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/serverApi";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";
import { NOTE_TAGS, type NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const filter = slug[0];

  const title =
    filter === "all" ? "All notes | NoteHub" : `${filter} notes | NoteHub`;
  const description =
    filter === "all"
      ? "Browse all your notes in NoteHub."
      : `Browse notes filtered by the "${filter}" tag in NoteHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/notes/filter/${filter}`,
      images: [OG_IMAGE],
    },
  };
}

export default async function NotesPage({ params }: Props) {
  const { slug } = await params;
  const filter = slug[0];

  if (
    slug.length > 1 ||
    (filter !== "all" && !NOTE_TAGS.includes(filter as NoteTag))
  ) {
    notFound();
  }

  const tag = filter === "all" ? undefined : filter;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", 1, "", tag],
    queryFn: () => fetchNotes(1, "", tag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tag ?? "all"} tag={tag} />
    </HydrationBoundary>
  );
}
