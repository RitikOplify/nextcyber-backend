import jwt from "jsonwebtoken";
const generateTokens = (user) => {
  {
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    });
    return { accessToken, refreshToken };
  }
};

export default generateTokens;
