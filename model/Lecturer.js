const {model, Schema} = require("mongoose");

const LecturerSchema = new Schema({
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
    commission:{
        type: Number,
        required: false,
        default: 0
    },
    courses:{
        type: Array,
        required: false,
        default:[]
    },
    createdAt:{
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = Admin = model("Lecturer", LecturerSchema);