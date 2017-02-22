var SQL = require('../model/mysql');
var Model = require('../model/user.model');
var idword;
 
// GET
var adminpage = function(req, res, next) {
  if(req.isAuthenticated()){
    var user = req.user;
      if(user !== undefined) {
        user = user.toJSON();
      }
      if(user.username == 'admin'){
        SQL.query('SELECT * FROM tblusers WHERE 1' , function(err,member){
          if(err) console.log(err);
          else {
            SQL.query('SELECT reported.id_word, word.word, COUNT(reported.id_word) as numberofreport FROM reported LEFT JOIN word on reported.id_word = word.id_word GROUP BY reported.id_word', function(err,reported){
              if(err) throw err;
              SQL.query('SELECT method,word,partofspeech,prononciation,meaning,synonym,tag,DATE_FORMAT(dateandtime,\'%a %m %b %y\') as dateandtime, username FROM history WHERE method != "delete" ORDER BY dateandtime DESC limit 100', function(err, history) {
                if(err) console.log(err);
                  var thisday = new Date();
                  SQL.query('SELECT COUNT(number) as count FROM history WHERE method = "insert" AND DATE(dateandtime) = "'+thisday.getFullYear()+'-'+(thisday.getMonth() +1)+'-'+thisday.getDate()+'" ORDER BY dateandtime DESC',function(err,newwordperday){
                    if(err) throw err;
                    SQL.query('SELECT COUNT(number) as count FROM search_history WHERE DATE(dateandtime) = "'+thisday.getFullYear()+'-'+(thisday.getMonth() +1)+'-'+thisday.getDate()+'" ORDER BY dateandtime DESC',function(err,viewperday){
                        if (err) throw err;
                        SQL.query('SELECT COUNT(number) as count FROM history WHERE (method = "roll-back" OR method = "edit") AND DATE(dateandtime) = "'+thisday.getFullYear()+'-'+(thisday.getMonth() +1)+'-'+thisday.getDate()+'" ORDER BY dateandtime DESC',function(err,editperday){
                          if(err) throw err;
                           SQL.query('SELECT keyword,COUNT(keyword) AS numberOfkeyword FROM keyword_history GROUP BY keyword ORDER BY numberofkeyword DESC LIMIT 5',function(err,hitkeyword){
                              if(err) throw err;
                              res.render('page/adminpage.html', {
                                title: 'ผู้ดูแล',
                                isAuthenticated : true,
                                history: history,
                                user : user,
                                member : member,
                                reported: reported,
                                newwordperday : newwordperday,
                                viewperday: viewperday,
                                editperday : editperday,
                                hitkeyword : hitkeyword
                              });
                           });
                          
                        });
                        
                    });
                    
                    
                  }); 
                
              });
            });
            
          }
        });
      }else {
        res.redirect('/');
      }
  }else {
    res.redirect('/');
  }

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
module.exports.adminpage = adminpage;
// 404 not found
module.exports.notFound404 = notFound404;