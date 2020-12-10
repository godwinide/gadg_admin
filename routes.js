module.exports = app => {
    // ADMIN ROUTES
    app.use("/", require("./routes/dashboard"));
    app.use("/faculties", require("./routes/faculties"));
    app.use("/courses", require("./routes/courses"));
    app.use("/admins", require("./routes/admins"));
    app.use("/students", require("./routes/students"));
    app.use("/students/details", require("./routes/studentDetail"));
    app.use("/sales", require("./routes/sales"));
    app.use("/createFaculty", require("./routes/createFaculty"));
    app.use("/createCourse", require("./routes/createCourse"));
    app.use("/createTopic", require("./routes/createTopic"));
    app.use("/createAdmin", require("./routes/createAdmin"));
    app.use("/faculty", require("./routes/facultyDetail"));
    app.use("/course", require("./routes/courseDetail"));
    app.use("/publishstate", require("./routes/publish"));
    app.use("/deleteCourse", require("./routes/deleteCourse"));
    app.use("/deleteTopic", require("./routes/deleteTopic"));
    app.use("/deleteFaculty", require("./routes/deleteFaculty"));
    app.use("/editFaculty", require("./routes/editFaculty"));
    app.use("/editCourse", require("./routes/editCourse"));
    app.use("/editTopic", require("./routes/editTopic"));
    // AUTH ROUTES
    app.use("/login", require("./routes/login"));
    // 404
    app.use("*", require("./routes/notfound"));
}