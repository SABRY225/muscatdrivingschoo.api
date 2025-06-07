const { serverErrs } = require('./customError');

const checkUserAuth = (role) => (req, res, next) => {
  const isUSerAuth = role === req.user.role;
  if (isUSerAuth) {
    next();
  } else {
    next(serverErrs.UNAUTHORIZED('unauthorized'));
  }
};

module.exports = checkUserAuth;