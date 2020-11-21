const router = require("express").Router();
const {upload} = require("../aws/s3");
const uuid = require("uuid")
const fs = require("fs");
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");


router.get("/:titleSlug", ensureAuthenticated, async(req,res) => {
    const {titleSlug} = req.params;
    const course = await Course.findOne({titleSlug});
    const context = {title:"Create Topic", titleSlug, courseID: course._id};
    res.render("createTopic", context);
});

router.post("/", async (req,res) => {
    const {title, courseID, desc} = req.body;
    const errors = [];
    console.log(req.body)
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })
    };
    if(!title || !courseID || !desc){
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
                    courseID,
                    desc,
                    id: uuid.v4(),
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
                            new_topic.price = course.pricePerTopic;
                            const newPrice = ((course.topics.length * course.pricePerTopic)+course.pricePerTopic)
                            await course.updateOne({
                                topics: [...topics, new_topic],
                                price: newPrice,
                                discountPrice: newPrice * ((100-course.discount)/100)
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