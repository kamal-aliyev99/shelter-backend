// URL :  /api/banner

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const bannerController = require("../../controllers/banner/banner_controller")



//      EndPoints


router.get("/", bannerController.getBanners);

router.get("/:pageOrID", bannerController.getBannerByPageOrID);

router.post("/", upload("banner-images").single("image"), bannerController.addBanner);

router.patch("/:id", upload("banner-images").single("image"), bannerController.updateBanner);

router.delete("/:id", bannerController.deleteBanner);



module.exports = router