var fs = require('fs');
var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var hbs = require('hbs');
var port = 5080;

var ga = false;

/*
* express server setup
*/
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(favicon(__dirname + '/public/img/favicon.ico'));
fs.exists(__dirname + '/views/ga.html', function (exists) {
  if(exists){
    ga = true;
    hbs.registerPartial('ga', fs.readFileSync(__dirname + '/views/ga.html', 'utf8'));
  }
});
hbs.registerPartial('footer', fs.readFileSync(__dirname + '/views/footer.html', 'utf8'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.multipart());
app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));
app.listen(port);

app.get('/', function(req, res) {
  res.render('index',{ga:ga});
});

app.get('/:title', function(req, res) {
  res.render('../posts/'+req.params.title,{ga:ga});
});

app.use(notfound);

function notfound (req, res, next){
  res.status(404);
  // respond with html page
  if (req.accepts('html')) return res.render('404');

  // respond with json
  if (req.accepts('json')) return res.send({ error: 'Not found' });

  // default to plain-text. send()
  return res.type('txt').send('Page Not found');
}

function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://jsbin.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}