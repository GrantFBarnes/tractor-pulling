const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "tu",
  password: process.env.MYSQL_TU_PASSWORD,
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

function select(columns, table, field, values) {
  return new Promise((resolve, reject) => {
    if (!columns) {
      reject("columns not provided");
      return;
    }

    if (!table) {
      reject("table not provided");
      return;
    }

    let command = "SELECT " + columns + " FROM " + table;
    if (field && values && values.length) {
      command += " WHERE " + field + " IN (" + getValues(values) + ")";
    }

    run(command)
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

function getValue(value) {
  if (typeof value === "string") {
    while (value.includes("'")) value = value.replace("'", "");
    while (value.includes('"')) value = value.replace('"', "");
    value = value.trim();
    value = JSON.stringify(value);
  }
  return value;
}

function getValues(values) {
  let new_values = [];
  for (let i in values) {
    new_values.push(getValue(values[i]));
  }
  return new_values;
}

function update(table, data) {
  return new Promise((resolve, reject) => {
    if (!table) {
      reject("table not provided");
      return;
    }

    if (!data) {
      reject("data not provided");
      return;
    }

    if (!data.id) {
      reject("data not valid");
      return;
    }

    let command = "UPDATE " + table + " SET ";
    let otherField = false;
    for (let f in data) {
      if (f === "id") continue;
      command += f + " = " + getValue(data[f]) + ", ";
      otherField = true;
    }

    if (!otherField) {
      reject("no updates provided");
      return;
    }

    command = command.slice(0, -2);
    command += " WHERE id = " + data.id;

    run(command)
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

function create(table, data) {
  return new Promise((resolve, reject) => {
    if (!table) {
      reject("table not provided");
      return;
    }

    if (!data) {
      reject("data not provided");
      return;
    }

    let fields = [];
    let values = [];
    for (let f in data) {
      if (f === "id") continue;
      fields.push(f);
      values.push(getValue(data[f]));
    }

    run("INSERT INTO " + table + " (" + fields + ") VALUES (" + values + ")")
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

function deleteById(table, id) {
  return new Promise((resolve, reject) => {
    if (!table) {
      reject("table not provided");
      return;
    }

    if (!id) {
      reject("id not provided");
      return;
    }

    run("DELETE FROM " + table + " WHERE id = " + id)
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });
}

module.exports.select = select;
module.exports.update = update;
module.exports.create = create;
module.exports.deleteById = deleteById;
