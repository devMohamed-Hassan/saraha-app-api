export class UserNotFoundError extends Error {
  constructor() {
    super("No account found with this email");
    this.name = "UserNotFoundError";
    this.statusCode = 404;
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super("Please verify your email first");
    this.name = "EmailNotVerifiedError";
    this.statusCode = 403;
  }
}

export class InvalidOtpError extends Error {
  constructor() {
    super("Invalid OTP");
    this.name = "InvalidOtpError";
    this.statusCode = 400;
  }
}

export class OtpExpiredError extends Error {
  constructor() {
    super("OTP expired. Please request again");
    this.name = "OtpExpiredError";
    this.statusCode = 400;
  }
}

export class UserAlreadyVerifiedError extends Error {
  constructor() {
    super("User already verified");
    this.name = "UserAlreadyVerifiedError";
    this.statusCode = 400;
  }
}
