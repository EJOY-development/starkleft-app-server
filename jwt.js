const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

const generate = (payload) => {
  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "7d",
  });
  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "4w",
  });

  return {
    accessToken,
    refreshToken,
  };
};

const verify = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, decodedPayload) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decodedPayload);
    });
  });
};

module.exports = {
  generate,
  verify,
};
