const router = require("express").Router();
const User = require("../model/User");
const {ensureAuthenticated} = require("../config/auth");


router.get("/", ensureAuthenticated, async (req,res) => {
    const students = await User.find({});
    const context = {students, title:"students"}
    return res.render("students", context);
})

module.exports = router;