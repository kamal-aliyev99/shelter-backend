// URL :  /api/banner

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const bannerController = require("../../controllers/banner/banner_controller")



//      EndPoints


router.get("/", bannerController.getBanners);

router.get("/:pageOrID", bannerController.getBannerByPageOrID);

router.post("/", upload("banner-images").single("image"), bannerController.addBanner);

router.patch("/:id", upload("banner-images").single("image"), checkUpdateIDMiddleware, bannerController.updateBanner);

router.delete("/:id", bannerController.deleteBanner);



module.exports = router