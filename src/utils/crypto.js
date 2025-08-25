import CryptoJS from "crypto-js";

export const encrypt = (plainText) => {
  return CryptoJS.AES.encrypt(plainText, process.env.CRYPTO_KEY).toString();
};

export const decrypt = (cipherText) => {
  return CryptoJS.AES.decrypt(cipherText, process.env.CRYPTO_KEY).toString(
    CryptoJS.enc.Utf8
  );
};
