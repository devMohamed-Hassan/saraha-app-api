export const welcome = async (req, res) => {
  const egyptTime = new Date().toLocaleString("en-GB", {
    timeZone: "Africa/Cairo",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  res.json({
    success: true,
    message: "Welcome to the Saraha App API",
    version: "1.0.0",
    serverTime: egyptTime,
    developedBy: {
      name: "Mohamed Hassan Esmail",
      role: "Full-Stack Developer",
      contact: {
        email: "mohamed.h.ismael@gmail.com",
        github: "https://github.com/devMohamed-Hassan",
        linkedin:
          "https://www.linkedin.com/in/mohamed-hassan-esmail-7590b22bb/",
      },
    },
    description:
      "This application was developed with care to provide an anonymous messaging experience.",
    note: "For access credentials (<Bearer token>) and the Postman collection, please reach out to the developer.",
  });
};
