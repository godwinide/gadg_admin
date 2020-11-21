const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");


router.post("/", ensureAuthenticated, async(req,res) => {
    try{
        const {titleSlug, id} = req.body;
        const course = await Course.findOne({titleSlug})
        const newTopics = course.topics.filter(top => top.id !== id);
        await course.updateOne({topics:newTopics});
        const context = {course: {...course, topics: newTopics, titleSlug}, title: course.name, success_msg:"topic deleted"}
        return res.render("courseDetail",context);
    }catch(err){
        console.log(err);
    }
})

module.exports = router;