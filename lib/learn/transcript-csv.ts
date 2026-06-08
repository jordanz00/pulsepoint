/**
 * Learn CE transcript CSV — enrollments + credit awards for compliance export.
 */

import { escapeCsvCell } from "@/lib/giving/csv";

export type TranscriptEnrollmentRow = {
  courseTitle: string;
  status: string;
  enrolledAt: string;
  completedAt: string;
};

export type TranscriptAwardRow = {
  creditCode: string;
  creditName: string;
  amount: number;
  source: string;
  awardedAt: string;
  note: string;
};

export function buildMemberTranscriptCsv(input: {
  memberName: string;
  memberEmail: string;
  enrollments: TranscriptEnrollmentRow[];
  awards: TranscriptAwardRow[];
}): string {
  const lines: string[] = [
    `member,${escapeCsvCell(input.memberName)},${escapeCsvCell(input.memberEmail)}`,
    "",
    "section,course,status,enrolled_at,completed_at",
  ];

  for (const e of input.enrollments) {
    lines.push(
      [
        "enrollment",
        escapeCsvCell(e.courseTitle),
        e.status,
        e.enrolledAt,
        e.completedAt,
      ].join(","),
    );
  }

  lines.push("");
  lines.push("section,credit_code,credit_name,amount,source,awarded_at,note");

  for (const a of input.awards) {
    lines.push(
      [
        "award",
        escapeCsvCell(a.creditCode),
        escapeCsvCell(a.creditName),
        String(a.amount),
        a.source,
        a.awardedAt,
        escapeCsvCell(a.note),
      ].join(","),
    );
  }

  return lines.join("\n");
}
