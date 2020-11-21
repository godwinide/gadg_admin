const {model, Schema} = require("mongoose");

const UserSchema = new Schema({
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
    verifycode:{
        type: Number,
        required: false,
        default: Math.floor(Math.random()*1000000)
    },
    coursesID:{
        type: Array,
        required: false,
        default: []
    },
    courses:{
        type: Array,
        required: false,
        default: []
    },
    paymentMethod: {
        type: Object,
        required: false,
        default: {}
    },
    createdAt:{
        type: Date,
        required: false,
        default: Date.now
    }
});

module.exports = User = model("User", UserSchema);