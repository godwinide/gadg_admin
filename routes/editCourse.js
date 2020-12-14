const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");
const Faculty = require("../model/Faculty");
const {upload} = require("../aws/s3");
const uuid = require("uuid");
const fs = require("fs");

router.get("/:titleSlug", ensureAuthenticated, async(req,res) => {
    try{
        const {titleSlug, id} = req.params;
        const course = await Course.findOne({titleSlug});
        const faculties = await Faculty.find({});
        const context = {course,title:"Edit Course", faculties};
        return res.render("editCourse", context);

    }catch(err){
        console.log(err);
        return res.render("404page");
    }
})

router.post("/", async (req,res) => {
    try{
        const {
            title, 
            instructor, 
            pricePerTopic, 
            discount, 
            titleSlug,
            price,
            discountPrice,
            description} = req.body;
        console.log(req.body)
        const errors = [];
        const faculties = await Faculty.find({});
        const course = await Course.findOne({titleSlug})
        if(!title || !instructor || !pricePerTopic || !discount || !description){
            errors.push({msg:"Please fill all fields!"});
            const context = {course,title:"Edit Course", faculties, errors};
            return res.render("editCourse", context);
        }else{
            const update = {
                title, 
                instructor, 
                pricePerTopic, 
                discount,
                price,
                discountPrice,
                description
            }

            if(req.files){
                const {thumbnail} = req.files;
                const mimetypes = ["image/png", "image/jpg", "image/jpeg"];
                if(!mimetypes.includes(thumbnail.mimetype)){
                    errors.push({msg:"Please provide a valid image"})
                    const context = {course,title:"Edit Course", faculties};
                    return res.render("editCourse", context);
                }
                const ext_name = thumbnail.name.split(".")
                const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                const Body = fs.readFileSync(thumbnail.tempFilePath);
                const data = await upload(Body, Key);
                if(data){
                    update.thumbnail = data.Location;
                }
            }
            await course.updateOne({
                ...update
            })
            req.flash("success_msg", "course updated successfully")
            return res.redirect("/editCourse/"+course.titleSlug)
        
        }
    }catch(err){
        console.log(err);
    }
})


module.exports = router;