// URL :  /api/about

const router = require("express").Router();
const aboutController = require("../../controllers/about/about_controller");


//      EndPoints


router.get("/", aboutController.getAbouts);

router.get("/:keyOrID", aboutController.getAboutByKeyOrID);

router.post("/", aboutController.addAbout);  

router.patch("/:id", aboutController.updateAbout);

router.delete("/:id", aboutController.deleteAbout);  


module.exports = router
