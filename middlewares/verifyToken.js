const { serverErrs } = require("./customError");
const jwt       = require('jsonwebtoken');
const dotenv    = require("dotenv");

dotenv.config();
const { JWT_SECRET } = process.env;

const verifyToken = (req, res, next) => {
  try {
    // const { token } = req.cookies;
    const authHeader=req.get('Authorization');
    const token = authHeader
    if (!token) {
      next(serverErrs.UNAUTHORIZED("unauthorized"));
    } else {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      console.log(decoded);
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = verifyToken;
