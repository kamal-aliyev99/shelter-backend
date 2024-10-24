// URL :  /api/lang

const router = require("express").Router();
const langController = require("../../controllers/lang/langController");


// for development start
const langModel = require("../../models/lang/lang_model");
const Joi = require("joi");
const path = require("path");
const folderCreator = require("../../middlewares/folderCreator")
const multer = require("multer");

folderCreator("lang-flags"); // middleware ile public folderi icinde 'lang-Flags' folderi yoxdursa yaradacag  
const upload = multer({dest: '../../public/lang-flags'}); 

const langSchema = Joi.object({
    langCode: Joi.string().max(10).required(),
    name: Joi.string().max(50).required(),
    image: Joi.string()
})
// for development end





//   EndPoints

router.get("/", langController.getLangs);  

router.get("/:id", langController.getLangByID);

router.post("/", upload.single("image"), (req,res, next) => {
    const newLang = req.body;
    const file = req.file;
    console.log(file);
    
    // res.json({});

    // res.status(200).json(file);

    // const {error} = langSchema.validate(newLang, {abortEarly: false})

    // if (!error) {
    //     // langModel.getLangByID(id)
    //     //     .then()
    //     res.status(200).json(newLang)
        
    // } else {
    //     res.status(400).json(error)
    // }
})






module.exports = router