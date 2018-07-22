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

/** Settings for database connection
 *
 * @type {{host: string, database: string, user: string, password: string}}
 */
const connectionData = {
  host: 'localhost',
  database: 'weigardium_db',
  user: 'weigardium',
  password: 'Azerty1234!'
};




const mysql = require("mysql2/promise");
let connection = null;
let connected = null;


// Connecting to the database
connect = async () => {
  connection = await mysql.createConnection(connectionData);
  connected = true;

  console.log("Connected to database");

  return connection;
};



// Exports
module.exports.connect = connect;
module.exports.connection = connection;
module.exports.connected = connected;
module.exports.connectionData = connectionData;
module.exports.mysql = mysql;