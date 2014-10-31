
/*
 * GET home page.
 */
var crypto = require('crypto');
var fs = require('fs');
User = require('../models/user.js');
Post = require('../models/post.js');

module.exports = function(app){
    app.get('/',function(req,res){
       Post.getAll(null,function(err,posts){
           if(err){
               posts = [];
           }
           res.render('index',{
               title:'主页',
               user:req.session.user,
               posts:posts,
               success:req.flash('success').toString(),
               error:req.flash('error').toString()
           })
       })
    });
    app.get('/reg',checkNotLogin);
    app.get('/reg',function(req,res){
        res.render('reg',{
            title:'注册',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    app.get('/reg',checkNotLogin);
    app.post('/reg',function(req,res){
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        if(''==password){
            req.flash('error','请填写密码!')
            return res.redirect('/reg');
        }
        if(''==password){
            req.flash('error','请填写确认密码!')
            return res.redirect('/reg');
        }
        if(password!=password_re){
            req.flash('error','两次输入的密码不一致!')
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(password).digest('hex');
        var newUser = new User({
            name:name,
            password:password,
            email:req.body.email
        });
        User.get(newUser.name,function(err,user){
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            if(user){
                req.flash('error','用户已经存在!');
                return res.redirect('/reg');
            }
            newUser.save(function(err,user){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }
                req.session.user = user;
                req.flash('success','注册成功!');
                res.redirect('/');
            });
        })

    });
    app.get('/reg',checkNotLogin);
    app.get('/login',function(req,res){
        res.render('login',{
            title:'登录',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    app.get('/reg',checkNotLogin);
    app.post('/login',function(req,res){
        var name = req.body.name,
            password = req.body.password;
        if(''==name.trim()){
            req.flash('error','请填写用户名称!');
            return res.redirect('/login');
        }
        if(''==password.trim()){
            req.flash('error','请填写密码!');
            return res.redirect('/login');
        }
        var md5 = crypto.createHash('md5');
            password = md5.update(password).digest('hex');
        User.get(name,function(err,user){
            if(err){
                req.flash('error',err);
                return res.redirect('/login');
            }
            if(!user){
                req.flash('error','用户不存在!');
                return res.redirect('/login');
            }
            if(password!=user.password){
                req.flash('error','密码错误!');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success','登录成功!');
            return res.redirect('/');
        });
    });
    app.get('/post',checkLogin);
    app.get('/post',function(req,res){
        res.render('post',{
            title:'发表',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    app.get('/reg',checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','登出成功!');
        return res.redirect('/');
    });
    app.post('/post',checkLogin);
    app.post('/post',function(req,res){
       var post = new Post(req.session.user.name,req.body.title,req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','发表成功!');
            return res.redirect('/');
        });
    });
    app.get('/upload',checkLogin);
    app.get('/upload',function(req,res){
        res.render('upload',{
            title:'文件上传',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    });
    app.post('/upload',checkLogin);
    app.post('/upload',function(req,res){
       for(var i in req.files){
            if(req.files[i].size==0){
                fs.unlinkSync(req.files[i].path);
                console.log('del');
            }else{
                var target_path = './public/images/'+req.files[i].name;
                fs.renameSync(req.files[i].path,target_path);
                console.log('rename');
            }
       }
        req.flash('success','成功上传');
        return res.redirect('/upload');
    });
    app.get('/u/:name',function(req,res){
        User.get(req.params.name,function(err,user){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            if(!user){
                req.flash('error','用户不存在!');
                return res.redirect('/');
            }
            Post.getAll(req.params.name,function(err,posts){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/');
                }
                res.render('user',{
                    title:user.name,
                    user:user,
                    posts:posts,
                    success:req.flash('success').toString(),
                    error:req.flash('error').toString()
                });
            });
        });
    });
    app.get('/u/:name/:day/:title',function(req,res){
           Post.getOne(req.params.name,req.params.day,req.params.title,function(err,doc){
               if(err){
                   req.flash('error',err);
                   return res.redirect('/');
               }
               res.render('article',{
                   title:req.params.title,
                    post:doc,
                   user:req.session.user,
                   success:req.flash('success').toString(),
                   error:req.flash('error').toString()
               });
           });
    });
    app.get('/edit/:name/:day/:title',checkLogin);
    app.get('/edit/:name/:day/:title',function(req,res){
        Post.edit(req.session.user.name,req.params.day,req.params.title,function(err,post){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('edit',{
                title:"编辑",
                post:post,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });
    });
    app.post('/edit/:name/:day/:title',checkLogin);
    app.post('/edit/:name/:day/:title',function(req,res){
       Post.update(req.session.user.name,req.params.day,req.params.title,req.params.post,function(err){
           var url = '/u/'+ req.session.user.name +'/'+req.params.day +'/'+req.params.title;
           if(err){
                req.flash('error',err);
               return res.redirect(url);
           }
           req.flash('success','修改成功!');
           return res.redirect(url);
       });
    });
    app.get('/remove/:name/:day/:title',checkLogin);
    app.get('/remove/:name/:day/:title',function(req,res){
        Post.remove(req.session.user.name,req.params.day,req.params.title,function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('back');
            }
            req.flash('success','删除成功!');
            return res.redirect('/');
        });
    });
    function checkLogin(req,res,next){
        if(!req.session.user){
            req.flash('error','未登录');
            return res.redirect('/login');
        }
        next();
    }
    function checkNotLogin(req,res,next){
        if(req.session.user){
            req.flash('error','已登录');
            return res.redirect('back');
        }
        next();
    }
}