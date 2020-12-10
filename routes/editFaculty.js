const router = require("express").Router();
const Faculty = require("../model/Faculty");
const {upload} = require("../aws/s3");
const uuid = require("uuid");
const fs = require("fs");

router.get("/:nameSlug", async (req,res) => {
    const {nameSlug} = req.params;
    const faculty = await Faculty.findOne({nameSlug});
    const context = {title:"Edit Faculty", faculty};
    if(faculty){
        return res.render("editFaculty", context);
    }else{
        return res.render("404Page")
    }
})


router.post("/", async(req,res) => {
    try{
        const errors = [];
    const {name, nameSlug} = req.body;
    const faculty = await Faculty.findOne({nameSlug});
    if(!name){
        errors.push({msg:"Please provide a faculty name!"})
        const context = {title:"Edit faculty", faculty, errors}
        return res.render("editFaculty", context);
    }else{
        const update = {
            name
        };
        if(req.files){
            const {thumbnail} = req.files;
            const mimetypes = ["image/png", "image/jpg", "image/jpeg"];
            if(!mimetypes.includes(thumbnail.mimetype)){
                errors.push({msg:"Please provide a valid image"})
                const context = {title:"Edit faculty", faculty, errors}
                return res.render("editFaculty", context);
            }
            const ext_name = thumbnail.name.split(".")
            const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
            const Body = fs.readFileSync(thumbnail.tempFilePath);
            const data = await upload(Body, Key);
            if(data){
                update.thumbnail = data.Location;
                // update faculty
                await faculty.updateOne({
                    ...update
                })
                const context = {title:"Edit faculty", faculty:{...faculty, ...update}}
                return res.render("editFaculty",{
                    success_msg: 'Faculty updated successfully.',
                    ...context
                })
            }
        }
        // if no thumbnail
        await faculty.updateOne({
            ...update
        })
        const context = {title:"Edit faculty", faculty:{...faculty, ...update}}
        return res.render("editFaculty",{
            success_msg: 'Faculty updated successfully.',
            ...context
        })
    }
    }catch(err){
        console.log(err)
    }
})

module.exports = router;