const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');

// Routes pour l'authentification
router.get('/login', userController.login_get);
router.post('/login', userController.login_post);

// Routes pour l'administration des utilisateurs
router.get('/admin', userController.admin_get);
router.get('/admin/create', userController.user_create_get);
router.post('/admin/create', userController.user_create_post);
router.get('/admin/:id/update', userController.user_update_get);
router.post('/admin/:id/update', userController.user_update_post);
router.get('/admin/:id/delete', userController.user_delete_get);
router.post('/admin/:id/delete', userController.user_delete_post);
router.get('/index', userController.user_get);
router.get('/data', userController.index_get);
router.get('/forgetPassword', userController.forgetPassword_get);
router.post('/forgetPasswordd', userController.forgetPassword_post);
router.get('/reset/:_id/:token', userController.resetPassword_get);
router.post('/resetPassword/:_id/:token', userController.resetPassword_post);
router.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.redirect('/login');
  });
});
module.exports = router;