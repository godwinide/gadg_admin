const router = require("express").Router();
const Admin = require("../model/Admin");
const {ensureAuthenticated} = require("../config/auth");

router.get("/", ensureAuthenticated, async (req,res) => {
    const admins = await Admin.find({});
    const context = {title:"Admins", admins}
    return res.render("admins", context);
})

module.exports = router;