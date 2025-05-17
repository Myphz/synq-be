import { rateLimit } from "express-rate-limit";

// Limits to 50 request per hour per ip
export const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 999 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  // Prevent trust proxy header being shown
  // (https://express-rate-limit.github.io/ERR_ERL_PERMISSIVE_TRUST_PROXY/)
  // In this case, I have to set a trust proxy because this server is hosted on fly.io, which
  // uses a load balancer and reverse proxy under the hood.
  // Without a trust proxy, I wouldn't be able to get the correct IP address of the request.
  // https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues
  validate: { trustProxy: false }
});
