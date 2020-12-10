const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");
const {upload, uploadPDF} = require("../aws/s3");
const uuid = require("uuid");
const fs = require("fs")


router.get("/:titleSlug/:id", ensureAuthenticated, async(req,res) => {
    try{
        const {titleSlug, id} = req.params;
        const course = await Course.findOne({titleSlug})
        const topic = course.topics.filter(top => top.id == id)[0];
        const context = {title:"Edit Topic", course, topic}
        return res.render("editTopic", context);

    }catch(err){
        console.log(err);
        return res.render("404page");
    }
})
// update text
router.post("/", ensureAuthenticated, async(req,res) => {
    try{
        const {titleSlug, id, title, desc} = req.body;
        const course = await Course.findOne({titleSlug})
        const topic = course.topics.filter(top => top.id == id)[0];
        const context = {title:"Edit Topic", course, topic}
        if(!title || !desc){
            return res.render("editTopic", {...context, error_msg:"Please fill all fields"})
        }
        if(!course){
            return res.render("404page");
        }else{
            let _newTopic = {};
            const newTopics = course.topics.map(topic => {
                if(topic.id === id){
                    _newTopic = {...topic,title,desc};
                    return {...topic,title,desc}
                }
                return topic;
            })
            await course.updateOne({topics: newTopics})
            return res.render("editTopic", {...context, topic:_newTopic, success_msg:"Topic updated"})
        }

    }catch(err){
        console.log(err);
        return res.render("editTopic", {...context, error_msg:"Internal Server Error."})
    }
})

// update files
router.post("/files", async (req,res) => {
    try{
        const {id, titleSlug} = req.body;
        const errors = [];
        const course = await Course.findOne({titleSlug});
        const topic = course.topics.filter(top => top.id == id)[0]; 
        // validation
        if(!req.files){
            errors.push({msg:"Please provide at least one file"});
            return res.status(400).json({errors});
        }
        if(!topic){
            errors.push({msg:"Please provide a valid topic id"});
            return res.status(400).json({errors});
        }
        else{
            const update = {};
            if(req.files.pdf){
                const {pdf} = req.files;
                const ext_name = pdf.name.split(".")
                const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                const Body = fs.readFileSync(pdf.tempFilePath);
                const data = await uploadPDF(Body, Key);
                if(data){
                    update.pdf = data.Location;
                }
            }
            if(req.files.audio){
                const {audio} = req.files;
                const ext_name = audio.name.split(".")
                const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                const Body = fs.readFileSync(audio.tempFilePath);
                const data = await upload(Body, Key);
                if(data){
                    update.audio = data.Location;
                }
            }
            if(req.files.video){
                const {video} = req.files;
                const ext_name = video.name.split(".")
                const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
                const Body = fs.readFileSync(video.tempFilePath);
                const data = await upload(Body, Key);
                if(data){
                    update.video = data.Location;
                }
            }
            // update topic
            const newTopics = course.topics.map(topic => {
                if(topic.id === id){
                    return {
                        ...topic,
                        ...update
                    }
                }else{
                    return topic;
                }
            });
            await course.updateOne({topics:newTopics});
            return res.json({msg:"Topic Updated Successfully"});

        }
        
    }catch(err){
        return res.status(500).json({msg:"Internal Server Error"});
    }
})

module.exports = router;