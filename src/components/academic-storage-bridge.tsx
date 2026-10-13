import { useEffect, type RefObject } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

const profileSchema = z.object({
  campus: z.enum(['Residential', 'Online']), current_degree: z.string().max(80),
  academic_standing: z.string().max(80), gpa: z.number().min(0).max(4).nullable(),
  classification: z.string().max(40), program_year: z.string().max(20),
  course_records: z.record(z.string(), z.object({ status: z.enum(['needed','progress','complete']), grade: z.string().max(4), term: z.string().max(40) })),
  service_complete: z.boolean(), graduation_application: z.boolean(),
});

export function AcademicStorageBridge({ frame }: { frame: RefObject<HTMLIFrameElement | null> }) {
  useEffect(() => {
    const send = (data: unknown) => frame.current?.contentWindow?.postMessage(data, window.location.origin);
    const receive = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== 'academic-request') return;
      const { requestId, action, payload } = event.data;
      if (typeof requestId !== 'string') return;
      try {
        let result: unknown = null;
        if (action === 'signin') {
          const credentials = z.object({email: z.string().email(), password: z.string().min(1).max(200)}).parse(payload);
          const { error } = await supabase.auth.signInWithPassword(credentials);
          if (error) throw error;
        } else if (action === 'signup') {
          const credentials = z.object({email: z.string().email(), password: z.string().min(8).max(200)}).parse(payload);
          const { data, error } = await supabase.auth.signUp({...credentials, options: {emailRedirectTo: window.location.origin}});
          if (error) throw error;
          result = { confirmationRequired: !data.session };
        } else if (action === 'google') {
          const response = await lovable.auth.signInWithOAuth('google', {redirect_uri: window.location.origin});
          if (response.error) throw response.error;
        } else if (action === 'signout') {
          const {error} = await supabase.auth.signOut(); if (error) throw error;
        } else if (action === 'load' || action === 'save') {
          const { data: {user}, error } = await supabase.auth.getUser();
          if (!user) {
            if (action === 'save') throw new Error('Sign in to save your student record.');
            result = {signedIn: false, profile: null};
          } else {
            if (error) throw error;
            if (action === 'save') {
              const profile = profileSchema.parse(payload);
              const {error: saveError} = await supabase.from('profiles').upsert({...profile, id:user.id, updated_at: new Date().toISOString()});
              if (saveError) throw saveError;
            }
            const {data: profile, error: readError} = await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
            if (readError) throw readError;
            result = {signedIn:true, profile};
          }
        } else throw new Error('Unknown request.');
        send({type:'academic-response',requestId,result});
      } catch (error) {
        send({type:'academic-response',requestId,error:error instanceof Error ? error.message : 'Your request could not be completed.'});
      }
    };
    window.addEventListener('message',receive);
    const {data:{subscription}} = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') send({type:'academic-auth-changed'});
    });
    return () => {window.removeEventListener('message',receive);subscription.unsubscribe();};
  }, [frame]);
  return null;
}