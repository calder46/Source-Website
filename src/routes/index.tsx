import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FastTrak | Academic Planning" },
      { name: "description", content: "Search courses, review your schedule, and explore your FastTrak degree completion plan." },
      { property: "og:title", content: "FastTrak | Academic Planning" },
      { property: "og:description", content: "Search courses, review your schedule, and explore your FastTrak degree completion plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      className="source-website-frame"
      src="/source-website/index.html"
      title="FastTrak academic planning website"
    />
  );
}
