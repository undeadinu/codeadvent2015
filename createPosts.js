var https = require('https');
var fs = require('fs');
var md = require('markdown-it')();
var _ = require('underscore');

var gistID = process.argv[2];
var modifiedDate = process.argv[3];

fs.readFile('./posts/post_template.html','utf8', function (err, data) {
  if (err) throw err;
  var template = data;

  var options = {
    host: 'api.github.com',
    path: '/gists/'+gistID,
    headers: {'user-agent': 'nodescript'}
  };

  https.request(options, function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      var res = JSON.parse(str);
      var file = res.files[Object.keys(res.files)[0]];
      var pageTitle = file.content.split('\n')[0].replace('# ','');
      var title = md.render(file.content.split('\n')[0]);
      var content = md.render(file.content.split('\n').splice(1).join('\n'));
      var filename = file.filename.split('.')[0].split(' ')[0];
      var date = new Date(modifiedDate||res.created_at);

      //append JSBig tags
      //{{jsbin:url}}
      var reg = /\{\{jsbin:([^\}]+)\}\}/g;
      var found;
      while (found = reg.exec(content)) {
          var tag = '<a class="jsbin-embed" href="'+found[1]+'">JS Bin on jsbin.com</a><script src="http://static.jsbin.com/js/embed.min.js?3.35.4"></script>';
          content = content.replace(found[0], tag);
      }

      // append imges
      var reg2 = /\{\{img:([^\}]+)\}\}/g;
      var found2;
      while (found2 = reg2.exec(content)) {
          var tag2 = '<img src="'+found2[1]+'" width="80%">';
          content = content.replace(found2[0], tag2);
      }

      template = template
                  .replace(/{{date}}/g,date.toISOString().split('T')[0])
                  .replace(/{{filename}}/g, filename)
                  .replace(/{{description}}/g, res.description)
                  .replace(/{{pageTitle}}/g, pageTitle)
                  .replace(/{{title}}/g, title)
                  .replace('{{content}}', content);

      fs.writeFile('./posts/'+filename+'.html', template , function (err) {
        if (err) throw err;
        console.log('file created: ' +filename);
      });

      fs.readFile('./posts/list.json','utf8', function (err, data) {
        var list;
        if(!data){
          list = [];
        }else{
          list = JSON.parse(data);
        }

        var index = _.indexOf(_.pluck(list, 'id'), gistID);
        var postdata = {
          id:gistID,
          filename:filename,
          date:date.toISOString(),
          title:file.content.split('\n')[0].replace('# ',''),
          intro:file.content.split('\n')[1]
        };

        if(index === -1){
          list.push(postdata);
        }else{
          list[index] = postdata;
        }

        list = _.sortBy(list,'date').reverse();

        fs.readFile('./posts/index_template.html','utf8', function (err, data) {
          var str = '';
          var templ = '<section class="note"><a href="./{{filename}}"><h2 class="note-title">{{title}}</h2></a><aside class="post-meta">posted on {{date}}</aside><p class="note-desc">{{intro}} <a href="./{{filename}}">[...]</a></p></section><section class="divider"><img src="/img/snow.png" alt="" class="snow"> <img src="/img/snow.png" alt="" class="snow"> <img src="/img/snow.png" alt="" class="snow"> </section>';
          _.each(list, function(p){
            str += templ.replace(/{{date}}/g, p.date.split('T')[0])
                        .replace(/{{filename}}/g, p.filename)
                        .replace(/{{title}}/g, p.title)
                        .replace('{{intro}}', p.intro );
          });
          fs.writeFile('./views/index.html', data.replace('{{posts}}',str), function(err){
            console.log('index.html saved');
          })
        });
        fs.writeFile('./posts/list.json', JSON.stringify(list,0,2), function(err){
          if (err) throw err;
          console.log('list saved');
        });
      });
    });
  }).end();
});