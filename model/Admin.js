const {model, Schema} = require("mongoose");

const AdminSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    superAdmin:{
        type: Boolean,
        required: false,
        default: false
    },
    createdAt:{
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = Admin = model("Admin", AdminSchema);