const router = require("express").Router();
const {upload} = require("../aws/s3");
const uuid = require("uuid")
const fs = require("fs");
const {ensureAuthenticated} = require("../config/auth");
const Faculty = require("../model/Faculty");



router.get("/", ensureAuthenticated, (req,res) => {
    const context = {title:"create faculty"}
    return res.render("createFaculty", context);
});

router.post("/", ensureAuthenticated, async(req,res) => {
    const context = {title:"create faculty"}
    const {name} = req.body;
    const errors = [];
    try{        
        if(!name || req.files === 'null'){
            errors.push({msg: "please fill all fields"});
            return res.render("createFaculty",{errors, ...context})
        }else{
            const {thumbnail} = req.files;
            const _newFaculty = {
                name,
                thumbnail: ""
            }
            const mimetypes = ["image/png", "image/jpg", "image/jpeg"];
            if(!mimetypes.includes(thumbnail.mimetype)){
                errors.push({msg:"Please provide a valid image"})
                return res.render("createFaculty",{errors, ...context})
            }
            const ext_name = thumbnail.name.split(".")
            const Key = uuid.v4() + "." + ext_name[ext_name.length-1];
            const Body = fs.readFileSync(thumbnail.tempFilePath);

            upload(Body, Key, async data => {
                if(data){
                    _newFaculty.thumbnail = data.Location;
                    // save course to db
                    const _new_faculty = new Faculty(_newFaculty);
                    await _new_faculty.save()
                    return res.render("createFaculty",{
                        success_msg: 'Faculty created successfully.',
                        ...context
                    })
                }
            })
        }
    }catch(err){
        return res.render("createFaculty",{error_msg:"Internal server error", ...context})
    }
})


module.exports = router;