const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.GFB_SQL_HOST,
  user: process.env.GFB_SQL_USER,
  password: process.env.GFB_SQL_PASSWORD,
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
