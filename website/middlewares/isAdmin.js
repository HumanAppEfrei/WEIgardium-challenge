const hash = require("hash-sum");
let db = require("./../config/db");

module.exports = async (req, res, next) => {
  if (typeof(req.headers.admin_fname) !== "string")
    return res.status(400).redirect("/");

  db = db.connection ? db.connection : await db.connect();

  const [rows, fields] = await db.execute("SELECT EXISTS(SELECT * FROM `Admin` WHERE `first_name` = ? AND `last_name` = ? AND `password` = ?) AS 'ok'", [req.headers.admin_fname, req.headers.admin_lname, hash(req.headers.admin_pass)]);

  // If admin found with passed parameters
  if (rows[0].ok === 1) {
    next();
  }

  // Checking if bad password or no admin
  else {
    const [admins, fields] = await db.execute("SELECT EXISTS(SELECT * FROM `Admin` WHERE `first_name` = ? AND `last_name` = ?) AS 'exists'", [req.headers.admin_fname, req.headers.admin_lname]);

    // Bad password
    if (admins != null && admins !== undefined && admins.length >= 1)
      return res.status(401).json({
        error: true,
        code: 'E_BAD_PASSWORD',
        message: 'Bad password'
      });
  }

    // No admin found
    return res.status(403).redirect("/");
};