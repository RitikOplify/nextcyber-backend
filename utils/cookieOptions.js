const isProduction = process.env.NODE_ENV === "production";
export const accessTokenOption = {
  maxAge: 15 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const refreshTokenOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};
