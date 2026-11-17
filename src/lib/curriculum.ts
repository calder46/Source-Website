import { z } from "zod";

export const REGISTRAR_EMAIL = "example@liberty.edu";

const skillList = z.array(z.string().trim().min(1).max(80)).min(1).max(12);
const courseId = z.string().trim().regex(/^[A-Z]{2,6} \d{3}[A-Z]?$/, "Use a course code such as CSIS 490.");

export const customCourseSchema = z.object({
  id: courseId,
  name: z.string().trim().min(2).max(120),
  desc: z.string().trim().min(10).max(1000),
  credits: z.number().int().min(1).max(6),
  skills: skillList,
  careerGoal: z.string().trim().min(2).max(120),
  prerequisites: z.array(courseId).max(6),
});

export const curriculumSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(120),
  careerGoal: z.string().trim().min(2).max(120),
  skills: skillList,
  courseIds: z.array(courseId).min(1).max(40),
  totalCredits: z.number().int().min(1).max(240),
  status: z.enum(["draft", "ready"]),
  createdAt: z.string().max(40),
  updatedAt: z.string().max(40),
});

export function curriculumReadinessIssues(curriculum: unknown): string[] {
  const parsed = curriculumSchema.safeParse(curriculum);
  if (parsed.success) return [];
  return parsed.error.issues.map((issue) => issue.message);
}

export function isCurriculumReady(curriculum: unknown): boolean {
  const parsed = curriculumSchema.safeParse(curriculum);
  return parsed.success && parsed.data.status === "ready";
}

export const mailingAddressSchema = z.object({
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/, "Enter a valid postal code."),
  country: z.string().trim().min(2).max(80),
});

export const registrarSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  studentId: z.string().trim().regex(/^[A-Za-z0-9-]{2,30}$/, "Enter a valid student ID."),
  campus: z.enum(["Residential", "Online"]),
  mailingAddress: mailingAddressSchema,
  essay: z.string().trim().min(100, "The justification essay must be at least 100 characters.").max(5000),
  curriculum: curriculumSchema.refine((value) => value.status === "ready", "Mark the curriculum ready before submitting."),
  customCourses: z.array(customCourseSchema).max(40),
});

export type CustomCourse = z.infer<typeof customCourseSchema>;
export type Curriculum = z.infer<typeof curriculumSchema>;
export type RegistrarSubmission = z.infer<typeof registrarSubmissionSchema>;
