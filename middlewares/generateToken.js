const Jwt = require('jsonwebtoken');

const generateToken = (payload) => new Promise((resolve, reject) => {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) throw new Error('No Secret Key');
  Jwt.sign(payload, JWT_SECRET, (err, token) => {
    if (err) return reject(err);
    return resolve(token);
  });
});

module.exports= generateToken;
