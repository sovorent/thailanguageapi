  var SQL = require('../model/mysql');
var Model = require('../model/user.model');
var idword;
var alreadyreport = -1;
var isAdmin;
//var mongoose = require('mongoose');
//var Schema = mongoose.Schema
//var twitSchema = new Schema({
//  text: String,
//})
//var exTweet = mongoose.model('extweet', twitSchema);
// GET
var word = function(req, res, next) {
    var owner ;
    SQL.query('SELECT word.id_word,word.word, word.partofspeech, word.meaning,word.synonym, word.prononciation, tag_mst.tag_name , tag_mst.tag_id FROM word LEFT JOIN tag ON (word.id_word = tag.id_word) LEFT JOIN tag_mst ON (tag.tag_id = tag_mst.tag_id) WHERE word.id_word  = '+req.query.id_word+'', function(err, rows) {
      //result = JSON.stringify(rows);
      if(err) throw (err);
      if(rows.length == 0){
        res.render('page/error.html', {
              title: 'ไม่พบคำศัพท์ : ' + req.query.id_word ,
              error: 'ไม่พบคำศัพท์',
              message: 'error'
            });
      }else {
        idword = rows[0].id_word ;
        if(!req.isAuthenticated()){
          var User = "guest" ;
          SQL.query('INSERT INTO search_history (id_word, user) VALUES ('+idword+',"'+User+'")', function(err){
            if(err) throw err;
            console.log('search_history finish');
          });
        }else{
          var user = req.user;
                if(user !== undefined) {
                  user = user.toJSON();
                }
          SQL.query('INSERT INTO search_history (id_word, user) VALUES ('+idword+',"'+user.username+'")', function(err){
            if(err) throw err;
            console.log('search_history finish');
          });
        }
        SQL.query('SELECT username FROM history WHERE id_word = '+idword+' and method = "insert"',function(err,username){
          if(err) throw err;
          if(username.length == 0) console.log('error ! no one insert this word');
          else {
            if(req.isAuthenticated()){
              var user = req.user;
              if(user !== undefined) {
                user = user.toJSON();
              }
              if(user.username == username[0].username){
                console.log('this member is owner with this word');
                owner = 1;
              }else owner = 0;
            }
          }
        });
        SQL.query('SELECT method,word,partofspeech,prononciation,meaning,synonym,tag,DATE_FORMAT(dateandtime,\'%a %m %b %y\') as dateandtime, username FROM history WHERE id_word = '+idword+'  ORDER BY number DESC',function(err,history){
            if(err) {
              console.log(err);
            }else{
              SQL.query('SELECT tag_name FROM tag_mst WHERE 1',function(err,tagname){
                if(err) throw err;
                //mongoose.connect('mongodb://localhost:27017/tweetdb');
                //"text" : /.*นอน.*/
                //exTweet.collection.findOne({"text" : {'$regex':history[0].word}},function(err,twit){
                  //if(err) console.log(err);
                  else {
                    //mongoose.connection.close();
                    var example = "--";
                    //if(twit == null) example = "";
                    //else example = twit.text;
                    var have_doo = rows[0].meaning.indexOf('ดู ');
                    if(! req.isAuthenticated()){
                      if(have_doo >-1 && have_doo < 4){
                        var meaningstr = rows[0].meaning.slice(rows[0].meaning.indexOf('ดู ')+3,rows[0].meaning.indexOf(' ',rows[0].meaning.indexOf('ดู ')+3)) ;
                        res.render('page/word.html' , {
                          MeaningCorrect : false,
                          isAuthenticated : false,
                          title: 'คำศัพท์ : ',
                          sql: rows,
                          history: history,
                          meaningstr : meaningstr,
                          tagname : tagname,
                          owner : owner,
                          alreadyreport : alreadyreport,
                          isAdmin : false,
                          example : example
                        });
                      }else {
                        res.render('page/word.html' , {
                          MeaningCorrect : true,
                          isAuthenticated : false,
                          title: 'คำศัพท์ : ',
                          sql: rows,
                          history: history,
                          tagname : tagname,
                          owner : owner,
                          alreadyreport : alreadyreport,
                          isAdmin : false,
                          example : example
                        });
                      }
                    }else{
                      var user = req.user;
                      if(user !== undefined) {
                        user = user.toJSON();
                      }
                      if(user.username == 'admin') isAdmin = true;
                      else isAdmin = false;
                      SQL.query('SELECT * FROM reported WHERE id_word = '+idword+' AND username="'+user.username+'"',function(err,report){
                        if(err) throw err;

                        if(report.length == 0) alreadyreport = 0;
                        else alreadyreport = 1;

                        if(have_doo >-1 && have_doo < 4){
                          var meaningstr = rows[0].meaning.slice(rows[0].meaning.indexOf('ดู ')+3,rows[0].meaning.indexOf(' ',rows[0].meaning.indexOf('ดู ')+3)) ;
                          console.log(alreadyreport);
                          res.render('page/word.html' , {
                            MeaningCorrect : false,
                            isAuthenticated : true,
                            title: 'คำศัพท์ : ',
                            sql: rows,
                            history: history,
                            meaningstr : meaningstr,
                            user : user,
                            tagname : tagname,
                            owner : owner,
                            alreadyreport : alreadyreport,
                            isAdmin : isAdmin,
                            example : example
                          });
                        }else {
                          console.log(alreadyreport);
                          res.render('page/word.html' , {
                            MeaningCorrect : true,
                            isAuthenticated : true,
                            title: 'คำศัพท์ : ',
                            sql: rows,
                            history: history,
                            user : user,
                            tagname : tagname,
                            owner : owner,
                            alreadyreport : alreadyreport,
                            isAdmin : isAdmin,
                            example : example
                          });
                        }
                      });
                    }
                  }
                //});

              });
              
              
            }
        });
      }
            
    });
};

