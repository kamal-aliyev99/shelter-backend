// URL :  /api/staticText?lang=en

const router = require("express").Router();
const staticTextController = require("../../controllers/staticText/staticText_controller")


// forDevelopment - start ~~~~~~~~~

const staticTextModel = require("../../models/staticText/staticText_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const staticTextSchema = Joi.object({    //  edit    ?!!!
    key: Joi.string().max(50).required(),
    value: Joi.string().allow(null)
})

// forDevelopment - end  ~~~~~~~~~~



//      EndPoints


router.get("/", staticTextController.getStaticTexts);

router.get("/:keyOrID", staticTextController.getStaticTextByKeyOrID);

router.post("/", staticTextController.addStaticText);

// router.patch("/:id", staticTextController.updateSetting);

// router.delete("/:id", staticTextController.deleteSetting);



module.exports = router