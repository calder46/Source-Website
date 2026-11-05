import { createFileRoute } from "@tanstack/react-router";
import { generateResponse } from "@lovable.dev/ai-gateway";

type Msg = { role: "user" | "assistant"; content: string };

const INSTRUCTIONS =
  "You are the FastTrak assistant, a friendly academic planning helper inside a course registration and degree planning site. Help students with course search, scheduling, prerequisites, degree completion plans, GPA questions and study planning. FastTrak's catalog and degree plans are illustrative, not official Liberty University records; say so when relevant. Keep answers concise and use simple markdown.";

export const Route = createFileRoute("/api/public/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let messages: Msg[];
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (!Array.isArray(body.messages)) throw new Error();
          messages = body.messages
            .filter(
              (m): m is Msg =>
                !!m &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string",
            )
            .slice(-30)
            .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
          if (!messages.length) throw new Error();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        try {
          const res = await generateResponse({
            model: "openai/gpt-6-astra",
            instructions: INSTRUCTIONS,
            input: messages,
          });
          let reply = "";
          for (const item of res.output ?? []) {
            if (item.type === "message") {
              for (const c of item.content) if (c.type === "output_text") reply += c.text;
            }
          }
          return Response.json({ reply: reply || "Sorry, I couldn't come up with an answer." });
        } catch (e) {
          console.error("assistant error", e);
          return Response.json(
            { error: "The assistant is unavailable right now. Please try again." },
            { status: 502 },
          );
        }
      },
    },
  },
});
