import jwt from "jsonwebtoken";
import { SUPABASE_JWT_SECRET, SUPABASE_URL } from "../constants.js";

export const generateTestJWT = (email: string, id: string) => {
  const now = Math.floor(Date.now() / 1000) - 20;
  const exp = now + 999_999_999;

  const payload = {
    aud: "authenticated",
    exp,
    iat: now,
    iss: `${SUPABASE_URL}/auth/v1`,
    sub: id,
    email: email,
    phone: "",
    app_metadata: {
      provider: "email",
      providers: ["email"]
    },
    user_metadata: {},
    role: "authenticated",
    aal: "aal1",
    amr: [
      {
        method: "otp",
        timestamp: now
      }
    ]
  };

  return jwt.sign(payload, SUPABASE_JWT_SECRET);
};

console.log(
  generateTestJWT("mario@mario.com", "4a71bb88-8d37-4b33-9231-4233aed3e9ab")
);
