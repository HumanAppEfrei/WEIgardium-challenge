module.exports.admins = {
  Camille: {
    firstName: "Camille",
    lastName: "Briand",
    password: "Azerty1234!"
  },

  Thibault: {
    firstName: "Thibault",
    lastName: "Lepez",
    password: "Azerty1234"
  },

  Ruben: {
    firstName: "Ruben",
    lastName: "Nabet",
    password: "Azerty1234"
  },

  Clemence: {
    firstName: "Clémence",
    lastName: "Angot",
    password: "Azerty1234",
  },

  Guillaume: {
    firstName: "Guillaume",
    lastName: "Foy",
    password: "Azerty1234"
  }
};


/** Function that is used to add an administrator to the database
 *
 * @param cb {Function} Callback (no args)
 * @return {Promise<void>}
 */
module.exports.create = async (cb) => {
  let db = require("./db");
  const hash = require("hash-sum");
  const prompt = require("prompt");


  // Connecting to database
  db = db.connection ? db.connection : await db.connect();


  prompt.start();
  const schema = {
    properties: {
      firstName: {
        message: "First name: ",
        required: true
      },
      lastName: {
        message: "Last name: ",
        required: true
      },
      password: {
        description: "Password: ",
        type: 'string',
        required: true,
        hidden: true
      }
    }
  };
  prompt.get(schema, async (err, result) => {
    await db.execute("INSERT INTO Admin (first_name, last_name, password) VALUES (?, ?, ?)", [result.firstName, result.lastName, hash(result.password)]);
    console.log("Admin created!");
    cb();
  });
};