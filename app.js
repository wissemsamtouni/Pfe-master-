var createError = require('http-errors');
var express = require('express');
var path = require('path');
const http=require("http");
const database =require('./database.json');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
const mongoose =require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const flash = require('connect-flash');
var indexRouter = require('./routes/index');
const User = require('./models/user');
const userRoutes = require('./routes/userRoutes');
var app = express();

// Configuration de la session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Configuration de Passport
passport.use(new LocalStrategy({
  usernameField: 'email'
}, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Adresse email incorrecte.' });
    }
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        return done(err);
      }
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Mot de passe incorrect.' });
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//azure datbase configuration
const sql = require('mssql');

const config = {
    user: 'serveur', // better stored in an app setting such as process.env.DB_USER
    password: 'Wissemsm@', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'sqlpfeserveur.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'pfedb', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

/*
    //Use Azure VM Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        port: process.env["db_port"],
        database: process.env["db_database"],
        authentication: {
            type: 'azure-active-directory-msi-vm'
        },
        options: {
            encrypt: true
        }
    }

    //Use Azure App Service Managed Identity to connect to the SQL database
    const config = {
        server: process.env["db_server"],
        port: process.env["db_port"],
        database: process.env["db_database"],
        authentication: {
            type: 'azure-active-directory-msi-app-service'
        },
        options: {
            encrypt: true
        }
    }
*/

console.log("Starting...");
connectAndQuery();

async function connectAndQuery() {
    try {
        var poolConnection = await sql.connect(config);

        console.log("Reading rows from the Table...");
        var resultSet = await poolConnection.request().query(`SELECT TOP 5 [temperature], [EventProcessedUtcTime], [PartitionId], [EventEnqueuedUtcTime], [IoTHub]
        FROM [dbo].[TelemetryData]`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        // output column headers
        var columns = "";
        for (var column in resultSet.recordset.columns) {
            columns += column + ", ";
        }
        console.log("%s\t%s\t%s\t%s\t%s", "temperature", "EventProcessedUtcTime", "PartitionId", "EventEnqueuedUtcTime", "IoTHub");
        // ouput row contents from default record set
        resultSet.recordset.forEach(row => {
          console.log("%s\t%s\t%s\t%s\t%s", row.temperature, row.EventProcessedUtcTime, row.PartitionId, row.EventEnqueuedUtcTime, row.IoTHub);
        });


        // close connection only when we're certain application is finished
        poolConnection.close();
    } catch (err) {
        console.error(err.message);
    }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css',express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/pfedb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB : '));
db.once('open', function() {
  console.log('Connexion à MongoDB réussie.');
});

// Middleware pour le traitement des données POST
app.use(express.urlencoded({ extended: true }));


// Routes pour l'authentification et l'administration des utilisateurs
app.use('/', userRoutes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const server =http.createServer(app);
server.listen(3000,()=>console.log("bienvenus"));
module.exports = app;
