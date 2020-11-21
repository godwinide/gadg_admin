const router = require("express").Router();
const Faculty = require("../model/Faculty")
const {ensureAuthenticated} = require("../config/auth");


router.get("/", ensureAuthenticated, async (req,res) => {
    const faculties = await Faculty.find({});
    const context = {faculties, title:"faculties"}
    return res.render("faculties", context);
})

module.exports = router;