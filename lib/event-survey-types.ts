/**
 * EventCore post-event survey — client-safe types.
 */

export type SurveyQuestionType = "text" | "rating" | "choice";

export type SurveyQuestion = {
  id: string;
  label: string;
  type: SurveyQuestionType;
  options?: string[];
  required?: boolean;
};

export const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
  { id: "overall", label: "Overall experience (1–5)", type: "rating", required: true },
  { id: "recommend", label: "Would you recommend this event?", type: "choice", options: ["Yes", "Maybe", "No"] },
  { id: "feedback", label: "What went well? What could improve?", type: "text" },
];

export function parseSurveyQuestions(raw: unknown): SurveyQuestion[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_SURVEY_QUESTIONS;
  return raw.filter(
    (q): q is SurveyQuestion =>
      typeof q === "object" &&
      q !== null &&
      typeof (q as SurveyQuestion).id === "string" &&
      typeof (q as SurveyQuestion).label === "string",
  );
}
