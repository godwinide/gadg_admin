const router = require("express").Router();
const Sales = require("../model/Sales");
const {ensureAuthenticated} = require("../config/auth");

router.get("/", ensureAuthenticated, async (req,res) => {
    const sales = await Sales.find({});
    const context = {title:"Sales", sales};
    return res.render("sales", context);
});

module.exports = router;