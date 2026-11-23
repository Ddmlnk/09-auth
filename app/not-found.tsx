import type { Metadata } from "next";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";
import css from "./Home.module.css";

const title = "404 - Page not found | NoteHub";
const description = "Sorry, the page you are looking for does not exist.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/not-found`,
    images: [OG_IMAGE],
  },
};

export default function NotFound() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>404 - Page not found</h1>
        <p className={css.description}>{description}</p>
      </div>
    </main>
  );
}
