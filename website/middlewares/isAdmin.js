const admins = require("./../config/admin");
const hash = require("hash-sum");
let db = require("./../config/db");

module.exports = async (req, res, next) => {
  if (typeof(req.headers.admin_fname) !== "string")
    return res.status(400).redirect("/");

  db = db.connection ? db.connection : await db.connect();

  const [rows, fields] = await db.execute("SELECT EXISTS(SELECT * FROM `Admin` WHERE `first_name` = ? AND `last_name` = ? AND `password` = ?) AS 'ok'", [req.headers.admin_fname, req.headers.admin_lname, hash(req.headers.admin_pass)]);

  if (rows[0].ok === 1)
    next();
  else
    return res.status(403).redirect("/");
};