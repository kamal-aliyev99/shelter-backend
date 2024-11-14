// URL :  /api/service

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const serviceController = require("../../controllers/service/service_controller");



//      EndPoints


router.get("/", serviceController.getServices);

router.get("/:slugOrID", serviceController.getStaticTextBySlugOrID);

router.post("/", upload("service-images").single("image"), serviceController.addService);  

router.patch("/:id", upload("service-images").single("image"), serviceController.updateService);

router.delete("/:id", serviceController.deleteService);  



module.exports = router