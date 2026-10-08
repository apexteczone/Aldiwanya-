import bcrypt from "bcryptjs";

export const hash = ({
  plainText,
  saltRound = process.env.SALT || 12,
}) => {
  if (Buffer.byteLength(plainText) > 72) throw new Error("Password must be at most 72 UTF-8 bytes", {cause:422});
  return bcrypt.hashSync(
    plainText,
    Number(saltRound)
  );
};

export const compare = ({
  plainText,
  hash,
}) => {
  return bcrypt.compareSync(
    plainText,
    hash
  );
};

