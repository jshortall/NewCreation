var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var config = {
	http_port:8765,
	environment:'development',
	cookie_secret:'testing-secret'
}
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')(config.cookie_secret);
var session = require('express-session');
var sessionStore;
if (config.environment == 'production') {
	console.log('RedisStore');
	var RedisStore = require('connect-redis')(session);
	sessionStore = new RedisStore(); 
}
else {
	console.log('MemoryStore');
	sessionStore = new session.MemoryStore();
}
var compress = require('compression')();
var EXPRESS_SID_KEY = 'express.sid';

app.set('port', config.http_port);
app.set('working_dir', __dirname);
app.set('views', path.join(app.get('working_dir'), 'components'));
app.set('view engine', 'jade');
app.locals.pretty = true;
// app.use(express.logger('dev'));
app.use(cookieParser);
app.use(session({ store: sessionStore, key:EXPRESS_SID_KEY, resave:true, saveUninitialized:true}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({limit:'50mb'}))

console.log(path.join(__dirname, 'bower_components'));

var pathToPublic = '/';
var pathToViews = '/';
var pages = ['home', 'visit', 'messages', 'calendar', 'about'];
app.get('/', function(req, res){
	res.render('layout', {page:'home', pathToViews:pathToViews, pathToPublic:pathToPublic});
});
app.get('/:name.html', function(req, res){
	console.log('get', req.params.name);
	res.render(req.params.name, {pathToViews:pathToViews, pathToPublic:pathToPublic});
});
app.get('/:name', function(req, res, next){
	if(pages.indexOf(req.params.name) != -1) {
		res.render(req.params.name + '-page', {page:req.params.name, pathToViews:pathToViews, pathToPublic:pathToPublic});
	}
	else {
		next();
	}
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build')));
app.use(compress);

app.use(function(err, req, res, next){
	console.log('EXPRESS CAUGHT ERROR:');
	console.error(err.stack);
	res.send({status:'ERROR', message:[{display_msg:'Something went wrong on our end. Please Contact Us.', debug_msg:'Uncaught Exception caught by Express'}]});
	setTimeout(function(){
		process.exit(1);
	}, 1000);
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
