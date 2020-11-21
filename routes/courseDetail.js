const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");


router.get("/:slug", ensureAuthenticated, async (req,res) => {
    try{
        const {slug} = req.params; 
        const course = await Course.findOne({titleSlug:slug});
        if(!course){
            return res.render("404page")
        }
        const context = {course, title: course.name}
        return res.render("courseDetail",context);
    }
    catch(err){
        console.error(err);
        return res.render("courseDetail",context);
    }
});


module.exports = router;