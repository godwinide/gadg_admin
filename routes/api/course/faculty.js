const router = require("express").Router();
const Faculty = require("../../../model/Faculty");
const {upload} = require("../../../aws/s3");
const uuid = require("uuid");
const fs = require("fs")



/*  @route /api/faculties/
    @method get 
    @access public 
*/
router.get("/", async (req,res) => {
    try{
        const faculties = await Faculty.find({});
        return res.status(200).json({faculties, success: true})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({success: false, errors: [err]})
    }
});

/*  @route /api/faculties/
    @method get 
    @access public 
*/
router.get("/filterById/:slug", async (req,res) => {
    try{
        const {slug} = req.params; 
        const faculty = await Faculty.findOne({nameSlug:slug});
        return res.status(200).json({faculty, success: true})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({success: false, errors: [err]})
    }
});


/*  @route /api/faculties/create
    @method post 
    @access public 
*/
router.post("/create", async(req,res) => {
    try{
        const {name} = req.body;
        const {thumbnail} = req.files;
        const errors = [];
        if(!name || !thumbnail){
            errors.push({msg: "please fill all fields"});
            return res.status(400).json({success:false, errors})
        }else{
            const _newFaculty = {
                name,
                thumbnail: ""
            }
            const mimetypes = ["image/png", "image/jpg", "image/jpeg"];
            if(!mimetypes.includes(thumbnail.mimetype)){
                errors.push({msg:"Please provide a valid image"})
                return res.status(400).json({success:false, errors})
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
                    return res.status(200).json({
                        success: true,
                        faculty: _new_faculty,
                        msg: "course created successfully"
                    })
                }
            })
        }
    }catch(err){
        return res.status(500).json({success:false, errors:[err.response]})
    }
})

module.exports = router;