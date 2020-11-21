const {model, Schema} = require("mongoose");

const CourseSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    titleSlug:{
        type: String,
        required: false
    },
    topics:{
        type: Array,
        require: false,
        default: []
    },
    thumbnail:{
        type: String,
        required: false
    },
    price:{
        type: Number,
        required: false,
        default: 0
    },
    discountPrice:{
        type: Number,
        required: false,
        default: 0
    },
    discount:{
        type: Number,
        required: false,
        default: 0
    },
    pricePerTopic:{
        type: Number,
        required: false,
        default: 250
    },
    published:{
        type: Boolean,
        required: false,
        default: false
    },
    instructor:{
        type: String,
        required: true
    },
    faculty:{
        type: String,
        required: true
    },
    facultyID:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: false,
        default: Date.now
    }
});

CourseSchema.pre("save", function(next){
    this.titleSlug = this.title.toLowerCase().replace(/\s/gi, "-") + (Math.floor(Math.random()*100)).toString(36);
    next();
})

module.exports = Course = model("Course", CourseSchema);