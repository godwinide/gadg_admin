const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");


router.get("/", ensureAuthenticated, (req,res) => {
    return res.render("404page")
})

module.exports = router;