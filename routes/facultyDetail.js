const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");
const Faculty = require("../model/Faculty");


router.get("/:slug", ensureAuthenticated, async (req,res) => {
    try{
        const {slug} = req.params; 
        const faculty = await Faculty.findOne({nameSlug:slug});
        if(!faculty){
            return res.render("404page")
        }
        const courses = await Course.find({facultyID: faculty._id});
        const context = {faculty, title: faculty.name, courses}
        return res.render("facultyDetail",context);
    }
    catch(err){
        console.error(err);
        return res.render("facultyDetail",context);
    }
});


module.exports = router;