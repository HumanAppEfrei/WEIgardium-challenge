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
const mysql2 = require("mysql2");
let connection = null;
let connected = null;
let pool = null;


// Connecting to the database
connect = async () => {
  connection = await mysql.createConnection(connectionData);
  connected = true;

  console.log("Connected to database");

  pool = mysql.createPool({
    host: connectionData.host,
    database: connectionData.database,
    user: connectionData.user,
    password: connectionData.password,
    connectionLimit: 10
  });

  return connection;
};


getPool = () => {
  if (pool === null)
    pool = mysql.createPool({
      host: connectionData.host,
      database: connectionData.database,
      user: connectionData.user,
      password: connectionData.password,
      connectionLimit: 10
    });

  return pool;
};




// Exports
module.exports.connect = connect;
module.exports.connection = connection;
module.exports.connected = connected;
module.exports.connectionData = connectionData;
module.exports.mysql = mysql;
module.exports.pool = getPool();