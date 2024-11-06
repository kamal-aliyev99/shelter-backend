// URL :  /api/staticText?lang=en

const router = require("express").Router();
const staticTextController = require("../../controllers/staticText/staticText_controller")



//      EndPoints


router.get("/", staticTextController.getStaticTexts);

router.get("/:keyOrID", staticTextController.getStaticTextByKeyOrID);

router.post("/", staticTextController.addStaticText);

router.patch("/:id", staticTextController.updateStaticText);

router.delete("/:id", staticTextController.deleteStaticText);



module.exports = router