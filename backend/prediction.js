let { PythonShell } = require("python-shell");

function predictWinChance(json) {
  const options = {
    mode: "text",
    args: [
      json.season,
      json.location,
      json.puller,
      json.tractor,
      json.category,
      json.weight,
      json.hook_count,
    ],
  };
  return new Promise((resolve, reject) => {
    PythonShell.run("backend/prediction.py", options, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(parseFloat(results[0]));
      return;
    });
  });
}

module.exports.predictWinChance = predictWinChance;
