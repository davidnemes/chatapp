require("dotenv").config()

module.exports = {
  secret: process.env.TOKEN_SECRET,
  jwtExpiration: process.env.TOKEN_EXPIRATION,         // counts in seconds

  /* for test */
  // jwtExpiration: 60,          // 1 minute
};
