/**
 * Created by bianlz on 2014/10/30.
 */
var mongodb = require('./db');
var markdown = require('markdown').markdown;
function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
}
module.exports = Post;
Post.prototype.save = function(callback){
    var date = new Date();
    var time = {
        date :date,
        year : date.getFullYear(),
        month :date.getFullYear() +'-'+(date.getMonth()+1),
        day : date.getFullYear() + '-' +(date.getMonth()+1) +"-"+(date.getDate())
    }
    var post = {
        title : this.title,
        name :this.name,
        time : time,
        post : this.post
    }
    mongodb.open(function(err,db){
        if(err){
            callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}
Post.getAll = function(name,callback){
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            collection.find(query).sort({time:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                docs.forEach(function(doc){
                    doc.post = markdown.toHTML(doc.post);
                })
                callback(null,docs);
            });
    });
    });
}

Post.getOne = function(name,day,title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                "name":name,
                "time.day":day,
                "title":title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                doc.post = markdown.toHTML(doc.post);
                callback(null,doc);
            });
        });
    });
}
Post.edit = function(name,day,title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                "name":name,
                "time.day":day,
                "title":title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            });
        });
    });
}
Post.update=function(name,day,title,post,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "name":name,
                "day":day,
                "title":title
            },{set:{post:post}},function(err){
                mongodb.close();
                if(err){
                   return callback(err);
                }
                return callback(null);
            });
        });
    });
}
Post.remove=function(name,day,title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                "name":name,
                "time.day":day,
                "title":title
            },{w:1},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null);
            })
        });
    });
}