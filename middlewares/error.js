const clientError = (req, res) => {
  res.status(404).json({ message: "Not Found Page" });
};

const serverError = (error, req, res, next) => {
  if (error.status) {
    res.status(error.status).json({ message: error.message });
  } else {
    console.log(error);
    res.status(500).json({ message: "Server Error = " ,error: error.message || "no" });
  }
};
module.exports = { clientError, serverError };
