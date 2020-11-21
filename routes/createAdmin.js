const router = require("express").Router();
const bcrypt = require("bcryptjs");
const Admin = require("../model/Admin");
const {ensureAuthenticated} = require("../config/auth");

router.get("/", ensureAuthenticated, (req,res) => {
    return res.render("createAdmin");
});

router.post('/', ensureAuthenticated, async (req,res) => {
    try{
        const {username, firstname, lastname, email, phone, password, password2} = req.body;
        if(!username || !firstname || !lastname || !email || !phone || !password || !password2){
            return res.render("createAdmin", {...req.body,error_msg:"Please fill all fields"});
        }else{
            if(password !== password2){
                return res.render("createAdmin", {...req.body,error_msg:"Both passwords are not thesame"});
            }
            if(password2.length < 6 ){
                return res.render("createAdmin", {...req.body,error_msg:"Password length should be min of 6 chars"});
            }
            const admin = await Admin.findOne({username});
            if(admin){
                return res.render("createAdmin", {...req.body,error_msg:"An admin with that username already exists"});
            } else{
                const newAdmin = {
                    username,
                    firstname,
                    lastname,
                    email,
                    phone,
                    password
                };
                const salt = await bcrypt.genSalt();
                const hash = await bcrypt.hash(password2, salt);
                newAdmin.password = hash;
                const _newAdmin = new Admin(newAdmin);
                await _newAdmin.save()
                return res.render("createAdmin", {success_msg: "Admin created"})
            }
        }
    }catch(err){

    }
})

module.exports = router;