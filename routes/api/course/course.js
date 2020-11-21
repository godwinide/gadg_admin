const router = require("express").Router();
const Course = require("../../../model/Course");
const Faculty = require("../../../model/Faculty");
const {upload} = require("../../../aws/s3");
const uuid = require("uuid")
const fs = require("fs");

/*  @route /api/courses/all
    @method get 
    @access public 
*/
router.get("/all", async (req,res) => {
    try{
        const courses = await Course.find({})
        return res.status(200).json({
            success: true,
            courses
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            errors: [{msg: "internal server error"}]
        })
    }
})


/*  @route /api/courses/one/id
    @method get 
    @access public
 */
router.get("/one/:slug", async (req,res) => {
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })        
    }
    try{
        const {slug} = req.params;
        if(!slug){
            errors.push({msg: "Please provide a course ID!"})
            return_errors();
        }
        const course = await Course.findOne({titleSlug:slug})
        return res.status(200).json({
            success: true,
            course
        })
    }catch(err){
        errors.push ({msg: "internal server error"})
        return_errors();
    }
})

/*  @route /api/courses/one/id
    @method get 
    @access public
 */
router.get("/filterByFaculty/:id", async (req,res) => {
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })        
    }
    try{
        const {id} = req.params;
        if(!id){
            errors.push({msg: "Please provide a faculty ID!"})
            return_errors();
        }
        const courses = await Course.find({facultyID:id})
        return res.status(200).json({
            success: true,
            courses
        })
    }catch(err){
        errors.push ({msg: "internal server error"})
        return_errors();
    }
})

/*
    @route get /api/course/create-course
    @access private
*/
router.post("/create", async(req,res) => {
    const {
        title,
        description,
        instructor,
        faculty,
        facultyID,
    } = req.body;
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })
    };
    // check fields
    if(!title 
        || !description
        || !instructor
        || !facultyID
        || !faculty
        ){
            errors.push({msg: "Please fill in the fields correctly"});
            return_errors(400);
    }
    else{
        const new_course = {
            title, 
            description,
            instructor,
            facultyID,
            faculty
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
                return_errors(400)
            }
            if(errors.length > 0){
                return_errors(400);
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
                            const course = await _new_course.save()
                            const faculty = await Faculty.findById(facultyID);
                            const coursesID = faculty.coursesID
                            await faculty.update({
                                coursesID: [...coursesID, course._id]
                            })
                            return res.status(200).json({
                                success: true,
                                msg: "course created successfully, it will be available in a few moments"
                            })
                            }catch(err){
                                errors.push({msg:"Internal server error"})
                                console.log(err)
                                return_errors(500);
                            }
                    })
    
                }catch(err){
                    errors.push({msg:"Internal server error"})
                    console.log(err)
                    return_errors(500);
                }
            }
        }
    }
})


router.post("/topics/create", (req,res) => {
    const {title, price, courseID, desc} = req.body;
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })
    };
    if(!title || !price || !courseID || !desc){
        errors.push({msg:"Please fill all fields correctly!"})
        return_errors(400);
    }
     // check for files
     if(!req.files){
        errors.push({msg: "Please provide a thumbnail and a video"});
        return_errors(400);
    }else{
        const {video, audio, pdf} = req.files;
        const video_mimetypes = ["video/mp4", "video/mkv"];
        const pdf_mimetypes = ["application/pdf", "image/png"];
        // validate image mimetype
        if(!video_mimetypes.includes(video.mimetype)){
            errors.push({msg:"please provide a video, only mp4, 3gp, and avi videos are allowed!"});
        }
        if(!pdf_mimetypes.includes(pdf.mimetype)){
            errors.push({msg:"invalid pdf!"});
        }
        if(errors.length > 0){
            return_errors(400);
        }else{
            try{
                const new_topic = {
                    title,
                    price,
                    courseID,
                    desc,
                    id: uuid.v4()

                };
                // video upload refs
                const video_ext_name = video.name.split(".")
                const video_key = uuid.v4() + "." + video_ext_name[video_ext_name.length-1];
                const video_stream = fs.readFileSync(video.tempFilePath);
                // audio upload refs
                const audio_ext_name = audio.name.split(".")
                const audio_key = uuid.v4() + "." + audio_ext_name[audio_ext_name.length-1];
                const audio_stream = fs.readFileSync(audio.tempFilePath);
                // pdf upload refs
                const pdf_ext_name = pdf.name.split(".")
                const pdf_key = uuid.v4() + "." + pdf_ext_name[pdf_ext_name.length-1];
                const pdf_stream = fs.readFileSync(pdf.tempFilePath);

                // upload pdf
                upload(pdf_stream, pdf_key, data => {
                    new_topic.pdf = data.Location;
                    return;
                })
                .then(()=> {
                    // upload audio
                    upload(audio_stream, audio_key, data => {
                        new_topic.audio = data.Location;
                        return;
                    })
                    .then(()=> {
                        // upload video
                        upload(video_stream, video_key, async data => {
                            new_topic.video = data.Location;                                    
                            // save course to db
                            const course = await Course.findById(courseID);
                            const topics = course.topics;
                            await course.update({
                                topics: [...topics, new_topic],
                                price: Number(course.price) + Number(course.pricePerTopic),
                                discountPrice: Number(course.price) + (Number(course.pricePerTopic) * .9)
                            })
                            return res.status(200).json({
                                success: true,
                                msg: "topic creatd successfully"
                            })
                        })
                    })
                })

            }catch(err){
                console.log(err)
                errors.push({msg:"Internal server error"})
                return_errors(500);
            }
        }
    }
})


module.exports = router;