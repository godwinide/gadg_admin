const router = require("express").Router();
const Course = require("../model/Course");
const {ensureAuthenticated} = require("../config/auth");


router.get("/", ensureAuthenticated, async (req,res) => {
    const courses = await Course.find({});
    const context = {courses, title:"Courses"}
    return res.render("courses", context);
});


module.exports = router;