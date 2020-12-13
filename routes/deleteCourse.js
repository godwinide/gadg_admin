const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");


router.post("/", ensureAuthenticated, async(req,res) => {
    try{
        const {titleSlug} = req.body;
        const course = await Course.findOne({titleSlug});
        await course.deleteOne();
        return res.redirect("/courses")
    }catch(err){
        console.log(err);
    }
})

module.exports = router;