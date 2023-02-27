const bcrypt = require('bcrypt');
const User = require('../models/user');
var passport = require('passport');
const sql = require('mssql');
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const config = {
    user: 'serveur', // better stored in an app setting such as process.env.DB_USER
    password: '', // better stored in an app setting such as process.env.DB_PASSWORD
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
// Affichage du formulaire de login
exports.login_get = function(req, res) {
  res.render('login');
};

// Traitement du formulaire de login
exports.login_post = function(req, res, next) {
  
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
      
    }
    console.log(user);
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      if (user.role === 'admin') {
        return res.redirect('/admin');
      } else {
        return res.redirect('/index');
      }
    });
  })(req, res, next);
};

// Affichage de la page d'administration
exports.admin_get = function(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    User.find({}, function(err, users) {
      if (err) {
        return next(err);
      }
      res.render('admin', { users: users });
    });
  } else {
    res.redirect('/login');
  }
};
exports.user_get = async function(req, res, next) {
  console.log(req.user && req.user.role === 'utilisateur')
    if (req.user && req.user.role === 'utilisateur') {
      User.findOne({ _id: req.user._id }, async function(err, users) {
        if (err) {
          return next(err);
        }

        var poolConnection = await sql.connect(config);
  
        console.log("Reading rows from the Tableb hhhh...");
        var resultSet = await poolConnection.request().query(`SELECT TOP 1 [temperature], [EventProcessedUtcTime], [PartitionId], [EventEnqueuedUtcTime], [IoTHub]
        FROM [dbo].[TelemetryData] ORDER BY EventEnqueuedUtcTime DESC`);
    
        
        const data = resultSet.recordset;


        res.render('index', { users: users , data: data});
      });
    } else {
      res.redirect('/login');
    }
  };
  exports.forgetPassword_get = function(req, res, next) {
    res.render('forgetPassword');
  };
 exports.forgetPassword_post = async function(req, res, next) {
    const{email}=req.body;
    try{
      const userWithEmailExist = await User.findOne({email});
      if(!userWithEmailExist){
        return res.status(400).json({msg:"email not found"});
      }
      if (!userWithEmailExist.token) {
        userWithEmailExist.token = crypto.randomBytes(32).toString("hex");
        userWithEmailExist.save()
    }
    console.log(userWithEmailExist._id)
    const link = `http://localhost:3000/reset/${userWithEmailExist._id}/${userWithEmailExist.token}`;
    await sendEmail(userWithEmailExist, "Réinitialisation du mot de passe", link);
    
    res.redirect('/');
  
    }catch(err){
      console.log(err);
    }
  };


// Affichage du formulaire d'ajout d'utilisateur
exports.user_create_get = function(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    res.render('create_user');
  } else {
    res.redirect('/');
  }
};
exports.resetPassword_get = async function(req, res, next) {
try {
  const { _id, token } = req.params;
 return res.render('resetPassword', { _id, token }); 
} catch (error) {
  return res.status(400).json({msg:"token not found"});
}
 
};
exports.resetPassword_post = async function(req, res, next) {
  try{
    const userForReset = await User.findById({_id:req.params._id});
    if(!userForReset){
      return res.status(400).json({msg:"user not found"});
    }
    console.log(userForReset)
    if (userForReset.token !== req.params.token) {
      return res.status(400).json({msg:"token not found"});
    }
    const  {password}  = req.body;
    console.log(password)
    bcrypt.hash(password, 10,  function(err, hashedPassword) {
      if (err) {
        return next(err);
      }
      userForReset.password = hashedPassword;
      userForReset.token = null;
       userForReset.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    })

  //   res.status(200).json({
  //     message: "mot de passe réinitialisé avec succès",
  //     titre: "SUCCESS"
  // });
}
    catch(err){
      res.redirect('error')
      }
      
  };

// Traitement du formulaire d'ajout d'utilisateur
exports.user_create_post = function(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    const { nom, prenom, email, adresse, telephone, role, password } = req.body;
    bcrypt.hash(password, 10, function(err, hashedPassword) {
      if (err) {
        return next(err);
      }
      const user = new User({
        nom: nom,
        prenom: prenom,
        email: email,
        adresse: adresse,
        telephone: telephone,
        role: role,
        password: hashedPassword
      });
      user.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/admin');
      });
    });
  } else {
    res.redirect('/login');
  }
};

// Affichage du formulaire de modification d'utilisateur
exports.user_update_get = function(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return next(err);
      }
      res.render('modifier', { user: user });
    });
  } else {
    res.redirect('/login');
  }
};

// Traitement du formulaire de modification d'utilisateur
exports.user_update_post = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      const { nom, prenom, email, adresse, telephone, role } = req.body;
      User.findById(req.params.id, function(err, user) {
        if (err) {
          return next(err);
        }
        user.nom = nom;
        user.prenom = prenom;
        user.email = email;
        user.adresse = adresse;
        user.telephone = telephone;
        user.role = role;
        user.save(function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/admin');
        });
      });
    } else {
      res.redirect('/login');
    }
  };
  
  // Affichage de la page de suppression d'utilisateur
  exports.user_delete_get = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      User.findById(req.params.id, function(err, user) {
        if (err) {
          return next(err);
        }
        res.render('supprimer', { user: user });
      });
    } else {
      res.redirect('/login');
    }
  };
  
  // Traitement de la suppression d'utilisateur
  exports.user_delete_post = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      User.findByIdAndDelete(req.params.id, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/admin');
      });
    } else {
      res.redirect('/login');
    }
  };

  exports.index_get =  async function(req, res, next) {
    try {
      var poolConnection = await sql.connect(config);
 
      var resultSet = await poolConnection.request().query(`SELECT TOP 5 [temperature], [EventProcessedUtcTime], [PartitionId], [EventEnqueuedUtcTime], [IoTHub]
      FROM [dbo].[TelemetryData]`);
  
      console.log(`${resultSet.recordset.length} rows returned.`);
      // Pass the data to the view
     
    return  res.render('index', { data: resultSet.recordset });
   
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } finally {
      // Always close the connection
   
    }
  };