var saveedit = function(req,res,next) {
      var user = req.user.toJSON();
      var word =req.body;
      var method = 'edit' ;
      var tag_multi = [];
      if (word.partofspeech == null ) word.partofspeech = "" ;
      // save log
      SQL.query('INSERT INTO history(username,method,id_word,word,partofspeech,prononciation,meaning,synonym,tag)VALUES ("'+user.username+'","'+method+'",'+idword+',"'+word.word+'","'+word.partofspeech+'","'+word.prononciation+'","'+word.meaning+'","'+word.synonym+'","'+word.tags+'")', function(err){
             if (err) console.log(err);
             else console.log("1. already insert all  :) ");
             // delete tag  table
            SQL.query('DELETE FROM tag WHERE id_word = '+idword+'',function(err){
                   if (err) console.log(err);
                   else console.log("2. delete tag table id :" + idword);
                   //update word table
                  SQL.query('UPDATE word SET word="' + word.word+'" , partofspeech = "'+word.partofspeech+'",prononciation = "'+word.prononciation+'",meaning="'+word.meaning+'" ,synonym="'+word.synonym+'" ,tag="'+word.tags+'" WHERE id_word = '+idword+'',function(err){
                          if(err) console.log(err);
                          else console.log("3. update success : " + word.word);
                          if (word.tags.length == 0) {
                            console.log('This edit has no tag...');
                            res.redirect('/word?id_word='+idword+'');
                          }else {
                                tag_multi = word.tags.split(",");
                                var numberoftag = tag_multi.length;
                                console.log("4.1 total tag = " + numberoftag);
                                console.log(tag_multi);
                                for (var i  in tag_multi){
                                       console.log("tag name : " + tag_multi[i]);
                                       SQL.query('SELECT tag_id, tag_name FROM tag_mst WHERE tag_name = "'+tag_multi[i]+'"', function(err,tagid){
                                             if (err) console.log(err);
                                             else {
                                                    if(tagid.length != 0) {
                                                          console.log('5.1 already has this tag : '+ tagid[0].tag_id + tagid[0].tag_name);
                                                          SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+idword+','+tagid[0].tag_id+')', function(err){
                                                                 if (err) console.log(err);
                                                                 else {
                                                                       console.log("6. Already insert to tag table : " + tagid[0].tag_id +" # "+ tagid[0].tag_name);
                                                                       if(tagid[0].tag_name == tag_multi[numberoftag-1]){
                                                                            console.log('finally with  '+ tagid[0].tag_name);
                                                                            res.redirect('/word?id_word='+idword+'');
                                                                       }
                                                                 }
                                                          });
                                                    }else {
                                                          console.log ("5.2 never has this tag : "+ tag_multi[i]);
                                                          SQL.query('INSERT INTO tag_mst( tag_name) VALUES ("'+tag_multi[i]+'")' , function(err){
                                                                if(err) console.log(err);
                                                                else {
                                                                       console.log("5.2.1 Add new tag : " + tag_multi[i]);
                                                                       SQL.query('SELECT tag_id,tag_name FROM tag_mst WHERE tag_name ="'+tag_multi[i]+'"',function(err,tagID){
                                                                              if(err) console.log(err);
                                                                              else {
                                                                                   SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+idword+','+tagID[0].tag_id+')', function(err){
                                                                                    if (err) console.log(err);
                                                                                    else {
                                                                                           console.log("6. Already insert to tag table : " + tagID[0].tag_name + tagID[0].tag_id);
                                                                                           if(tagID[0].tag_name == tag_multi[numberoftag-1]){
                                                                                                console.log('finally with tag ' + tagID[0].tag_name);
                                                                                                res.redirect('/word?id_word='+idword+'');
                                                                                           }
                                                                                    }
                                                                                  });       
                                                                              }
                                                                       });
                                                                 }
                                                          });
                                                    }
                                             }
                                       });
                                }
                          }
                   });
             });


      });
};

