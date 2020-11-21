const {model, Schema} = require("mongoose");

const FacultySchema = new Schema({
    name:{
        type: String,
        required: true
    },
    nameSlug:{
        type: String,
        required: false
    },
    thumbnail:{
        type: String,
        required: false
    },
    coursesID:{
        type: Array,
        required: false,
        default: []
    }
});

FacultySchema.pre("save", function(next){
    this.nameSlug = this.name.toLowerCase().replace(/\s/gi, "-") + (Math.floor(Math.random()*100)).toString(36);
    next();
})

module.exports = Faculty = model("Faculty", FacultySchema);