let db = require("./../config/db").connection;
let pool = require("./../config/db").pool;
const FancyLogger = require("simple-fancy-log");
const logger = new FancyLogger();

class User {
  constructor (row, json) {
    if (row != null && row !== undefined)
      this.row = {
        id: row.id,
        student_id: row.student_id,
        first_name: row.first_name,
        last_name: row.last_name,
        ex_1: row.ex_1 === 1,
        ex_2: row.ex_2 === 1,
        ex_3: row.ex_3 === 1
      };
    else if (json instanceof Object)
      this.row = {
        id: undefined,
        student_id: json.studentID,
        first_name: json.firstName,
        last_name: json.lastName,
        ex_1: json.done.ex1,
        ex_2: json.done.ex2,
        ex_3: json.done.ex3
      };
    else
      this.row = undefined;
  }

  get studentID () {
    return this.row.student_id;
  }

  get firstName () {
    return this.row.first_name;
  }

  get lastName () {
    return this.row.last_name;
  }

  get fullName () {
    return this.row.first_name + ' ' + this.row.last_name;
  }

  get id () {
    return this.row.id;
  }

  get done () {
    return {
      ex1: this.row.ex_1 === 1 || this.row.ex_1 === true,
      ex2: this.row.ex_2 === 1 || this.row.ex_2 === true,
      ex3: this.row.ex_3 === 1 || this.row.ex_3 === true
    };
  }

  get exists () {
    return this.row !== undefined;
  }


  /** Function that looks for ONE User in the database based on the passed search parameters
   *
   * @param user {Object} JSON Object that contains the search parameters, can contain (one or more) ['id', 'studentID', 'firstName' AND 'lastName']
   * @param cb {function (err, User)} Callback function
   * @return {Promise<module.User>} Requested user, undefined if not found or no precise enough criteria were passed
   */
  static async findOne (user, cb = () => {}) {

    let [rows, fields] = [undefined, undefined];
    let user = null;

    await pool.getConnection(async (err, con) => {
      if (err) {
        logger.addTag("error");
        logger.log("Unable to establish connection");
        return;
      }

      // Exploring the passed parameters
      if (user.hasOwnProperty("id"))
        [rows, fields] = await con.promise().query("SELECT * FROM User WHERE id = ? LIMIT 1", [user.id]);

      else if (user.hasOwnProperty("studentID"))
        [rows, fields] = await con.promise().query("SELECT * FROM User WHERE student_id = ? LIMIT 1", [user.studentID]);

      else if (user.hasOwnProperty("firstName") && user.hasOwnProperty("lastName"))
        [rows, fields] = await con.promise().query("SELECT * FROM User WHERE first_name = ? AND last_name = ? LIMIT 1", [user.firstName, user.lastName]);

      // If no precise enough criteria was passed
      else {
        user = new User(undefined);
        pool.releaseConnection(con);

        return;
      }

      // Returning the newly built user
      user = new User(rows[0]);

      pool.releaseConnection(con);
    });

    if (user !== null)
      return user;
    return null;
  }


  static async getAll () {
    let rows = null;
    let fields = null;

    await pool.getConnection (async (err, con) => {
      if (err) {
        logger.addTag("error");
        logger.log("Unable to establish connection");
        return;
      }

      [rows, fields] = await con.promise().query("SELECT * FROM User ORDER BY id");
      pool.releaseConnection(con);
    });
    let users = [];

    for (let row of rows) {
      users.push(new User(row));
    }

    return users;
  }


