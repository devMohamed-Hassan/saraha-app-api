export const validate = (schemas) => (req, res, next) => {
  const validationOptions = { abortEarly: false };

  const validations = [
    { key: "body", schema: schemas.body },
    { key: "params", schema: schemas.params },
    { key: "query", schema: schemas.query },
    { key: "file", schema: schemas.file },
  ];

  let allErrors = [];

  for (const { key, schema } of validations) {
    if (schema) {
      const { error } = schema.validate(req[key], validationOptions);
      if (error) {
        const messages = error.details.map((d) =>
          d.message.replace(/["]/g, "")
        );
        allErrors = allErrors.concat(messages);
      }
    }
  }

  if (allErrors.length > 0) {
    return next(new Error(allErrors.join(", "), { cause: 400 }));
  }

  return next();
};
