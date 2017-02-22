var express = require('express');
var router = express.Router();
var SQL = require('../model/mysql');
var Model = require('../model/user.model');
/* GET home page. */
router.get('/', function(req, res) {
  res.header('Access-Control-Allow-Origin', "*")
  SQL.query('SELECT tag.tag_id,tag_mst.tag_name,COUNT(tag.tag_id) AS numberofword FROM tag LEFT JOIN tag_mst On tag.tag_id = tag_mst.tag_id GROUP BY tag_id ORDER BY numberofword DESC LIMIT 5', function(err,mosttag){
    if(err) throw(err);
    SQL.query('SELECT keyword,COUNT(keyword) AS numberOfkeyword FROM keyword_history GROUP BY keyword ORDER BY numberofkeyword DESC LIMIT 5',function(err,hitkeyword){
      if (err) throw err;
      SQL.query('SELECT id_word,word from word order by id_word DESC limit 5',function(err,newest){
      if(err) throw (err);
      if (! req.isAuthenticated()) {
          res.render('page/index.html', {
               title: "Thai language API",
               isAuthenticated : false,
               newest : newest,
               mosttag : mosttag,
               hitkeyword : hitkeyword
          });
         }else {
           var user = req.user;
            if(user !== undefined) {
              user = user.toJSON();
            }
            res.render('page/index.html', {
               title: "Thai language API",
               isAuthenticated : true,
               user : user,
               newest : newest,
               mosttag : mosttag,
               hitkeyword : hitkeyword
            });
         }
      });
    });

  });
    
});

router.get('/search', function(req, res) {
  res.header('Access-Control-Allow-Origin', "*")
  	SQL.query('SELECT word from word where word like "%'+req.query.key+'%" ORDER BY (word like "'+req.query.key+'%") DESC', function (err,rows,fields){
  		var data=[];
    		for(i=0;i<rows.length;i++) {
        			data.push(rows[i].word);
     		}
      		res.end(JSON.stringify(data));
	});
});

router.get('/searchword', function (req, res) {
  res.header('Access-Control-Allow-Origin', "*")
      var result = [];
      var keyword = req.query.keyword;
      var resultsearch;
      SQL.query('SELECT id_word,word,partofspeech,meaning from word where word like "%'+keyword+'%" ORDER BY (word like "'+keyword+'%") DESC', function(err, rows) {
  //result = JSON.stringify(rows);
            //console.log(result);
            if(rows.length == 0) resultsearch = false;
            else resultsearch = true;
            console.log(resultsearch);
            if(!req.isAuthenticated()){  
              var User = "guest" ;
              SQL.query('INSERT INTO keyword_history (keyword, user) VALUES ("'+keyword+'","'+User+'")', function(err){
                if(err) throw err;
                res.render('page/showresult.html' , {
                  title: 'ค้นหา : ',
                  isAuthenticated : false,
                  keyword : req.query.keyword,
                  'sql' : rows,
                  resultsearch : resultsearch
                });
              });
              
            }else {
              var user = req.user;
              if(user !== undefined) {
                user = user.toJSON();
              }
              SQL.query('INSERT INTO keyword_history (keyword, user) VALUES ("'+keyword+'","'+user.username+'")', function(err){
                if(err) throw err;
                res.render('page/showresult.html', {
                  title: 'ค้นหา : ',
                  isAuthenticated : true,
                  keyword : req.query.keyword,
                  'sql' : rows,
                  user : user,
                  resultsearch:resultsearch
                }); 
              });
              
           }
            
           
    });
});

router.get('/aboutus',function(req,res,next){
  if(!req.isAuthenticated()){  
    res.render('page/aboutus.html',{
      title : "เกี่ยวกับเรา",
      isAuthenticated : false
    });
  }else {
    var user = req.user;
              if(user !== undefined) {
                user = user.toJSON();
              }
    res.render('page/aboutus.html',{
      title : "เกี่ยวกับเรา",
      isAuthenticated : true,
      user : user
    });
  }
});

router.get('/docapi',function(req,res,next){
  if(!req.isAuthenticated()){  
    res.render('page/doc.html',{
      title : "คู่มือการใช้ API",
      isAuthenticated : false
    });
  }else {
    var user = req.user;
              if(user !== undefined) {
                user = user.toJSON();
              }
    res.render('page/doc.html',{
      title : "คู่มือการใช้ API",
      isAuthenticated : true,
      user : user
    });
  }
});

router.get('/userprofile',function(req,res,next){
  if(!req.isAuthenticated()){  
    res.redirect('/signup');
  }else {
    var user = req.user;
              if(user !== undefined) {
                user = user.toJSON();
    }
    console.log(user.username);
    SQL.query('SELECT * FROM tblusers WHERE username = "'+user.username+'"',function(err,result){
      if(err) throw err;
      var create = 'insert';
      var edit = 'edit';
      SQL.query('SELECT id_word,word, DATE_FORMAT(dateandtime,\'%a %m %b %y\') as dateandtime FROM history WHERE username = "'+user.username+'" AND method ="'+create+'" ORDER BY dateandtime DESC',function(err,history){
        if(err) throw err;
        SQL.query('SELECT id_word,word, DATE_FORMAT(dateandtime,\'%a %m %b %y\') as dateandtime FROM history WHERE username = "'+user.username+'" AND method ="'+edit+'" ORDER BY dateandtime DESC',function(err,edit){
          if(err) throw err;
          res.render('page/userprofile.html',{
            title : "หน้าโปรไฟล์ : "+ user.username ,
            isAuthenticated : true,
            user : user,
            result : result,
            history : history,
            edit:edit
          });
        });
          
      });
      
    });
    
  }
});

module.exports = router;
