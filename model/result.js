ar MySQL = require('../model/mysql');

exports.searchword = function(keyword, col,callback) {

   MySQL.query('select  *  FROM test.test  where (convert (? using utf8) like '%?%')', [col],[keyword],
    function (rows, fields) {
      console.log('rows', JSON.stringify(rows));
      if(rows && rows.length>0){
        var row = rows[0];
        if(row.password == password){// 登陆成功
          callback(message.login.success, row);
        }else{// 密码错误
          callback(message.login.pwd.error, null);
        }
      }else{
        callback(message.login.none, null);
      }
    });
}