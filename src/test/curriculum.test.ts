import { describe, expect, it } from "vitest";
import {
  REGISTRAR_EMAIL,
  customCourseSchema,
  curriculumSchema,
  isCurriculumReady,
  registrarSubmissionSchema,
} from "@/lib/curriculum";

const customCourse = {
  id: "CSIS 490",
  name: "Security Operations Practicum",
  desc: "Apply defensive security skills to realistic operational scenarios.",
  credits: 3,
  skills: ["Information security"],
  careerGoal: "Cybersecurity analyst",
  prerequisites: [],
};

const curriculum = {
  id: "curriculum-1",
  title: "Cybersecurity Analyst Curriculum",
  careerGoal: "Cybersecurity analyst",
  skills: ["Information security"],
  courseIds: ["CSIS 490"],
  totalCredits: 3,
  status: "ready",
  createdAt: "2026-11-16T00:00:00.000Z",
  updatedAt: "2026-11-16T00:00:00.000Z",
};

const submission = {
  fullName: "Test Student",
  email: "student@example.test",
  studentId: "L123456",
  campus: "Online",
  mailingAddress: {
    line1: "1971 University Blvd",
    line2: "",
    city: "Lynchburg",
    state: "VA",
    postalCode: "24515",
    country: "United States",
  },
  essay: "This curriculum builds the practical security and analytical skills required for my chosen career as a cybersecurity analyst in government.",
  curriculum,
  customCourses: [customCourse],
};

describe("custom curriculum rules", () => {
  it("accepts only custom courses with 1 through 6 credits", () => {
    expect(customCourseSchema.safeParse({ ...customCourse, credits: 1 }).success).toBe(true);
    expect(customCourseSchema.safeParse({ ...customCourse, credits: 6 }).success).toBe(true);
    expect(customCourseSchema.safeParse({ ...customCourse, credits: 0 }).success).toBe(false);
    expect(customCourseSchema.safeParse({ ...customCourse, credits: 7 }).success).toBe(false);
  });

  it("requires at least one course and one skill before a curriculum can be ready", () => {
    expect(curriculumSchema.safeParse({ ...curriculum, courseIds: [] }).success).toBe(false);
    expect(curriculumSchema.safeParse({ ...curriculum, skills: [] }).success).toBe(false);
    expect(isCurriculumReady(curriculum)).toBe(true);
    expect(isCurriculumReady({ ...curriculum, status: "draft" })).toBe(false);
  });

  it("requires a ready curriculum and an essay of at least 100 characters", () => {
    expect(registrarSubmissionSchema.safeParse(submission).success).toBe(true);
    expect(registrarSubmissionSchema.safeParse({ ...submission, essay: "Too short" }).success).toBe(false);
    expect(registrarSubmissionSchema.safeParse({ ...submission, curriculum: { ...curriculum, status: "draft" } }).success).toBe(false);
  });

  it("uses the requested registrar address", () => {
    expect(REGISTRAR_EMAIL).toBe("example@liberty.edu");
  });
});
