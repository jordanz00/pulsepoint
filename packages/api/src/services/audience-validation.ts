import { validateNpiList } from "@ams/shared";
import { prisma } from "../lib/prisma.js";
import { writeAudit } from "../lib/audit.js";

export async function validateAudienceUpload(
  campaignId: string,
  filename: string,
  lines: string[],
  suppressionVersion: string | undefined,
  actorId?: string
) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
  });

  const last = await prisma.audienceList.findFirst({
    where: { campaignId },
    orderBy: { version: "desc" },
  });
  const version = (last?.version ?? 0) + 1;

  const result = validateNpiList(lines);

  const record = await prisma.audienceList.create({
    data: {
      campaignId,
      version,
      filename,
      rowCount: result.rows.length,
      valid: result.valid,
      validationReport: JSON.parse(JSON.stringify(result)),
      suppressionVersion: suppressionVersion ?? null,
      validatedAt: result.valid ? new Date() : null,
    },
  });

  await writeAudit({
    entityType: "AudienceList",
    entityId: record.id,
    action: result.valid ? "npi_validation:passed" : "npi_validation:failed",
    actorId,
    after: {
      version,
      valid: result.valid,
      invalidCount: result.invalidCount,
      duplicateCount: result.duplicateCount,
    },
  });

  if (!result.valid) {
    const err = new Error("NPI validation failed");
    (err as Error & { code: string }).code = "AMS_VAL_002";
    throw err;
  }

  return record;
}
