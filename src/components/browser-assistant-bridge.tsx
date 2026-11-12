import { useEffect, type RefObject } from 'react';
import { askAssistant } from '@/lib/assistant.functions';
import { supabase } from '@/integrations/supabase/client';

/** Relays chat requests from the static site iframe to the hosted assistant. */
export function BrowserAssistantBridge({ frame }: { frame: RefObject<HTMLIFrameElement | null> }) {
  useEffect(() => {
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
        let profile: unknown = null;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) profile = (await supabase.from('profiles').select('current_degree,classification,course_records').eq('id', session.user.id).maybeSingle()).data;
        } catch { /* signed-out or offline */ }
        const result = await askAssistant({ data: { messages, context: typeof context === 'string' ? context : '', profile } });
        send(result);
      } catch {
        send({ error: 'The assistant is unavailable right now. Please try again.' });
      } finally {
        busy = false;
      }
    };
    window.addEventListener('message', receive);
    return () => { disposed = true; window.removeEventListener('message', receive); };
  }, [frame]);
  return null;
}
