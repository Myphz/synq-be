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
  generateTestJWT("stefano@stefano.ok", "6516acbe-39ec-4e47-bf42-7b3b939b2067")
);
