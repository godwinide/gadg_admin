const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");


router.post("/pub", ensureAuthenticated, async (req,res) => {
    try{
        const {titleSlug} = req.body;
        const course = await Course.findOne({titleSlug})
        if(course){
            await course.updateOne({
                published: true
            });
            return res.redirect("/course/"+titleSlug)
        }
    }catch(err){
        console.log(err);    
    }
})

router.post("/unpub", ensureAuthenticated, async (req,res) => {
    try{
        const {titleSlug} = req.body;
        const course = await Course.findOne({titleSlug})
        if(course){
            await course.updateOne({
                published: false
            });
            return res.redirect("/course/"+titleSlug)
        }
    }catch(err){
        console.log(err);    
    }
})

module.exports = router;