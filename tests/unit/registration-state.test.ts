import { describe, expect, it } from "vitest";
import {
  assertRegistrationTransition,
  canTransitionRegistration,
} from "@/lib/registration-state";

describe("registration state machine", () => {
  it("allows PENDING to CONFIRMED", () => {
    expect(canTransitionRegistration("PENDING", "CONFIRMED")).toBe(true);
  });

  it("blocks CONFIRMED to PENDING", () => {
    expect(canTransitionRegistration("CONFIRMED", "PENDING")).toBe(false);
  });

  it("assert throws on invalid transition", () => {
    expect(() => assertRegistrationTransition("CANCELLED", "CONFIRMED")).toThrow(
      /INVALID_REGISTRATION_TRANSITION/,
    );
  });
});