  static async update (user, exs, cb = (err) => {}) {
    let userToUpdate = await this.findOne(user);

    if (!userToUpdate.exists)
      return;

    if (exs.ex3 && !userToUpdate.done.ex3 && userToUpdate.done.ex2 && userToUpdate.done.ex1) {
      let updated = false;
      logger.addTags("update", "exercise", "exercise-success");
      logger.log("User " + userToUpdate.fullName + " completed ex 3");

      await pool.getConnection (async (err, con) => {
        if (err) {
          logger.addTag("error");
          logger.log("Unable to establish connection to database");
          return;
        }

        con.promise().query("UPDATE User SET ex_3 = 1 WHERE id = ?", [userToUpdate.id])
          .then(async res => {
            con.promise().query("INSERT INTO Ex3 (first_name, last_name, student_id) VALUES (?, ?, ?)", [userToUpdate.firstName, userToUpdate.lastName, userToUpdate.studentID])
              .then(async res2 => {
                updated = true;
              })
              .catch(err => {
                logger.addTag("error");
                logger.log("Error performing request to database");
                pool.releaseConnection(con);
                return cb({error: true, message: "Erreur de connexion"});
              });
            pool.releaseConnection(con);
          })
          .catch(err => {
            logger.addTag("error");
            logger.log("Error performing request to database");
            pool.releaseConnection(con);
            return cb({error: true, message: "Erreur de connexion"});
          });
        updated = true;
        pool.releaseConnection(con);
      });
      if (updated)
        return cb({error: false, message: "Profil mis à jour !"});
      else
        return cb({error: true, message: "Impossible de mettre le profil à jour"});
    } else if (exs.ex3 && (!userToUpdate.done.ex2 || !userToUpdate.done.ex1)) {
      return cb({error: true, message: "Vous devez d'abord compléter les exercices 1 et 2 pour répondre au 3"});
    }

    if (exs.ex2 && !userToUpdate.done.ex2) {
      let updated = false;
      logger.addTags("update", "exercise", "exercise-success");
      logger.log("User " + userToUpdate.fullName + " completed ex 2");

      await pool.getConnection (async (err, con) => {
        if (err) {
          logger.addTag("error");
          logger.log("Unable to establish connection to database");
          return;
        }

        con.promise().query("UPDATE User SET ex_2 = 1 WHERE id = ?", [userToUpdate.id])
          .then(async res => {
            con.promise().query("INSERT INTO Ex2 (first_name, last_name, student_id) VALUES (?, ?, ?)", [userToUpdate.firstName, userToUpdate.lastName, userToUpdate.studentID])
              .then(async res2 => {
                updated = true;
              })
              .catch(err => {
                logger.addTag("error");
                logger.log("Error performing request to database");
                pool.releaseConnection(con);
                return cb({error: true, message: "Erreur de connexion"});
              });
            pool.releaseConnection(con);
          })
          .catch(err => {
            logger.addTag("error");
            logger.log("Error performing request to database");
            pool.releaseConnection(con);
            return cb({error: true, message: "Erreur de connexion"});
          });
        updated = true;
        pool.releaseConnection(con);
      });
      if (updated)
        return cb({error: false, message: "Profil mis à jour !"});
      else
        return cb({error: true, message: "Impossible de mettre le profil à jour"});
    }

    if (exs.ex1 && !userToUpdate.done.ex1) {
      let updated = false;
      logger.addTags("update", "exercise", "exercise-success");
      logger.log("User " + userToUpdate.fullName + " completed ex 1");

      await pool.getConnection (async (err, con) => {
        if (err) {
          logger.addTag("error");
          logger.log("Unable to establish connection to database");
          return;
        }

        con.promise().query("UPDATE User SET ex_1 = 1 WHERE id = ?", [userToUpdate.id])
          .then(async res => {
            con.promise().query("INSERT INTO Ex1 (first_name, last_name, student_id) VALUES (?, ?, ?)", [userToUpdate.firstName, userToUpdate.lastName, userToUpdate.studentID])
              .then(async res2 => {
                updated = true;
              })
              .catch(err => {
                logger.addTag("error");
                logger.log("Error performing request to database");
                pool.releaseConnection(con);
                return cb({error: true, message: "Erreur de connexion"});
              });
            pool.releaseConnection(con);
          })
          .catch(err => {
            logger.addTag("error");
            logger.log("Error performing request to database");
            pool.releaseConnection(con);
            return cb({error: true, message: "Erreur de connexion"});
          });
      });
      if (updated)
        return cb({error: false, message: "Profil mis à jour !"});
      else
        return cb({error: true, message: "Impossible de mettre le profil à jour"});
    }

    return cb({error: false, message: "Exercice déjà terminé !"});
  }


  /** Function that creates a User entry in the User table of the database
   */
  async create (req, res) {
    logger.addTags("post", "user-creation");

    await pool.getConnection(async (err, con) => {
      if (err) {
        logger.addTag("error");
        logger.log("Unable to establish connection to database");
        return;
      }

      con.promise().query("INSERT INTO User (first_name, last_name, student_id) VALUES (?, ?, ?)", [this.row.first_name, this.row.last_name, this.row.student_id])
        .then(res => {
          logger.addTag("user-creation");
          logger.log("User created: " + this.fullName + " (" + this.studentID + ")");
          pool.releaseConnection(con);
          return res.status(200).redirect("/");
        })
        .catch(err => {
          logger.addTags("warning", "error");
          logger.log("Unable to create user " + this.fullName + " (" + this.studentID + ")");
          pool.releaseConnection(con);
          return res.status(400).json({error: true});
        });
    });
  }
}


module.exports = User;