var SQL = require('../model/mysql');
var Model = require('../model/user.model');
//var Promise= require('bluebird');
// sign in
// GET
var insertword = function(req, res, next) {
   
   if(!req.isAuthenticated()) {
      res.redirect('/signin');
   }
   
   var user = req.user;
   if(user !== undefined) {
            user = user.toJSON();
   }
   SQL.query('SELECT tag_name FROM tag_mst WHERE 1',function(err,tagname){
      res.render('page/insert_word.html', {
      title: 'เพิ่มคำศัพท์ใหม่',
      isAuthenticated : true,
      user : user,
      tagname : tagname
   });
   });
   
};

var savenewword = function(req,res,next){
   var word = req.body;
   var method = 'insert' ;
   var IDWORD ;
   var user = req.user.toJSON();
   var hastag = 0;
   var new_tagid = 0;
   function insertToTagMst(tag_name){
      return new Promise(function(resolve,reject){
         SQL.query('INSERT INTO tag_mst( tag_name) VALUES ("'+tag_name+'")' , function(err){
            if(err) console.log(err);
            else {
               console.log('insertToTagMst done !');
               resolve();
            }
         });
      });
   }
   function insertToTag (id_word,tag_id){
      return new Promise(function(resolve,reject){
         SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+id_word+','+tag_id+')', function(err){
            if (err) console.log(err);
            else {
               console.log('insertToTag done !');
               resolve();
            }
         });
      });
   }
   function selecttagid (){
      return new Promise(function(resolve,reject){
         SQL.query('SELECT tag_id FROM tag_mst ORDER BY tag_id DESC LIMIT 1',function(err,tagID){
            if(!err){
               new_tagid = tagID[0].tag_id;
               resolve();
            }
         });
      });
   }
   function checktag (id_word,tag_name){
      return new Promise(function(resolve,reject){
         SQL.query('SELECT tag_id, tag_name FROM tag_mst WHERE tag_name = "'+tag_name+'"', function(err,tagid){
            if (err) reject(console.log(err));
            else {
               if(tagid.length != 0){
                  console.log('Already has this tag in table : '+ tag_name);
                  insertToTag(id_word,tagid[0].tag_id);
                  resolve();
               }else {
                  console.log('Never has tag : '+ tag_name);
                  insertToTagMst(tag_name).then(function(err){
                     return selecttagid();
                  }).then(function(err){
                     return insertToTag(id_word,new_tagid);
                  });
                  resolve();
               }
            }
         });
      });
   }

   function tag(id_word){
      return new Promise(function(resolve,reject){
         if(word.tags.length != 0){
            var tag_multi = [];
            tag_multi = word.tags.split(',');
            var numberoftag = tag_multi.length;
            console.log(tag_multi);
            for (var i  in tag_multi){
               console.log('#################### '+ tag_multi[i]);
               SQL.query('SELECT tag_id, tag_name FROM tag_mst WHERE tag_name = "'+tag_multi[i]+'"', function(err,tagid){
                  if (err) console.log(err);
                  else {
                     if(tagid.length != 0) {
                        console.log('Already has this tag in table : '+ tagid[0].tag_id + tagid[0].tag_name);
                        SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+id_word+','+tagid[0].tag_id+')', function(err){
                           if (err) console.log(err);
                           else {
                              console.log("Already insert to tag table : " + tagid[0].tag_id +" # "+ tagid[0].tag_name);
                              if(tagid[0].tag_name == tag_multi[numberoftag-1]){
                                 console.log('finally with  '+ tagid[0].tag_name);
                                 res.redirect('/word?id_word='+id_word+'');
                              }
                           }
                        });
                     }else {
                        console.log ("Never has this tag : "+ tag_multi[i]);
                        SQL.query('INSERT INTO tag_mst( tag_name) VALUES ("'+tag_multi[i]+'")' , function(err){
                           if(err) console.log(err);
                           else {
                              console.log("Add new tag into table: " + tag_multi[i]);
                              SQL.query('SELECT tag_id,tag_name FROM tag_mst WHERE tag_name ="'+tag_multi[i]+'"',function(err,tagID){
                                 if(err) console.log(err);
                                 else {
                                    SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+id_word+','+tagID[0].tag_id+')', function(err){
                                       if (err) console.log(err);
                                       else {
                                          console.log("Already insert to tag table : " + tagID[0].tag_name + tagID[0].tag_id);
                                          if(tagID[0].tag_name == tag_multi[numberoftag-1]){
                                             console.log('finally with tag ' + tagID[0].tag_name);
                                             res.redirect('/word?id_word='+id_word+'');
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
         }else{   
            console.log('no tag');
            res.redirect('/word?id_word='+id_word+'');
         }
      });
   }

   function insertToHistory(id_word){
      return new Promise(function(resolve,reject){
         SQL.query('INSERT INTO history(username,method,id_word,word,partofspeech,prononciation,meaning,synonym,tag)VALUES ("'+user.username+'","'+method+'",'+id_word+',"'+word.word+'","'+word.partofspeech+'","'+word.prononciation+'","'+word.meaning+'","'+word.synonym+'","'+word.tags+'")', function(err){
            if(!err) resolve(console.log('insertToHistory done !'));
            else reject(console.log(err));
         });
      });
   }
   function selectIDword(){
      return new Promise(function(resolve,reid_word){
         SQL.query('SELECT id_word FROM word ORDER BY id_word DESC LIMIT 1 ',function(err,ID_word){
            if(!err) {
               console.log('selectIDword done !');
               IDWORD = ID_word[0].id_word;
               resolve(ID_word[0].id_word);
            }else reject(err);
         });
      });
   }
   function insertToWord(){
      return new Promise(function(resolve,reject){
         var zero = 0;
         SQL.query('INSERT INTO word(word,partofspeech,prononciation,meaning,synonym,frequency,tag) VALUES ("'+word.word+'","'+word.partofspeech+'","'+word.prononciation+'","'+word.meaning+'","'+word.synonym+'",'+zero+',"'+word.tags+'")', function(err){
            if(!err) resolve(console.log('insertToWord done !'));
            else reject(console.log(err));
         });
      });
      
   }

   insertToWord().then(function(err){
      return selectIDword();
   }).then(function(err){
      return insertToHistory(IDWORD);
   }).then(function(err){
      return tag(IDWORD);
   });
   

   /*
   word = req.body;
   var user = req.user.toJSON();
   var method = 'insert' ;
   var tag_multi = [];
   console.log(word);
   SQL.query('INSERT INTO word(word,partofspeech,prononciation,meaning,synonym,tag) VALUES ("'+word.word+'","'+word.partofspeech+'","'+word.prononciation+'","'+word.meaning+'","'+word.synonym+'","'+word.tags+'")', function(err){
      if (err) console.log(err);
      else {
         console.log('added word');
         SQL.query('SELECT id_word FROM word ORDER BY id_word DESC LIMIT 1 ',function(err,id_word){
            if(err) console.log(err);
            else {
               console.log(id_word[0].id_word);
               var idword = id_word[0].id_word;
               SQL.query('INSERT INTO history(username,method,id_word,word,partofspeech,prononciation,meaning,synonym,tag)VALUES ("'+user.username+'","'+method+'",'+idword+',"'+word.word+'","'+word.partofspeech+'","'+word.prononciation+'","'+word.meaning+'","'+word.synonym+'","'+word.tags+'")', function(err){
                  if (err) console.log(err);
                  else {
                     if (word.tags.length == 0) {
                        console.log('This edit has no tag...');
                        res.redirect('/word?id_word='+idword+'');
                     }else {
                        tag_multi = word.tags.split(",");
                        var numberoftag = tag_multi.length;
                        console.log("Total tag = " + numberoftag);
                        console.log(tag_multi);
                        for (var i  in tag_multi){
                           console.log("tag name : " + tag_multi[i]);
                           SQL.query('SELECT tag_id, tag_name FROM tag_mst WHERE tag_name = "'+tag_multi[i]+'"', function(err,tagid){
                              if (err) console.log(err);
                              else {
                                 if(tagid.length != 0) {
                                    console.log('Already has this tag in table : '+ tagid[0].tag_id + tagid[0].tag_name);
                                    SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+idword+','+tagid[0].tag_id+')', function(err){
                                          if (err) console.log(err);
                                          else {
                                             console.log("Already insert to tag table : " + tagid[0].tag_id +" # "+ tagid[0].tag_name);
                                             if(tagid[0].tag_name == tag_multi[numberoftag-1]){
                                                console.log('finally with  '+ tagid[0].tag_name);
                                                res.redirect('/word?id_word='+idword+'');
                                             }
                                          }
                                    });
                                 }else {
                                    console.log ("Never has this tag : "+ tag_multi[i]);
                                    SQL.query('INSERT INTO tag_mst( tag_name) VALUES ("'+tag_multi[i]+'")' , function(err){
                                       if(err) console.log(err);
                                       else {
                                          console.log("Add new tag into table: " + tag_multi[i]);
                                          SQL.query('SELECT tag_id,tag_name FROM tag_mst WHERE tag_name ="'+tag_multi[i]+'"',function(err,tagID){
                                             if(err) console.log(err);
                                             else {
                                                SQL.query('INSERT INTO tag(id_word,tag_id) VALUES('+idword+','+tagID[0].tag_id+')', function(err){
                                                   if (err) console.log(err);
                                                   else {
                                                      console.log("Already insert to tag table : " + tagID[0].tag_name + tagID[0].tag_id);
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
                  }
               });
            }
         });
      }
   });
   */
}
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
module.exports.insertword = insertword;

module.exports.savenewword = savenewword;
// 404 not found
module.exports.notFound404 = notFound404;