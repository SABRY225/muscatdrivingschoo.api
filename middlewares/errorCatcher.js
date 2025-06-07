const { ValidationError } = require("yup");
const { CustomError } = require("./customError");

const errorCatcher = (fn) => async (
  req,
  res,
  next,
) => {
  try {
   await fn(req, res, next);
  } catch (error) { 
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.errors });
    } else if (error instanceof CustomError) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.log(error, 'server error');
      res.status(500).json({ message: 'Server Error' });
    }
  }
};

module.exports = errorCatcher