export const welcome = async (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Saraha App API",
    developedBy: {
      name: "Mohamed Hassan Esmail",
      role: "Full-Stack Developer",
      contact: {
        email: "mohamed.h.isamael@example.com",
        github: "https://github.com/devMohamed-Hassan",
        linkedin:
          "https://www.linkedin.com/in/mohamed-hassan-esmail-7590b22bb/",
      },
    },
    description:
      "This application was developed with care to provide an anonymous messaging experience.",
    note: "For access credentials <Bearer token> and the Postman collection, please reach out to the developer.",
  });
};
