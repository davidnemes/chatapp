require("dotenv").config()

module.exports = {
  secret: process.env.TOKEN_SECRET || "Default-token-secret",
  jwtExpiration: parseInt(process.env.TOKEN_EXPIRATION) ||  1800,         // counts in seconds

  /* for test */
  // jwtExpiration: 360,          // 1 minute
};
