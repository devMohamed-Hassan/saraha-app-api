export const handleSuccess = ({
  res,
  statusCode = 200,
  message = "Success",
  data = null,
}) => {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    ...(data !== null && { data }),
  });
};
