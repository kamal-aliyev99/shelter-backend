// URL :  /api/staticImage

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const staticImageController = require("../../controllers/staticImage/staticImage_controller");



//      EndPoints


router.get("/", staticImageController.getStaticImages);

router.get("/:keyOrID", staticImageController.getStaticImageByKeyorID);

router.post("/", upload("static-Images").single("image"), staticImageController.addStaticImage);  

router.patch("/:id", upload("static-Images").single("image"), staticImageController.updateStaticImage);

router.delete("/:id", staticImageController.deleteStaticImage);  



module.exports = router