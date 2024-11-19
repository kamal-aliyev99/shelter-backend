// URL :  /api/findUs

const router = require("express").Router();
const findUsController = require("../../controllers/findUs/findUs_controller");


//      EndPoints


router.get("/", findUsController.getFindUs);

router.get("/:keyOrID", findUsController.getFindUsByKeyOrID);

router.post("/", findUsController.addFindUs);  

router.patch("/:id", findUsController.updateFindUs);

router.delete("/:id", findUsController.deleteFindUs);  


module.exports = router
