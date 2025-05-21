import { enhanceRequest } from "../utils/enhance.js";
import { toMiddleware } from "../utils/middleware.js";

export const withEnhancedRequest = toMiddleware(enhanceRequest);
