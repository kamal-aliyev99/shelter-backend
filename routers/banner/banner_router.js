// URL :  /api/banner

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const bannerController = require("../../controllers/banner/banner_controller")


// forDevelopment - start ~~~~~~~~~

const bannerModel = require("../../models/banner/banner_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const bannerSchema = Joi.object({
    page: Joi.string().max(50).required(),
    image: Joi.string().allow(null)
})

// forDevelopment - end  ~~~~~~~~~~



//      EndPoints


router.get("/", bannerController.getBanners);

router.get("/:id", bannerController.getBannerByID);

router.post("/", upload("banner-images").single("image"), bannerController.addBanner);

router.patch("/:id", upload("banner-images").single("image"), bannerController.updateBanner);

router.delete("/:id", bannerController.deleteBanner);



module.exports = router