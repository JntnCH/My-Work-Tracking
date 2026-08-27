import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isLocalGuestUser } from "./use-session";

function userWithProvider(provider: string): User {
  return {
    id: "user-id",
    app_metadata: { provider },
  } as User;
}

describe("isLocalGuestUser", () => {
  it("recognizes only the explicit Guest Mode provider", () => {
    expect(isLocalGuestUser(userWithProvider("guest"))).toBe(true);
    expect(isLocalGuestUser(userWithProvider("google"))).toBe(false);
    expect(isLocalGuestUser(userWithProvider("email"))).toBe(false);
    expect(isLocalGuestUser(null)).toBe(false);
  });
});
