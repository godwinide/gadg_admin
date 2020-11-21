const {model, Schema} = require("mongoose");

const SaleSchema = new Schema({
    student:{
        type: Object,
        required: true
    },
    price:{
        type: String,
        required: true
    },
    reference:{
        type: String,
        required: true
    },
    date:{
        type: Array,
        required: false,
        default: Date.now
    }
});


module.exports = Sale = model("Sales", SaleSchema);