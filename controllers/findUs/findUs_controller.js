const findUsModel = require("../../models/findUs/findUs_model");
const langModel = require("../../models/lang/lang_model");

const Joi = require("joi");

const findUsInsertSchema = Joi.object({
    key: Joi.string().max(255).required(),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required() 
            })
        )
        .min(1) // arrayda min 1 obj olmalidi - for key
        .required()
});

const findUsUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    key: Joi.string().max(255).required(),
    title: Joi.string().max(255).required(),
    translationID: Joi.number().positive(),  
    langCode: Joi.string().max(10)
})

const defaultLang = "en";

module.exports = {
    getFindUs,
    getFindUsByKeyOrID,
    addFindUs,
    updateFindUs,
    deleteFindUs
}


//      G E T    A L L    findUs

function getFindUs (req, res, next) {
    const lang = req.query.lang ||defaultLang;    

    findUsModel.getFindUsWithLang(lang)  
        .then(findUs => {
            res.status(200).json(findUs);
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




//      G E T    findUs   b y   I D  /  K E Y

function getFindUsByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getFindUsByKeyWithLang" :
    "getFindUsByIDWithLang" 

    findUsModel[modelFunction](param, lang)
        .then(findUs => {
            if (findUs) {
                res.status(200).json(findUs);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The findUs Not Found",
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




//      A D D    findUs

function addFindUs (req, res, next) {   
    const formData = {...req.body};
    formData.translation = JSON.parse(formData.translation)
    const {translation, ...findUsData} = formData;
    
    const {error} = findUsInsertSchema.validate(formData, {abortEarly: false})    
    
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
        findUsModel.getFindUsByKey(formData.key)
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
                                        title: findUsData.key
                                    });
                                }
                            });
                            
                            findUsModel.addFindUs(findUsData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "findUs successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding findUs",
                                        error
                                    })
                                })                            
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding findUs",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Add findUs - request body:

// const exampleAddData = {
//     key: "home-page",   // same as en.title

//     translation: [
//         {langCode: "en", title: "Home page"},  // default for key
//         {langCode: "az", title: "Ana sehife"}
//     ]
// }




//      U P D A T E    findUs

function updateFindUs (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    const {id: findUsID, key, title, translationID, langCode} = formData,
    findUsData = { id: findUsID, key },
    translationData = {id: translationID, findUs_id: id, title, langCode};

    
    const {error} = findUsUpdateSchema.validate(formData, {abortEarly: false})   


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
        findUsModel.getFindUsByID(id)
            .then(data => {
                if (data) {
                    findUsModel.updateFindUs(id, findUsData, translationData)
                        .then(() => {
                            res.status(200).json({
                                message: "findUs updated successfully"
                            })
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating findUs",
                                error
                            })
                        })
                } else {
                    next({
                        statusCode: 404,
                        message: "The findUs not found"
                    })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating findUs",
                    error
                })
            })
    }
}

//  ~~EXAMPLE~~  Update findUs - request body:

// const exampleUpdateData = {
//     id: 5,
//     key: "from-friends 111",
//     title: "Dostlardan 111",
//     translationID: 14,
//     langCode: "az"
// }




//      D E L E T E    findUs

function deleteFindUs (req, res, next) {
    const {id} = req.params;

    findUsModel.getFindUsByID(id)
        .then(data => {
            if (data) {
                findUsModel.deleteFindUs(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting findUs"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting findUs",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The findUs not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting findUs",
                error
            })
        })
}







