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
    return (async () => {
      if (this.row !== undefined)
        return (await User.findOne({studentID: this.studentID}) === null);
      return false;
    })();
  }


  /** Function that looks for ONE User in the database based on the passed search parameters
   *
   * @param user {Object} JSON Object that contains the search parameters, can contain (one or more) ['id', 'studentID', 'firstName' AND 'lastName']
   * @param cb {function (err, User)} Callback function
   * @return {Promise<User>} Requested user, undefined if not found or no precise enough criteria were passed
   */
  static async findOne (user, cb = () => {}) {

    let [rows, fields] = [undefined, undefined];

    if (user.hasOwnProperty("id"))
      [rows, fields] = await pool.query("SELECT * FROM User WHERE id = ? LIMIT 1", [user.id]);

    else if (user.hasOwnProperty("studentID"))
      [rows, fields] = await pool.query("SELECT * FROM User WHERE student_id = ? LIMIT 1", [user.studentID]);

    else if (user.hasOwnProperty("firstName") && user.hasOwnProperty("lastName"))
      [rows, fields] = await pool.query("SELECT * FROM User WHERE first_name = ? AND last_name = ? LIMIT 1", [user.firstName, user.lastName]);

    else {
      return null;
    }

    return new User(rows[0]);
  }


  static async getAll () {
    let [rows, fields] = await pool.query("SELECT * FROM User ORDER BY id");

    let users = [];

    for (let row of rows) {
      users.push(new User(row));
    }

    return users;
  }


  static async update (user, exs, cb = (err) => {}) {
    let updated = false;
    let userToUpdate = await this.findOne(user);

    if (!userToUpdate.exists)
      return;

    // Seems to be the correct way to do it
    if (exs.ex3 && !userToUpdate.done.ex3 && userToUpdate.done.ex2 && userToUpdate.done.ex1) {
      logger.addTags("update", "exercise", "exercise-success");
      logger.log("User " + userToUpdate.fullName + " completed ex 3");

      await pool.query("UPDATE User SET ex_3 = 1 WHERE id = ?", [userToUpdate.id]);
      await pool.query("INSERT INTO Ex3 (first_name, last_name, student_id) VALUES (?, ?, ?)", [userToUpdate.firstName, userToUpdate.lastName, userToUpdate.studentID]);
      updated = true;
    }

    if (exs.ex2 && !userToUpdate.done.ex2) {
      logger.addTags("update", "exercise", "exercise-success");
      logger.log("User " + userToUpdate.fullName + " completed ex 2");
      await pool.query("UPDATE User SET ex_2 = 1 WHERE id = ?", [userToUpdate.id]);
      await pool.query("INSERT INTO Ex2 (first_name, last_name, student_id) VALUES (?, ?, ?)", [userToUpdate.firstName, userToUpdate.lastName, userToUpdate.studentID]);
      updated = true;
    }

    if (exs.ex1 && !userToUpdate.done.ex1) {
      logger.addTags("update", "exercise", "exercise-success");
      logger.log("User " + userToUpdate.fullName + " completed ex 2");
      await pool.query("UPDATE User SET ex_1 = 1 WHERE id = ?", [userToUpdate.id]);
      await pool.query("INSERT INTO Ex1 (first_name, last_name, student_id) VALUES (?, ?, ?)", [userToUpdate.firstName, userToUpdate.lastName, userToUpdate.studentID])
      updated = true;
    }

      if (updated)
        return cb({error: false, message: "Profil mis à jour !"});
      else
        return cb({error: true, message: "Impossible de mettre le profil à jour"});
  }


  /** Function that creates a User entry in the User table of the database
   */
  async create () {
    let exists = await this.exists;

    // Avoiding creating multiple accounts
    if (exists)
      return false;

    // Creating the user
    await pool.query("INSERT INTO User (first_name, last_name, student_id) VALUES (?, ?, ?)", [this.firstName, this.lastName, this.studentID]);

    logger.addTag("user-creation");
    logger.log("User created: " + this.fullName + " (" + this.studentID + ")");
    return true;
  }
}


module.exports = User;