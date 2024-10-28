// URL :  /api/lang

const router = require("express").Router();
const upload = require("../../middlewares/fileUpload"); 
const langController = require("../../controllers/lang/langController");


// for development start
const langModel = require("../../models/lang/lang_model");
const Joi = require("joi");
const path = require("path");
const fileDelete = require("../../middlewares/fileDelete");


const langSchema = Joi.object({
    langCode: Joi.string().max(10).required(),
    name: Joi.string().max(50).required(),
    image: Joi.string()
})
// for development end





//   EndPoints

router.get("/", langController.getLangs);  

router.get("/:id", langController.getLangByID);

router.post("/", upload("lang-flags").single("image"), (req, res, next) => {   //upload middlewareden gelir, parametr olarag folder adi oturulur
    const formData = req.body;
    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;
    const newLang = {
        ...formData,
        image: filePath
    }    
    
    const {error} = langSchema.validate(newLang, {abortEarly: false})    
    
    if (error) {
        const errors = error.details.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            errorMessage: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })
        
    } else {
        langModel.getLangByLangCode(newLang.langCode)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        errorMessage: `'${newLang.langCode}' langCode already exist`,
                        data
                    })
                } else {
                    langModel.addLang(newLang)
                        .then(addedLang => {
                            res.status(201).json({
                                message: "Language successfully inserted",
                                data: addedLang
                            });
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                errorMessage: "An error occurred while adding language",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    errorMessage: "Unexpected error occurred while adding language",
                    error
                })
            })
    }
})
// insert ugurlu olmasa sekil yuklenmesin



router.delete("/:id", (req, res, next) => {
    const {id} = req.params;
    let imagePath;

    langModel.getLangByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                langModel.deleteLang(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                errorMessage: "Internal Server Error: An error occurred while deleting language"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            errorMessage: "Internal Server Error: An error occurred while deleting language",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    errorMessage: "The language not found"
                })
            }
        })
})



module.exports = router