const router = require("express").Router();
const User = require("../../../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @route POST /api/users/register
// @access private
router.post("/", async (req,res) => {
    const {email, phone, firstname, lastname, password, password2} = req.body;
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })
    }
    if(!email || !firstname || !lastname || !phone || !password || !password2){
        errors.push({msg:"Please fill all fields!"})
        return_errors(400);
    }
    if(password !== password2){
        errors.push({msg: "Both passwords should be thesame"})
        return_errors(400);
    }
    if(password.length < 8 || password.length > 15){
        errors.push({msg:"password length should be between 8 and 15 chars"})
        return_errors(400)
    }
    else{
        const exists = await User.findOne({email})
        if(exists){
            errors.push({msg:"A user with that email already exists."})
            return_errors(400);
        }else{
            const newUser = {
                firstname,
                lastname,
                phone,
                email
            };
            try{
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(password2, salt);
                newUser.password = salt;
                const user = new User(newUser);
                const registerUser = await user.save();
                delete newUser.password;
                const token = jwt.sign(
                        {id:registerUser.id},
                        process.env.JWTSECRET,
                        {expiresIn: 3600 * 5000}
                )
                return res.status(200).json({
                    success: true,
                    user: registerUser,
                    token
                })

            }catch(err){
                console.log(err)
                errors.push({msg:"internal server error"})
                return_errors(500)
            }
        }
    }

})

module.exports = router;