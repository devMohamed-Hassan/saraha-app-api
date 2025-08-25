import bcrypt from "bcrypt";

export const hash = (plainText) => {
  return bcrypt.hashSync(plainText, Number(process.env.SALT_ROUNDS));
};

export const compare = (plainText, hashedText) => {
  return bcrypt.compareSync(plainText, hashedText);
};
