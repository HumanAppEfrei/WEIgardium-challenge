/* MySQL command to create the User table
  CREATE TABLE User (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
    first_name VARCHAR(250) NOT NULL,
    last_name VARCHAR(250) NOT NULL,
    student_id INT UNSIGNED NOT NULL UNIQUE,
    ex_1 BOOLEAN NOT NULL DEFAULT false,
    ex_2 BOOLEAN NOT NULL DEFAULT false,
    ex_3 BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (id)
  )
  ENGINE=INNODB;
*/


const mysql = require("mysql2/promise");

const connectionData = {
  host: 'localhost',
  database: 'weigardium_db',
  user: 'weigardium',
  password: 'Azerty1234!'
};

let connection = null;
let connected = false;


module.exports.connect = async () => {
  connection = await mysql.createConnection(connectionData);
  connected = true;
};


/** Function that checks if the passed object describes a User for this program
 *
 * @param user {Object}
 * @return {boolean}
 */
checkUserObject = user => {
  return (user.hasOwnProperty("id") && user.hasOwnProperty("firstName") && user.hasOwnProperty("lastName") && user.hasOwnProperty("studentId"));
};


userRowToJSON = userRow => {
  return {
    id: userRow.id,
    fullName: userRow.first_name + ' ' + userRow.last_name,
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    studentId: userRow.student_id,
    exercises: {
      ex1: userRow.ex_1 === 1,
      ex2: userRow.ex_2 === 1,
      ex3: userRow.ex_3 === 1
    }
  }
};



/** Function that adds a user to the set database (`User` table)
 *
 * @param user {Object} The user to create, must own properties ['id', 'firstName', 'lastName', 'studentId']
 */
module.exports.createUser = user => {
  if (!checkUserObject(user))
    return;

  console.log("Creating a user");
};


/** Function that selects all the entries from the passed table in the set database
 *
 * @param tableName {String} Name of the table in which to select all the entries
 * @return {*} A list of entries
 */
module.exports.selectAll = async tableName => {
  if (!connected) {
    console.error("You must call the db.js connect function to perform requests");
    return;
  }

  if (typeof(tableName) !== "string" || (tableName !== "User" && tableName !== "Ex1" && tableName !== "Ex2" && tableName !== "Ex3")) {
    console.error("Cannot access Table '" + tableName + "'");
    return;
  }

  // Query to the database
  const [rows, fields] = await connection.execute("SELECT * FROM " + tableName, [tableName]);

  // Formatting data into an array of JSON
  let ret = [];
  for (let row of rows)
    ret.push(userRowToJSON(row));

  return ret;
};


