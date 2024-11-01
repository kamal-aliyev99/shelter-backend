const router = require("express").Router();
const urlNotFound = require("../middlewares/urlNotFound");
const errorHandling = require("../middlewares/errorHandling")

// R O U T E R S

const langRouter = require("./lang/lang_router");
const bannerRouter = require("./banner/banner_router");
const settingRouter = require("./setting/setting_router");
const staticTextRouter = require("./staticText/staticText_router")




// EndPoints

router.get("/", (req,res) => {
    res.status(200).send("Success!!")
})

router.use("/lang", langRouter);

router.use("/banner", bannerRouter);

router.use("/setting", settingRouter);

router.use("/staticText", staticTextRouter);




// Middlewares

router.use(errorHandling);

router.use(urlNotFound);

module.exports = router    // The END