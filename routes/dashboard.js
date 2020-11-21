const router = require("express").Router();
const User = require("../model/User");
const Sale = require("../model/Sales");
const Course = require("../model/Course");
const {ensureAuthenticated} = require("../config/auth");


router.get("/", ensureAuthenticated, async (req,res) => {
    const users = await User.find({});
    const courses = await Course.find({});
    const sales = await Sale.find({});
    const totalSales = sales.reduce((prev, curr)=> prev + Number(curr.price),0);
    const context = {sales, users, courses, totalSales, title:"Dashboard"};
    return res.render("dashboard", context);
})

module.exports = router;