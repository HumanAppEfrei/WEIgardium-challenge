let db = require("./../config/db").connection;

checkConnection = async () => {
// Checking connection before performing any request
  if (!db)
    db = require("./../config/db").connection;
  if (!db) { // If still no connection
    db = await require("./../config/db").connect();
    require("./../config/db").connection = db;
  }
};

module.exports = class User {
  constructor (row, json) {
    if (row)
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
    await checkConnection();

    // Exploring the passed parameters
    let [rows, fields] = [undefined, undefined];
    if (user.hasOwnProperty("id"))
      [rows, fields] = await db.execute("SELECT * FROM User WHERE id = ? LIMIT 1", [user.id]);

    else if (user.hasOwnProperty("studentID"))
      [rows, fields] = await db.execute("SELECT * FROM User WHERE student_id = ? LIMIT 1", [user.studentID]);

    else if (user.hasOwnProperty("firstName") && user.hasOwnProperty("lastName"))
      [rows, fields] = await db.execute("SELECT * FROM User WHERE first_name = ? AND last_name = ? LIMIT 1", [user.firstName, user.lastName]);

    // If no precise enough criteria was passed
    else {
      console.log("This is a test");
      return new User(undefined);
    }

    // Returning the newly built user
    return new User(rows[0]);
  }


  /** Function that creates a User entry in the User table of the database
   */
  async create () {
    await checkConnection();

    await db.execute("INSERT INTO User (first_name, last_name, student_id) VALUES (?, ?, ?, ?, ?, ?)", [this.row.first_name, this.row.last_name, this.row.student_id, this.row.ex_1, this.row.ex_2, this.row.ex_3]);
  }
};