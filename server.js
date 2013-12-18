var http = require('http')
  , path = require('path')
  //, connect = require('connect')
  , express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , app = express()
  , _ = require('underscore')
  , mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/socktest');


var cookieParser = express.cookieParser('your secret sauce')
  //, sessionStore = new connect.middleware.session.MemoryStore()
  , sessionStore = new mongoStore({ db: 'socktest', collection: 'sessions'});
  ;


app.use(express.favicon());
app.use(express.static('./public'));


app.configure(function () {
  app.set('views', path.resolve('views'));
  app.set('view engine', 'jade');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore }));
  app.use(app.router);
});

var server = http.createServer(app)
  , io = require('socket.io').listen(server);

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);


require('./app/models/clients');

var Clients = mongoose.model('Clients')

app.get('/test', function(req, res) {
  req.session.remoteaddress = req.connection.remoteAddress;
  //res.render('index');
  res.end();
});

sessionSockets.on('connection', function (err, socket, session) {

  if(_.isUndefined(session.to)){
      
      session.to = (new Date()).getTime();
      session.save();

      var clients = new Clients({code:session.to});
      clients.save(function(err) {
          if (err) {
              console.log(err.errors);              
          }
      });
  }
  
  socket.emit('init',session);

  sessionSockets
    .of('/'+ session.to)
    .on('connection', function (err, talk, session) {
    
        talk.emit('session', session);

        talk.on('data_current',function(value){
          
          value.remoteaddress = session.remoteaddress;

          Clients.findOne({ 'code': session.to },function(err, clients){

            clients = _.extend(clients, {info : value , updated : new Date() });
            clients.save();

          });

          session.data_current = value;
          session.save();



        });

        talk.on('comment', function(value) {

          Clients.findOne({ 'code': session.to },function(err, clients){

            clients.updated = new Date();
            clients.talk.push({
              user: 'Client',
              comment: value
            });

            clients.save();
            
          });

          
        });

  });

  

});

server.listen(3000);