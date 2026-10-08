import jwt from "jsonwebtoken";

export const generateToken = ({
  id,
  role,
  tokenVersion,
  rememberMe = false,
}) => {

  const expiresIn = rememberMe
    ? process.env.JWT_REMEMBER_EXPIRES_IN || "30d"
    : process.env.JWT_EXPIRES_IN || "1h";

  return jwt.sign(
    {
      id,
      role,
      tokenVersion,
    },

    process.env.JWT_SECRET,

    {
      expiresIn,
      algorithm: "HS256",
    }
  );
};

export const verifyToken = ({
  token,
}) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};
