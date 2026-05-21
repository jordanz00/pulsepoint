import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    webhookIdempotency: {
      create: createMock,
    },
  },
}));

describe("claimWebhookEvent", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("returns false on first claim (process event)", async () => {
    createMock.mockResolvedValue({ id: "stripe:evt_1" });
    const { claimWebhookEvent } = await import("@/lib/webhook-idempotency");
    const duplicate = await claimWebhookEvent("evt_1", "stripe");
    expect(duplicate).toBe(false);
    expect(createMock).toHaveBeenCalledWith({
      data: { id: "stripe:evt_1", source: "stripe" },
    });
  });

  it("returns true on duplicate key (skip second LEGO stack)", async () => {
    createMock.mockRejectedValue(new Error("Unique constraint"));
    const { claimWebhookEvent } = await import("@/lib/webhook-idempotency");
    const duplicate = await claimWebhookEvent("evt_1", "stripe");
    expect(duplicate).toBe(true);
  });
});
