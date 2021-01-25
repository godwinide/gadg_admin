const router = require("express").Router();
const Lecturer = require("../model/Lecturer");
const Course = require("../model/Course");
const {ensureAuthenticated} = require("../config/auth");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const {upload} = require("../aws/s3");
const uuid = require("uuid");

router.get("/", ensureAuthenticated, async (req,res) => {
    try{
        const lecturers = await Lecturer.find({});
        const context = {lecturers, title:"lecturers"}
        return res.render("lecturers", context);    
    }catch(err){
        console.log(err);
    }
});

// create video
router.get("/createLecturerVideo/:courseID/:topicID", ensureAuthenticated, async(req,res) => {
    try{
        const {courseID, topicID} = req.params;
        const lecturers = await Lecturer.find({})
        const course = await Course.findById(courseID);
        const topic = course.topics.filter(t => t.id === topicID)[0];
        return res.render("createLecturerVideo", {title:"Create Lecturer Video", lecturers, course, topic})

    }catch(err){
        console.log(err);
    }
});

router.get("/editLecturer/:id", ensureAuthenticated, async(req,res) => {
    try{
        const id = req.params.id;
        const lecturer = await Lecturer.findById(id);
        return res.render("editLecturer", {
            title:'Edit Account', 
            id:lecturer._id,
            firstname: lecturer.firstname,
            lastname: lecturer.lastname,
            email: lecturer.email,
            phone: lecturer.phone,
            commission: lecturer.commission
        });
    }catch(err){
        console.log(err);
    }
});

router.post("/editLecturer", ensureAuthenticated, async(req,res) => {
    try{
        const {
            firstname,
            lastname,
            email,
            phone,
            commission,
            id
        } = req.body;

        if(!firstname || !lastname || !email || !phone || !commission){
            return res.status(200).render("editLecturer", {title:"editLecturer", error_msg:"please enter all fileds", ...req.body})
        }
        const lecturer = await Lecturer.findById(id);
        await lecturer.updateOne({firstname, lastname, email, phone, commission});
        return res.status(200).render("editLecturer",  {title:"editLecturer", success_msg:"Account updated.", ...req.body})
    }catch(err){
        console.log(err);
    }
});

// delete video
router.get("/deleteVideo/:topicID/:courseID/:videoID/:lecturerID", ensureAuthenticated, async(req,res) => {
    const {
        courseID,
        topicID,
        videoID,
        lecturerID
    } = req.params;

    const course = await Course.findById(courseID);
    const lecturer = await Lecturer.findById(lecturerID);
    const _topic = course.topics.filter(top => top.id === topicID)[0];
    const newVideos = _topic.lecturers.filter(lec => lec.id !== videoID);
    _topic.lecturers = newVideos;
    const newTopics = course.topics.map(top => {
        if(top.id === topicID){
            return _topic
        }
        return top;
    });

    const newLecVideos = lecturer.courses.filter(c => c.id !== videoID);
    await lecturer.updateOne({courses: newLecVideos});
    await course.updateOne({topics: newTopics});
    return res.redirect("/lecturers");
})

