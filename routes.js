module.exports = app => {
    // ADMIN ROUTES
    app.use("/", require("./routes/dashboard"));
    app.use("/faculties", require("./routes/faculties"));
    app.use("/courses", require("./routes/courses"));
    app.use("/admins", require("./routes/admins"));
    app.use("/students", require("./routes/students"));
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
    app.use("/editTopic", require("./routes/editTopic"));
    app.use("/login", require("./routes/login"));

    // API ROUTES
    // courses
    app.use("/api/courses", require("./routes/api/course/course"))
    app.use("/api/faculties", require("./routes/api/course/faculty"))
    // users
    app.use("/api/users/register", require("./routes/api/users/register"))
    app.use("/api/users/auth", require("./routes/api/users/auth"))

    // 404
    app.use("*", require("./routes/notfound"));
}