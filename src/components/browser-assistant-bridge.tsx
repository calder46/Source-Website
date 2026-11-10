import { useEffect, type RefObject } from 'react';
import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';
import { checkReply, isPromptAllowed, REFUSAL } from '@/lib/assistant-guardrails';
import { ASSISTANT_INSTRUCTIONS, BROWSER_MODEL, buildStudentContext, parseAssistantMessages } from '@/lib/browser-assistant';
import { supabase } from '@/integrations/supabase/client';

export function BrowserAssistantBridge({ frame }: { frame: RefObject<HTMLIFrameElement | null> }) {
  useEffect(() => {
    let worker: Worker | undefined;
    let engine: WebWorkerMLCEngine | undefined;
    let busy = false;
    let disposed = false;
    const receive = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== 'browser-assistant-request') return;
      const { requestId, messages, context } = event.data;
      if (typeof requestId !== 'string' || requestId.length > 100) return;
      const source = event.source as Window;
      const send = (data: object) => {
        if (!disposed && frame.current?.contentWindow === source) source.postMessage({ type: 'browser-assistant-response', requestId, ...data }, window.location.origin);
      };
      if (busy) { send({ error: 'The assistant is still working. Please wait.' }); return; }
      busy = true;
      try {
        const history = parseAssistantMessages(messages);
        const prompt = history[history.length - 1]?.content ?? '';
        if (!isPromptAllowed(prompt)) { send({ reply: REFUSAL }); return; }
        if (!('gpu' in navigator)) throw new Error('This browser does not support WebGPU. Try a current Chrome or Edge browser on a compatible device.');
        if (!engine) {
          send({ progress: 'Preparing Qwen · first use downloads model files…' });
          try { await navigator.storage?.persist?.(); } catch { /* best effort */ }
          const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
          if (disposed) return;
          worker = new Worker(new URL('../lib/browser-assistant.worker.ts', import.meta.url), { type: 'module' });
          engine = await CreateWebWorkerMLCEngine(worker, BROWSER_MODEL, {
            initProgressCallback: (progress) => send({ progress: progress.text }),
          }, { context_window_size: 4096 });
        }
        if (disposed) return;
        send({ progress: 'Thinking…' });
        let records: unknown = null;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) records = (await supabase.from('profiles').select('current_degree,classification,course_records').eq('id', session.user.id).maybeSingle()).data;
        } catch { /* signed-out or offline: skip */ }
        const student = buildStudentContext(typeof context === 'string' ? context : '', records);
        const result = await engine.chat.completions.create({
          messages: [{ role: 'system', content: student ? `${ASSISTANT_INSTRUCTIONS}\n\n${student}` : ASSISTANT_INSTRUCTIONS }, ...history.slice(-6)],
          max_tokens: 512,
          temperature: 0.6,
          stream: false,
        });
        const reply = result.choices[0]?.message.content?.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        if (!reply) throw new Error('Qwen returned no answer. Try a shorter question.');
        send({ reply: checkReply(prompt, reply) });
      } catch (error) {
        worker?.terminate();
        worker = undefined;
        engine = undefined;
        send({ error: error instanceof Error ? error.message : 'The local model could not start. Check your browser, available memory, and internet connection for the model download.' });
      } finally {
        busy = false;
      }
    };
    window.addEventListener('message', receive);
    return () => {
      disposed = true;
      window.removeEventListener('message', receive);
      worker?.terminate();
    };
  }, [frame]);
  return null;
}