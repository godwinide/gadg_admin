const router = require("express").Router();
const User = require("../../../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @route POST /api/users/auth/login
// @access private
router.post("/login", async (req,res) => {
    const {email, password} = req.body;
    const errors = [];
    const return_errors = status => {
        return res.status(status).json({
            success: false,
            errors
        })
    }
    if(!email || !password){
        errors.push({msg:"Please fill all fields!"})
        return_errors(400);
    }
    else{
        const user = await User.findOne({email})
        if(!user) {
            errors.push({msg: "Incorrect email or password"})
            return_errors(400);
        }else{
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(isMatch)
            if(!isMatch){
                errors.push({msg: "Incorrect email or password"})
                return_errors(400)
            }else{
                delete user.password;
                const token = jwt.sign(
                        {id: user.id},
                        process.env.JWTSECRET,
                        {expiresIn: 3600 * 5000}
                )
                return res.status(200).json({
                    success: true,
                    user,
                    token
                })
            }
        }
    }
})

module.exports = router;