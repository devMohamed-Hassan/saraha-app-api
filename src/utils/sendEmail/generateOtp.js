import otpGenerator from "otp-generator";

export const generateOtp = (length = 6, options = {}) => {
  const otp = otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
    ...options,
  });

  return otp;
};
