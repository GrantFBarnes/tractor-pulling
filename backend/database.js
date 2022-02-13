const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "tu",
  password: process.env.SQL_TU_PASSWORD,
  database: "tractor_pulling",
});

function run(command) {
  return new Promise((resolve, reject) => {
    connection.query(command, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

module.exports.run = run;
