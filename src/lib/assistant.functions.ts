import { createServerFn } from '@tanstack/react-start';
import { generateResponse } from '@lovable.dev/ai-gateway';
import { checkReply, isPromptAllowed, REFUSAL } from '@/lib/assistant-guardrails';
import { ASSISTANT_INSTRUCTIONS, buildStudentContext, parseAssistantMessages } from '@/lib/browser-assistant';

export const askAssistant = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as { messages?: unknown; context?: unknown; profile?: unknown };
    return {
      messages: parseAssistantMessages(d.messages),
      context: typeof d.context === 'string' ? d.context.slice(0, 1500) : '',
      profile: d.profile && typeof d.profile === 'object' ? d.profile : null,
    };
  })
  .handler(async ({ data }) => {
    const prompt = data.messages[data.messages.length - 1]?.content ?? '';
    if (data.messages[data.messages.length - 1]?.role !== 'user' || !isPromptAllowed(prompt)) return { reply: REFUSAL };
    const student = buildStudentContext(data.context, data.profile);
    try {
      const res = await generateResponse({
        model: 'openai/gpt-6-astra',
        instructions: student ? `${ASSISTANT_INSTRUCTIONS}\n\n${student}` : ASSISTANT_INSTRUCTIONS,
        input: data.messages.slice(-10),
        max_output_tokens: 800,
      });
      let reply = '';
      for (const item of res.output ?? []) {
        if (item.type === 'message') for (const c of item.content) if (c.type === 'output_text') reply += c.text;
      }
      return { reply: checkReply(prompt, reply) };
    } catch (e) {
      console.error('assistant error', e);
      return { error: 'The assistant is unavailable right now. Please try again.' };
    }
  });
