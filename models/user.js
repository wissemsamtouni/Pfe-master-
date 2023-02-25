const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  adresse: String,
  telephone: String,
  role: {
    type: String,
    enum: ['utilisateur', 'admin'],
    default: 'utilisateur'
  },
  password: String,
  token:{
    type: String,
    default: null
  } ,
});

module.exports = mongoose.model('User', userSchema);
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     default: 'utilisateur',
//     enum: ['utilisateur', 'admin'],
//   },
// });

// // Fonction de hachage du mot de passe avant l'enregistrement
// userSchema.pre('save', async function (next) {
//   const user = this;

//   if (!user.isModified('password')) {
//     return next();
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     next();
//   } catch (err) {
//     return next(err);
//   }
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;
