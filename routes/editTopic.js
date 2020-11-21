const router = require("express").Router();
const {ensureAuthenticated} = require("../config/auth");
const Course = require("../model/Course");


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
        return res.render("404page");
    }
})

module.exports = router;