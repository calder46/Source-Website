import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { AcademicStorageBridge } from "@/components/academic-storage-bridge";

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
  const frame = useRef<HTMLIFrameElement>(null);
  return (
    <>
    <AcademicStorageBridge frame={frame} />
    <iframe
      ref={frame}
      className="source-website-frame"
      src="/source-website/index.html"
      title="FastTrak academic planning website"
    />
    </>
  );
}
