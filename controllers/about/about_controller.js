const aboutModel = require("../../models/about/about_model");
const langModel = require("../../models/lang/lang_model");

const Joi = require("joi");

const aboutInsertSchema = Joi.object({
    key: Joi.string().max(255).required(),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                value: Joi.string().max(255).required() 
            })
        )
        .min(1) // arrayda min 1 obj olmalidi - for key
        .required()
});

const aboutUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    key: Joi.string().max(255).required(),
    value: Joi.string().max(255).required(),
    translationID: Joi.number().positive(),  
    langCode: Joi.string().max(10)
})

const defaultLang = "en";

module.exports = {
    getAbouts,
    getAboutByKeyOrID,
    addAbout,
    updateAbout,
    deleteAbout
}


//      G E T    A L L    Abouts

function getAbouts (req, res, next) {
    const lang = req.query.lang ||defaultLang;    

    aboutModel.getAboutsWithLang(lang)  
        .then(abouts => {
            res.status(200).json(abouts);
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                }
            )
        })
}




//      G E T    about   b y   I D  /  K E Y

function getAboutByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getAboutByKeyWithLang" :
    "getAboutByIDWithLang" 

    aboutModel[modelFunction](param, lang)
        .then(about => {
            if (about) {
                res.status(200).json(about);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The about Not Found",
                    }
                )
            }
        })
        .catch(error => {
            next(
                {
                    statusCode: 500,
                    message: "Internal Server Error",
                    error
                }
            )
        })
}




//      A D D    about

function addAbout (req, res, next) {   
    const formData = {...req.body};
    const {translation, ...aboutData} = formData;
    
    const {error} = aboutInsertSchema.validate(formData, {abortEarly: false})    
    
    if (error) {
        const errors = error?.details?.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        aboutModel.getAboutByKey(formData.key)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${formData.key}' this key already exist`,
                        data
                    })
                } else {
                    langModel.getLangs()
                        .then(langs => {
                            langs.forEach(lang => {
                                const exists = translation.some(tr => tr.langCode === lang.langCode);
                                
                                if (!exists) {
                                    translation.push({
                                        langCode: lang.langCode,
                                        value: aboutData.key
                                    });
                                }
                            });
                            
                            aboutModel.addAbout(aboutData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "about successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding about",
                                        error
                                    })
                                })                            
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding about",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Add about - request body:

// const exampleAddData = {
//     key: "homeBanner-3",  

//     translation: [
//         {langCode: "en", value: "3. homeBanner descriptionn"},  
//         {langCode: "az", value: "3. homeBanner haqqindaaaa"}
//     ]
// }




//      U P D A T E    about

function updateAbout (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    const {id: aboutID, key, value, translationID, langCode} = formData,
    aboutData = { id: aboutID, key },
    translationData = {id: translationID, about_id: id, value, langCode};

    
    const {error} = aboutUpdateSchema.validate(formData, {abortEarly: false})   


    if (error) {
        const errors = error.details.map(err => ({  // error sebebi
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        aboutModel.getAboutByID(id)
            .then(data => {
                if (data) {
                    aboutModel.updateAbout(id, aboutData, translationData)
                        .then(() => {
                            res.status(200).json({
                                message: "about updated successfully"
                            })
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating about",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The about not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating about",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Update about - request body:

// const exampleUpdateData = {
//     id: 2,
//     key: "homeBanner-2",
//     value: "2. homeBanner descriptionn",
//     translationID: 4,
//     langCode: "en"
// }



//      D E L E T E    about

function deleteAbout (req, res, next) {
    const {id} = req.params;

    aboutModel.getAboutByID(id)
        .then(data => {
            if (data) {
                aboutModel.deleteAbout(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting about"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting about",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The about not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting about",
                error
            })
        })
}







