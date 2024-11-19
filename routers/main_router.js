const router = require("express").Router();
const urlNotFound = require("../middlewares/urlNotFound");
const errorHandling = require("../middlewares/errorHandling")

// R O U T E R S

const langRouter = require("./lang/lang_router");
const bannerRouter = require("./banner/banner_router");
const settingRouter = require("./setting/setting_router");
const staticTextRouter = require("./staticText/staticText_router");
const staticImageRouter = require("./staticImage/staticImage_router");
const partnerRouter = require("./partner/partner_router");
const serviceRouter = require("./service/service_router");
const productTypeRouter = require("./productType/productType_router");
const categoryRouter = require("./category/category_router");
const productRouter = require("./product/product_router");
const blogRouter = require("./blog/blog_router");
const findUsRouter = require("./findUs/findUs_router");
const aboutRouter = require("./about/about_router");
const ourValuesRouter = require("./ourValues/ourValues_router");




// EndPoints

router.get("/", (req,res) => {
    res.status(200).send("Success!!")
})

router.use("/lang", langRouter);

router.use("/banner", bannerRouter);

router.use("/setting", settingRouter);

router.use("/staticText", staticTextRouter);

router.use("/staticImage", staticImageRouter);

router.use("/partner", partnerRouter);

router.use("/service", serviceRouter);

router.use("/productType", productTypeRouter);

router.use("/category", categoryRouter);

router.use("/product", productRouter);

router.use("/blog", blogRouter);

router.use("/findUs", findUsRouter);

router.use("/about", aboutRouter);

router.use("/ourValues", ourValuesRouter);







// Middlewares

router.use(errorHandling);

router.use(urlNotFound);

module.exports = router    // The END