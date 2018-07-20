const mysql = require("mysql");


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'weigardium',
  password: 'Azerty1234!'
});


/* MySQL command to create the User table
  CREATE TABLE User (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(250) NOT NULL,
    last_name VARCHAR(250) NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    email VARCHAR(250) NOT NULL,
    current_level SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (id)
  )
  ENGINE=INNODB;
*/


module.exports.connect = () => {
  connection.connect(err => {
    if (err)
      console.error("Error connecting " + err.stack);
    else
      console.log("Connected to database");
  });
};


module.exports.disconnect = () => {
  connection.end(err => {
    if (err)
      console.error("Error:", err.stack);
    else
      console.log("Connection to database ended");
  });
};




module.exports.createUser = user => {

};
