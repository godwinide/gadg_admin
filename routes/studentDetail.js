const router = require("express").Router();
const User = require("../model/User");
const {ensureAuthenticated} = require("../config/auth");


router.get("/:id", ensureAuthenticated, async (req,res) => {
    const {id} = req.params;
    const student = await User.findById(id);
    const context = {student, title:"student detail"}
    return res.render("studentDetail", context);
})

module.exports = router;