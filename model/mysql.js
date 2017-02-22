var mysql = require('mysql');

exports.getConnection=function() {
 return mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'test'
 });
}

exports.query=function(strSql, params, callback) {
  var conn = exports.getConnection();
  conn.connect();
  var query = conn.query(strSql, params, function(err, rows, fields) {
   if (err) throw err;
   callback(rows, fields);
  });
  console.log('>>>sql : ' + query.sql);
  conn.end();
}