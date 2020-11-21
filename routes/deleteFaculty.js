const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Faculty = require("../model/Faculty");


router.post("/", ensureAuthenticated, async(req,res) => {
    try{
        const {nameSlug} = req.body;
        const faculty = await Faculty.findOne({nameSlug})
        await faculty.deleteOne();
        return res.redirect("/faculties")
    }catch(err){
        console.log(err);
    }
})

module.exports = router;