// create video
router.post("/createLecturerVideo", ensureAuthenticated, async(req,res) => {
    const {lecturerID, courseID, topicID, price, share} = req.body;
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })
    };
    if(!lecturerID || !courseID || !topicID || !price || !share){
        errors.push({msg:"Please enter all fields"});
        return_errors(400);
    }
     // check for files
     if(!req.files){
        errors.push({msg: "Please provide a thumbnail and a video"});
        return_errors(400);
    }else{
        const {video, thumbnail} = req.files;
        if(errors.length > 0){
            return_errors(400);
        }else{
            try{
                const new_video = {
                    price,
                    courseID,
                    topicID,
                    sales:0,
                    locked: true,
                    share,
                    id: uuid.v4(),
                };
                // video upload refs
                const video_ext_name = video ? video.name.split(".") : '';
                const video_key = video ? uuid.v4() + "." + video_ext_name[video_ext_name.length-1] : '';
                const video_stream = video ? fs.readFileSync(video.tempFilePath) : '';
                // thumbnail upload refs
                const thumbnail_ext_name = thumbnail.name.split(".")
                const thumbnail_key = uuid.v4() + "." + thumbnail_ext_name[thumbnail_ext_name.length-1];
                const thumbnail_stream = fs.readFileSync(thumbnail.tempFilePath);

                // upload
                const thumb_data = await upload(thumbnail_stream, thumbnail_key);
                const video_data = await upload(video_stream, video_key);

                new_video.video = video_data.Location;
                new_video.thumbnail = thumb_data.Location;

                const lecturer = await Lecturer.findById(lecturerID);
                const course = await Course.findById(courseID);
                const new_topic = course.topics.filter(t => t.id === topicID)[0];
                new_video.lecturerID = lecturer._id;
                new_video.lecturer = lecturer;
                new_video.topic = new_topic.title;
                if(new_topic.lecturers){
                    new_topic.lecturers.push(new_video);
                }else{
                    new_topic.lecturers = [new_video];
                }
                const new_topics = course.topics.map(top => {
                    if(top.id === topicID){
                        return new_topic
                    }else{
                        return top
                    }
                });
                await course.updateOne({topics: new_topics});
                await lecturer.updateOne({courses: [...lecturer.courses, new_video]})
                return res.status(200).json({msg:"Video uploaded successfully"})
            }catch(err){
                console.log(err)
                errors.push({msg:"Internal server error"})
                return_errors(500);
            }
        }
    }
})

router.get("/payout/:id", ensureAuthenticated, async(req,res) => {
    try{
        const id = req.params.id;
        if(id){
            const lecturer = await Lecturer.findById(id);
            if(lecturer){
                await lecturer.updateOne({commission:0});
                const _lecturer = await Lecturer.findById(id);
                return res.render("lecturerDetails", {title:"Account info of " + lecturer.firstname, lecturer:_lecturer, success_msg:"Payout successful"});
            }
        }else{
            res.redirect("/lecturers");
        }
    }catch(err){

    }
})

router.get("/details/:id", ensureAuthenticated, async(req,res) => {
    try{
        const id = req.params.id;
        const lecturer = await Lecturer.findById(id);
        if(lecturer){
            return res.render("lecturerDetails", {title:"Account info of " + lecturer.firstname, lecturer});
        }else{
            return res.redirect("/lecturers")
        }
    }catch(err){
        console.log(err);
    }
})

router.get("/create", ensureAuthenticated, async(req,res) => {
    return res.render("createLecturer", {title:"Create Lecturer"})
});

router.post("/create", ensureAuthenticated, async(req, res) => {
    const {
        firstname,
        lastname,
        email,
        phone,
        password,
        password2
    } = req.body;
    const errors = [];
    const success = [];
    const returnError = (status) => {
        return res.status(status).render("createLecturer", {title: "Create Lecturer", errors})
    }
    try{
        if(!firstname || !lastname || !email || !phone || !password || !password2){
            errors.push({msg:"Please fill all fields!"});
            returnError(400);
        }
        if(password !== password2){
            errors.push({msg:"Both passwords are not thesame"});
            returnError(400);
        }
        if(password.length < 6 || password.length > 20){
            errors.push({msg:"Password length should be 6-20 chars"});
        }
        const exists = await Lecturer.findOne({email});
        if(exists){
            errors.push({msg:"A lecturer with that email already exists"});
            returnError(400);
        }else{
            const lecturerInfo = {
                firstname,
                lastname,
                email,
                phone
            };

            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(password, salt);
            lecturerInfo.password = hash;

            const newLecturer = new Lecturer(lecturerInfo);
            const lecturer = newLecturer.save()
            console.log(lecturer);
            return res.render("createLecturer", {title:"Create Lecturer", success_msg:"Account created successfully"})
        }
    }catch(err){
        console.log(err);
    }
});


// delete lecturer
router.get("/delete/:id", async(req,res) => {
    try{
        const id = req.params.id;
        await Lecturer.deleteOne({_id:id});
        return res.redirect("/lecturers")
    }catch(err){
        console.log(err);
    }
})

module.exports = router;