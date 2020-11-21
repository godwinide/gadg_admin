const router = require("express").Router();
const passport = require('passport');
const {forwardAuthenticated} = require("../config/auth")


router.get("/", (req, res) => {
    return res.render("login", {layout: "guestLayout"});
});

router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});
  
module.exports = router;