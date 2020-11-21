const {connect} = require("mongoose");

connect(process.env.db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("mongodb connected"))
.catch(err => console.log("mongodb error: ", err));