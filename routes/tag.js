var SQL = require('../model/mysql');
var Model = require('../model/user.model');
var idword;

// GET
var tag = function(req, res, next) {
  console.log(req.query.tag_id);
  SQL.query('SELECT * FROM word LEFT JOIN tag ON (word.id_word = tag.id_word) LEFT JOIN tag_mst ON (tag.tag_id = tag_mst.tag_id) WHERE tag.tag_id  ='+req.query.tag_id+'', function(err, rows) {
        if(rows.length == 0){
          res.render('page/error.html', {
            error: 'ไม่เจอหมวดหมู่',
            message: 'error'
          });
        }else{ 
          if(!req.isAuthenticated()){
            res.render('page/tag.html' , {
              title: 'หมวดหมู่ : ',
              isAuthenticated : false,
              'sql': rows
            });
          }else {
            var user = req.user;
              if(user !== undefined) {
                user = user.toJSON();
              }
              res.render('page/tag.html', {
                title: 'หมวดหมู่ : ',
                isAuthenticated : true,
                'sql' : rows,
                user : user
              });
          }  
        }
  });
};

// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('page/error.html', {
   	error: '404 Not Found',
   	message: 'error'
   });
};

// export functions
/******************************i********/
// index
module.exports.tag = tag;
// 404 not found
module.exports.notFound404 = notFound404;