export class AuthError extends Error {
  constructor() {
    super(
      "Invalid API Key in Authorization Header (not logged in with Supabase?)"
    );
    this.name = "AuthError";
  }
}
