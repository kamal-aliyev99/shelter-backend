// URL :  /api/contactBase

const router = require("express").Router();
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const contactBaseController = require("../../controllers/contactBase/contactBase_controller");


//      EndPoints


router.get("/", contactBaseController.getContactBase);

router.get("/:id", contactBaseController.getContactBaseByID);

router.post("/", contactBaseController.addContactBase);  

router.patch("/:id", checkUpdateIDMiddleware, contactBaseController.updateIsReadContactBase);  

router.delete("/:id", contactBaseController.deleteContactBase);


module.exports = router

