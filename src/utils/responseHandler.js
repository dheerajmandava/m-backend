const sendResponse = (res, { status = 200, success = true, data = null, message = '' }) => {
  return res.status(status).json({
    success,
    data,
    message
  });
};

const sendError = (res, { status = 400, message = 'An error occurred', error = null }) => {
  return res.status(status).json({
    success: false,
    message,
    error
  });
};

module.exports = { sendResponse, sendError }; 