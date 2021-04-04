const router = require("express").Router();
const {upload, uploadPDF} = require("../aws/s3");
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
        // const {video, audio, pdf} = req.files;
        const video_mimetypes = ["video/mp4", "video/mkv"];
        const pdf_mimetypes = ["application/pdf", "image/png"];
        // validate image mimetype
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

                if(req.files.pdf){
                    const {pdf} = req.files;
                    const ext_name = pdf.name.split(".")
                    const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                    const Body = fs.readFileSync(pdf.tempFilePath);
                    const data = await uploadPDF(Body, Key);
                    if(data){
                        new_topic.pdf = data.Location;
                    }
                }
                if(req.files.audio){
                    const {audio} = req.files;
                    const ext_name = audio.name.split(".")
                    const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                    const Body = fs.readFileSync(audio.tempFilePath);
                    const data = await upload(Body, Key);
                    if(data){
                        new_topic.audio = data.Location;
                    }
                }
                if(req.files.audio2){
                    const {audio2} = req.files;
                    const ext_name = audio2.name.split(".")
                    const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                    const Body = fs.readFileSync(audio2.tempFilePath);
                    const data = await upload(Body, Key);
                    if(data){
                        new_topic.audio2 = data.Location;
                    }
                }
                if(req.files.audio3){
                    const {audio3} = req.files;
                    const ext_name = audio3.name.split(".")
                    const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                    const Body = fs.readFileSync(audio3.tempFilePath);
                    const data = await upload(Body, Key);
                    if(data){
                        new_topic.audio3 = data.Location;
                    }
                }
                if(req.files.video){
                    const {video} = req.files;
                    const ext_name = video.name.split(".")
                    const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                    const Body = fs.readFileSync(video.tempFilePath);
                    const data = await upload(Body, Key);
                    if(data){
                        new_topic.video = data.Location;
                    }
                }

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
                    msg: "Topic creatd successfully"
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