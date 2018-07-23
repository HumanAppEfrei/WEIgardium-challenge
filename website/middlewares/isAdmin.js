const admins = require("./../config/admin");
const hash = require("hash-sum");
let db = require("./../config/db");

module.exports = async (req, res, next) => {

  if (typeof(req.body.firstName) !== "string")
    return res.status(400).redirect("/");

  db = db.connection ? db.connection : await db.connect();

  // Requesting possible administrators from database
  const [rows, fields] = await db.execute("SELECT * FROM `Admin` WHERE `first_name` = ? AND `last_name` = ?", [req.body.firstName, req.body.lastName]);

  let possibilities = [];
  rows.forEach((val, index, array) => {
    possibilities.push({
      firstName: rows[index].first_name,
      lastName: rows[index].last_name,
      password: rows[index].password
    });
  });


  let adminOk = null;
  possibilities.forEach((admin, index, array) => {
    if (admin.password === hash(req.body.password))
      adminOk = admin;
  });


  if (adminOk != null) {
    console.log("Admin connected!");
    next();
  }
  else {
    return res.status(403).redirect("/");
  }
};