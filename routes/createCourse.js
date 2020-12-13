const router = require("express").Router();
const {upload} = require("../aws/s3");
const uuid = require("uuid")
const fs = require("fs");
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");
const Faculty = require("../model/Faculty");

router.get("/", ensureAuthenticated, async (req,res) => {
    const faculties = await Faculty.find({});
    const context = {title:"create course", faculties}
    return res.render("createCourse", context);
})

/*
    @route get /api/course/create-course
    @access private
*/
router.post("/", ensureAuthenticated, async(req,res) => {
    const {
        title,
        description,
        instructor,
        facultyID,
        pricePerTopic,
        discount
    } = req.body;
    const errors = [];
    const faculties = await Faculty.find({});
    const context = {...{...req.body, course_title:title}, title:"create course", faculties}
    // check fields
    if(!title 
        || !description
        || !instructor
        || !facultyID
        || !pricePerTopic
        ){
            errors.push({msg: "Please fill in the fields correctly"});
            return res.render("createCourse",{errors, ...context})
    }
    else{
        const new_course = {
            title, 
            description,
            instructor,
            facultyID: facultyID.split(" ")[0],
            faculty: facultyID.split(" ").slice(1).join(" "),
            pricePerTopic,
            discount
        };
        // check for files
        if(!req.files){
            errors.push({msg: "Please provide a thumbnail and a video"});
        }else{
            const {thumbnail} = req.files;
            const thumb_mimetypes = ["image/jpg", "image/jpeg", "image/png"];
            // validate image mimetype
            if(!thumb_mimetypes.includes(thumbnail.mimetype)){
                errors.push({msg:"Please provide an image, only jpg, jpeg and png images are allowed!"});
                return res.render("createCorse",{errors, ...context})
            }
            if(errors.length > 0){
                return res.render("createCorse",{errors, ...context});
            }else{
                try{
                    // thumbnail upload refs
                    const thumbnail_ext_name = thumbnail.name.split(".")
                    const thumbnail_key = uuid.v4() + "." + thumbnail_ext_name[thumbnail_ext_name.length-1];
                    const thumbnail_stream = fs.readFileSync(thumbnail.tempFilePath);
                    // upload thumb
                    upload(thumbnail_stream, thumbnail_key, async data => {
                        new_course.thumbnail = data.Location;
                        try{
                            // save course to db
                            const _new_course = new Course(new_course);
                            await _new_course.save()
                            return res.render("createCourse",{success_msg:"course created successfully.", faculties, title:"create course"})
                            }catch(err){
                                errors.push({msg:"Internal server error"})
                                console.log(err)
                                return res.render("createCourse", {...context, errors});
                            }
                    })
    
                }catch(err){
                    errors.push({msg:"Internal server error"})
                    console.log(err)
                    return res.render("createCourse", {...context, errors});
                }
            }
        }
    }
})

module.exports = router;