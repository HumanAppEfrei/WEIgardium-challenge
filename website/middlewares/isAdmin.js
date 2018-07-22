const admins = require("./../config/admin");
const hash = require("hash-sum");

module.exports = (req, res, next) => {
  if (typeof(req.body.firstName) !== "string")
    return res.status(400).redirect("/");

  const requestedAdmin = admins[req.body.firstName];

  if (requestedAdmin !== null && requestedAdmin !== undefined) {
    if (typeof(req.body.firstName) === "string" && hash(req.body.password) === requestedAdmin.password) {
      console.log("Admin connected");
      next();
    }
  }
  else {
    return res.status(403).redirect("/");
  }
};