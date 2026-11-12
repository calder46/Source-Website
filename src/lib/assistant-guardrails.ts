export const REFUSAL = "I can't discuss that.";

const INJECTION =
  /\b(ignore (all |any )?(previous|prior|above) (instructions|rules)|system prompt|developer mode|dan mode|jailbreak|pretend (you are|to be)|act as (?!an? (advisor|adviser))|disregard (your|the) (rules|instructions))\b/i;

const TOPIC =
  /\b([A-Z]{3,4}\s?\d{3}|courses?|class(es)?|prereq\w*|co-?req\w*|degree|major|minor|concentration|curricul\w*|syllab\w*|credits?|credit hours?|semester|term|schedul\w*|enroll\w*|register|registration|catalog|elective|gen ?ed|general education|transfer|graduat\w*|gpa|grades?|grading|transcript|advis\w*|learning outcomes?|accredit\w*|ferpa|title ix|academic (integrity|policy|probation|plan)|plagiari\w*|withdraw\w*|audit|tuition|financial aid|legal|law|policy|policies|compliance|copyright|disabilit\w*|ada|accommodation\w*|dcp|optimizer|study|studying|lecture|professor|instructor|campus|online|hybrid|liberty|liberty university)\b/i;

const GREETING = /^\s*(hi|hello|hey|thanks|thank you|help)\b[\s!.?]*$/i;

/** Tier 1: decide whether a user prompt is in scope before waking the model. */
export function isPromptAllowed(text: string): boolean {
  if (INJECTION.test(text)) return false;
  return GREETING.test(text) || TOPIC.test(text);
}

const BAD_OUTPUT =
  /\b(recipe|ingredients|nsfw|sexual|porn|kill (yourself|someone)|suicide method|how to make (a )?(bomb|weapon|drugs?)|meth|explosive|hack(ing)? into|malware|password crack\w*|as an ai (without|with no) (rules|restrictions)|my system prompt|i (was|am) instructed to|cheating|fraud)\b/i;

/** Tier 2: check the model's reply; return it or the refusal. */
export function checkReply(prompt: string, reply: string): string {
  const r = reply.trim();
  if (!r || r === REFUSAL) return REFUSAL;
  if (BAD_OUTPUT.test(r) || INJECTION.test(r)) return REFUSAL;
  if (!GREETING.test(prompt) && !TOPIC.test(r) && !TOPIC.test(prompt)) return REFUSAL;
  if (r.length > 200 && !TOPIC.test(r)) return REFUSAL;
  return r;
}