var callback = function(req,res,next){
  var user = req.user.toJSON();
  var method = 'roll-back';
    console.log("number of history to callback : " + req.query.id);
    SQL.query('SELECT * FROM history WHERE number ='+req.query.id+' ', function(err,result){
      if(err) console.log(err);
      else {
        console.log(result[0]);
        SQL.query('UPDATE word SET word="' + result[0].word+'" , partofspeech = "'+result[0].partofspeech+'",prononciation = "'+result[0].prononciation+'",meaning="'+result[0].meaning+'" ,tag="'+result[0].tag+'" WHERE id_word = '+result[0].id_word+'',function(err){
          if(err) console.log(err);
          else {
            console.log('finish update :)');
            SQL.query('INSERT INTO history(username,method,id_word,word,partofspeech,prononciation,meaning,synonym,tag)VALUES ("'+user.username+'","'+method+'",'+result[0].id_word+',"'+result[0].word+'","'+result[0].partofspeech+'","'+result[0].prononciation+'","'+result[0].meaning+'","'+result[0].synonym+'","'+result[0].tag+'")', function(err){
              if(err) console.log(err);
              else {
                console.log('Log History finish :))');
                SQL.query('DELETE FROM tag WHERE id_word = '+result[0].id_word+'',function(err){
                  if(err) console.log(err);
                  else{
                    console.log('already delete tag table');
                    var tag = result[0].tag.split(',');
                    console.log(tag);
                    var numoftag = tag.length;
                    if(tag.length != 0){
                      for (var i  in tag){
                        SQL.query('SELECT tag_id, tag_name FROM tag_mst WHERE tag_name = "'+tag[i]+'"', function(err,tagid){
                          if (err) console.log(err);
                          else {
                            console.log('tag : '+ tagid[0].tag_id + tagid[0].tag_name);
                            SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+result[0].id_word+','+tagid[0].tag_id+')', function(err){
                              if (err) console.log(err);
                              else {
                                console.log("Already insert to tag table : " + tagid[0].tag_id +" # "+ tagid[0].tag_name);
                                if(tagid[0].tag_name == tag[numoftag-1]){
                                  console.log('finally');
                                  res.redirect('/word?id_word='+result[0].id_word+'');
                                }
                              }
                            });
                          }
                        });
                      }
                    }else {
                      console.log('has no tag...');
                      res.redirect('/word?id_word='+result[0].id_word+'');
                    }
                  }
                });
              }
            });
          }
        });
      }
    });
}

var deleteword = function(req,res,next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  console.log('delete word ' + idword);
  var user = req.user.toJSON();
  var method =  "delete" ;
  SQL.query('INSERT INTO history(username,method,id_word)VALUES ("'+user.username+'","'+method+'",'+idword+')',function(err){
    if(err) throw err;
    SQL.query('DELETE FROM word WHERE id_word = '+idword+'',function(err){
      if(err) throw err;
      res.redirect('/');
    });   
  })
    
}

var reported = function(req,res,next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  var user = req.user.toJSON();
  SQL.query ('INSERT INTO reported (id_word, username) VALUES ('+idword+',"'+user.username+'")',function(err){
    if(err) throw err;
    alreadyreport = 1;
    res.redirect('/word?id_word=' + idword);
  });
}

var unreported = function(req,res,next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  var user = req.user.toJSON();
  SQL.query ('DELETE FROM reported WHERE id_word = '+idword+' and username = "'+user.username+'"',function(err){
    if(err) throw err;
    alreadyreport = 0;
    res.redirect('/word?id_word='+idword);
  });
}



// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('page/error.html', {
    title : title,
   	error: '404 Not Found',
   	message: 'error'
   });
};

// export functions
/******************************i********/
// index
module.exports.word = word;
module.exports.saveedit = saveedit
module.exports.callback = callback
module.exports.deleteword = deleteword
module.exports.reported = reported
module.exports.unreported = unreported
// 404 not found
module.exports.notFound404 = notFound404;