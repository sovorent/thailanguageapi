var DB = require('./db').DB;

var User = DB.Model.extend({
   tableName: 'tblusers',
   idAttribute: 'userId',
});

module.exports = {
   User: User
};