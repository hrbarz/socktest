var http = require('http'),
	express = require('express'),
    connect = require('connect'),
    mongoStore = require('connect-mongo')(express),
    config = require('./config'), 

    path = require('path');


module.exports = function(app, passport, db) {

    app.locals.pretty = true;

    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    app.use(express.favicon());
    app.use(express.static(config.root + '/public'));

    console.log(config.root );

    app.enable("jsonp callback");

	var cookieParser = express.cookieParser('your secret sauce')

	mStore = new connect.middleware.session.MemoryStore(); /*new mongoStore({
                db: db.connection.db,
                collection: 'sessions'
            });*/

    app.configure(function() {

		app.set('views', path.resolve('views'));
		app.set('view engine', 'jade');


        app.use(cookieParser);
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.session({
            secret: 'tst',
            store: mStore
        }));

        
        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);


    });



	

    var server = http.createServer(app)
	  , io = require('socket.io').listen(server);

	var SessionSockets = require('session.socket.io')
  	  , sessionSockets = new SessionSockets(io, mStore, cookieParser);


	/*io.sockets.on('connection', function (socket) {
	  
	  socket.on('ferret', function (name, fn) {
	    fn('woot');
	    console.log(name);
	  });

	});*/

	sessionSockets.on('connection', function (err, socket, session) {

	  console.log('-------');
	  console.log(session);

	  socket.emit('session', session);

	  socket.on('foo', function(value) {
	  	console.log('++++');
	  	console.log(session);
	    session.foo = value;
	    session.save();
	    socket.emit('session', session);
	  });

	});

	app.get('/', function(req, res) {
	  req.session.foo = req.session.foo || 'bar';
	  res.render('index');
	});

	
	var port = process.env.PORT || config.port;
	console.log('Express app started on port ' + port);

	server.listen(port);


}