// URL :  /api/partner

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const checkUpdateIDMiddleware = require("../../middlewares/CheckUpdateID")
const partnerController = require("../../controllers/partner/partner_controller");



//      EndPoints


router.get("/", partnerController.getPartners);

router.get("/:id", partnerController.getStaticImageByID);

router.post("/", upload("partner-images").single("image"), partnerController.addPartner);  

router.patch("/:id", checkUpdateIDMiddleware, upload("partner-images").single("image"), partnerController.updatePartner);

router.delete("/:id", partnerController.deletePartner);  



module.exports = router