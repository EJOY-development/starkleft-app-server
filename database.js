const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database(
  "./index.sqlite3",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
      console.error(dbPath);
    } else {
      console.log("Connected to the database.");
    }
  }
);

// db.close((err) =>{
//   if(err){
//     console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });

module.exports = {
  get: (sql, args) => {
    return new Promise((resolve, reject) => {
      db.get(sql, args, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, args) => {
    return new Promise((resolve, reject) => {
      db.all(sql, args, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, args) => {
    return new Promise((resolve, reject) => {
      db.run(sql, args, (err, _this) => {
        if (err) reject(err);
        else resolve(_this);
      });
    });
  },
};
