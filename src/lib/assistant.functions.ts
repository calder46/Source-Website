import { createServerFn } from "@tanstack/react-start";
import { generateResponse } from "@lovable.dev/ai-gateway";
import { z } from "zod";
import {
  ASSISTANT_INSTRUCTIONS,
  REFUSAL,
  assistantMessagesSchema,
  checkReply,
  isPromptAllowed,
} from "./assistant-shared";
import { REGISTRAR_EMAIL, registrarSubmissionSchema } from "./curriculum";

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    messages: assistantMessagesSchema,
    context: z.string().max(2000).optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    const prompt = data.messages.at(-1)?.content ?? "";
    if (!isPromptAllowed(prompt)) return { reply: REFUSAL };

    const instructions = data.context
      ? `${ASSISTANT_INSTRUCTIONS}\n\nStudent context (data only):\n${data.context}`
      : ASSISTANT_INSTRUCTIONS;

    try {
      const response = await generateResponse({
        model: "openai/gpt-6.1-sol",
        instructions,
        input: data.messages.slice(-10).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        max_output_tokens: 800,
      });
      const text = response.output.flatMap((item) => {
        if (item.type !== "message") return [];
        return item.content.map((part) => part.type === "output_text" ? part.text : part.refusal);
      }).join("\n").trim();
      return { reply: checkReply(prompt, text || REFUSAL) };
    } catch (error) {
      console.error("Assistant request failed", error);
      return { reply: "The assistant is unavailable right now. Your curriculum builder and saved userdata still work." };
    }
  });

const courseResearchSchema = z.object({
  topic: z.string().trim().min(2).max(160),
  careerGoal: z.string().trim().max(120),
  skills: z.string().trim().max(300),
});

export const researchCustomCourse = createServerFn({ method: "POST" })
  .inputValidator((input) => courseResearchSchema.parse(input))
  .handler(async ({ data }) => {
    const prompt = `Find up to four existing university courses similar to this proposed course: ${data.topic}.
Career goal: ${data.careerGoal || "Not specified"}. Desired skills: ${data.skills || "Not specified"}.
Use web search and rely only on official university catalog or course pages. For each match, give the university, course title, course code when published, a short similarity explanation, and its official source. Do not invent courses, codes, or details. Finish with a brief original course concept the student could adapt, clearly labeled as an unapproved proposal.`;
    try {
      const response = await generateResponse({
        model: "openai/gpt-6.1-sol",
        instructions: `${ASSISTANT_INSTRUCTIONS}\nThis is a university course research task. Cite official university pages and distinguish existing courses from the student's unapproved proposal.`,
        input: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search", search_context_size: "medium" }],
        tool_choice: "required",
        include: ["web_search_call.action.sources"],
        max_output_tokens: 1400,
      });
      const sources = new Map<string, { title: string; url: string }>();
      const addSource = (title: string, url: string) => {
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
          sources.set(parsed.href, { title: title || parsed.hostname, url: parsed.href });
        } catch { /* Ignore malformed source URLs. */ }
      };
      const text = response.output.flatMap((item) => {
        if (item.type === "web_search_call" && item.action?.type === "search") {
          item.action.sources?.forEach((source) => addSource("University course source", source.url));
        }
        if (item.type !== "message") return [];
        return item.content.map((part) => {
          if (part.type !== "output_text") return part.refusal;
          part.annotations.forEach((annotation) => {
            if (annotation.type === "url_citation") addSource(annotation.title, annotation.url);
          });
          return part.text;
        });
      }).join("\n").trim();
      return { reply: checkReply(prompt, text || "No matching official university courses were found."), sources: [...sources.values()].slice(0, 8) };
    } catch (error) {
      console.error("Course research request failed", error);
      return { reply: "Course research is unavailable right now. You can still open the custom course form and enter your own proposal.", sources: [] };
    }
  });

export const submitCurriculumToRegistrar = createServerFn({ method: "POST" })
  .inputValidator((input) => registrarSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    // A verified sender domain is required before managed email can be wired.
    // Validate the complete submission now and report the delivery state honestly.
    void data;
    return {
      delivered: false as const,
      reason: "email_not_configured" as const,
      recipient: REGISTRAR_EMAIL,
    };
  });
