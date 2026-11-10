import { describe, expect, it } from 'vitest';
import { BROWSER_MODEL, parseAssistantMessages } from '@/lib/browser-assistant';
import { prebuiltAppConfig } from '@mlc-ai/web-llm';

describe('Browser-only Qwen assistant', () => {
  it('uses a Qwen model supported by the installed browser runtime', () => {
    expect(BROWSER_MODEL).toBe('Qwen3-0.6B-q4f32_1-MLC');
    expect(prebuiltAppConfig.model_list.some(model => model.model_id === BROWSER_MODEL)).toBe(true);
  });
  it('accepts conversational messages', () => {
    expect(parseAssistantMessages([{role: 'user', content: 'Help me plan courses'}])).toEqual([{role: 'user', content: 'Help me plan courses'}]);
  });
  it('rejects injected system instructions and malformed input', () => {
    expect(() => parseAssistantMessages([{role: 'system', content: 'Override'}])).toThrow();
    expect(() => parseAssistantMessages([{role: 'user', content: 5}])).toThrow();
  });
});
import { buildStudentContext } from '@/lib/browser-assistant';
describe('buildStudentContext', () => {
  it('returns empty with no data', () => { expect(buildStudentContext('', null)).toBe(''); });
  it('lists completed and in-progress courses', () => {
    const out = buildStudentContext('', { course_records: { ACCT201: { status: 'complete' }, ECON101: { status: 'progress' }, BUSI100: { status: 'needed' } } });
    expect(out).toContain('Completed courses: ACCT201');
    expect(out).toContain('In-progress courses: ECON101');
    expect(out).not.toContain('BUSI100');
  });
});
