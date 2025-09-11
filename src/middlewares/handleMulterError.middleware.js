export const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new Error("File too large! Maximum size allowed is 2MB.", {
          cause: 413,
        })
      );
    }

    if (err.message === "Only image files are allowed!") {
      return next(
        new Error("Only image files are allowed!", {
          cause: 415,
        })
      );
    }

    return next(
      new Error(err.message || "Upload error", {
        cause: 400,
      })
    );
  }

  next();
};
