import { generateOtp } from "./generateOtp.js";


export function buildOtp(minutes = 10, maxAttempts = 5) {
  return {
    code: generateOtp(),
    expiresAt: new Date(Date.now() + minutes * 60 * 1000),
    verified: false,
    attempts: 0,
    maxAttempts,
  };
}
