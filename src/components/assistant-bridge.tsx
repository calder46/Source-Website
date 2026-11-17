import { useEffect, type RefObject } from "react";
import { askAssistant, researchCustomCourse, submitCurriculumToRegistrar } from "@/lib/assistant.functions";

export function AssistantBridge({ frame }: { frame: RefObject<HTMLIFrameElement | null> }) {
  useEffect(() => {
    const send = (data: unknown) => frame.current?.contentWindow?.postMessage(data, window.location.origin);

    const receive = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const requestId = event.data?.requestId;
      if (typeof requestId !== "string" || requestId.length > 100) return;

      if (event.data?.type === "browser-assistant-request") {
        try {
          const result = await askAssistant({ data: {
            messages: event.data.messages,
            context: typeof event.data.context === "string" ? event.data.context : "",
          } });
          send({ type: "browser-assistant-response", requestId, reply: result.reply });
        } catch {
          send({ type: "browser-assistant-response", requestId, error: "The assistant could not answer. Please try again." });
        }
      }

      if (event.data?.type === "registrar-submission-request") {
        try {
          const result = await submitCurriculumToRegistrar({ data: event.data.payload });
          send({ type: "registrar-submission-response", requestId, result });
        } catch {
          send({ type: "registrar-submission-response", requestId, error: "Check every required field and an essay of at least 100 characters." });
        }
      }
    };

    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [frame]);

  return null;
}
