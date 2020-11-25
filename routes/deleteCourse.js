const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");
const Faculty = require("../model/Faculty");


router.post("/", ensureAuthenticated, async(req,res) => {
    try{
        const {titleSlug} = req.body;
        const course = await Course.findOne({titleSlug});
        const faculty = await Faculty.findById(course.facultyID);
        const newCoursesID = faculty.coursesID.slice(0, faculty.coursesID.length-2);
        await course.deleteOne();
        await faculty.updateOne({
            coursesID: newCoursesID
        });
        return res.redirect("/courses")
    }catch(err){
        console.log(err);
    }
})

module.exports = router;