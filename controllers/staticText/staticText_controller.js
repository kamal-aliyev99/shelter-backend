const staticTextModel = require("../../models/staticText/staticText_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

// const staticTextSchema = Joi.object({
//     key: Joi.string().max(255).required(),        
// }).pattern(
//     Joi.string().max(10),
//     Joi.object({
//         value: Joi.string().max(255).required()
//     })
// )

const staticTextSchema = Joi.object({
    key: Joi.string().max(255).required(),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                value: Joi.string().max(255).required() 
            })
        )
        .required()
});

const defaultLang = "en";

module.exports = {
    getStaticTexts,
    getStaticTextByKeyOrID,
    addStaticText,
    // updateSetting,
    // deleteSetting
}


//      G E T    A L L    S E T T I N G

function getStaticTexts (req, res, next) {
    const lang = req.query.lang || defaultLang;

    staticTextModel.getStaticTexts()  
        .then(staticTexts => {
            res.status(200).json(staticTexts);
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




//      G E T    S E T T I N G   b y   I D  /  K E Y

function getStaticTextByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getStaticTextByKey" :
    "getStaticTextByID" 

    staticTextModel[modelFunction](param)
        .then(staticText => {
            if (staticText) {
                res.status(200).json(staticText);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The staticText Not Found",
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




//      A D D    S E T T I N G

function addStaticText (req, res, next) {   
    const formData = {...req.body};
    const {translation, ...staticTextData} = formData;
    
    const {error} = staticTextSchema.validate(formData, {abortEarly: false})    
    
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
        staticTextModel.getStaticTextByKey(formData.key)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${formData.key}' this key already exist`,
                        data
                    })
                } else {
                    // res.status(201).json(formData)

                    staticTextModel.addStaticText(staticTextData, translation)
                        .then(id => {
                            res.status(201).json({
                                message: "StaticText successfully inserted",
                                data: {id}
                            })
                        })
                        .catch(error => {
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding StaticText",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding StaticText",
                    error
                })
            })
    }
}




//      U P D A T E    S E T T I N G

// function updateStaticText (req, res, next) {
//     const {id} = req.params;
//     const formData = {...req.body};

//     const file = req.file;
//     const filePath = file ? path.resolve(file.path) : null;

//     let editData =
//     filePath ? 
//     {
//         ...formData,
//         value: filePath
//     }  :  
//     {...formData};

//     // if (filePath) {
//     //     editData = {...formData, value: filePath}
//     // } else {
//     //     editData = {...formData}
//     //     if (formData.value !== null) {
//     //         Reflect.deleteProperty(editData, "value");
//     //     }
//     // }    

    
//     const {error} = staticTextSchema.validate(editData, {abortEarly: false})   

//     if (error) {
//         filePath && fileDelete(filePath);
//         const errors = error.details.map(err => ({  // error sebebi
//             field: err.context.key,
//             message: err.message
//         }));

//         next({
//             statusCode: 400,
//             message: "Bad Request: The server could not understand the request because of invalid syntax.",
//             errors
//         })  
        
//     } else {
//         staticTextModel.getSettingByID(id)
//             .then(data => {
//                 if (data) {
//                     staticTextModel.updateSetting(id, editData)
//                         .then(updatedData => {                            
//                             Reflect.has(editData, "value") && data.value &&
//                             fileDelete(data.value);

//                             res.status(200).json({ message: "Setting updated successfully", data: updatedData });
//                         })
//                         .catch(error => {
//                             filePath && fileDelete(filePath);
//                             next({
//                                 statusCode: 500,
//                                 message: "Internal Server Error: An error occurred while updating setting",
//                                 error
//                             })
//                         })
//                 } else {
//                     filePath && fileDelete(filePath);
//                     next({
//                         statusCode: 404,
//                         message: "The setting not found"
//                     })
//                 }
//             })
//             .catch(error => {
//                 filePath && fileDelete(filePath);
//                 next({
//                     statusCode: 500,
//                     message: "Internal Server Error: Unexpected occurred while updating setting",
//                     error
//                 })
//             })
//     }
// }




//      D E L E T E    S E T T I N G

// function deleteStaticText (req, res, next) {
//     const {id} = req.params;
//     let imagePath;

//     staticTextModel.getSettingByID(id)
//         .then(data => {
//             if (data) {
//                 imagePath = data.value || null;

//                 staticTextModel.deleteSetting(id)
//                     .then(deletedCount => {
//                         if (deletedCount) {
//                             fileDelete(imagePath);
//                             res.status(204).end();
//                         } else {
//                             next({
//                                 statusCode: 500,
//                                 message: "Internal Server Error: An error occurred while deleting setting"
//                             })
//                         }
//                     }) 
//                     .catch(error => {
//                         next({
//                             statusCode: 500,
//                             message: "Internal Server Error: Unexpected occurred while deleting setting",
//                             error
//                         })
//                     })

//             } else {
//                 next({
//                     statusCode: 404,
//                     message: "The setting not found"
//                 })
//             }
//         })
// }









// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Example ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//  Add StaticText - request body:

// const exampleAddData = {
//     key: "home-page",   // same as en.value

//     translation: [
//         {langCode: "en", value: "Home page"},  // default for key
//         {langCode: "az", value: "Ana sehife"}
//     ]
// }

// const exampleAddData = {
//     key: "home-page",   // same as en.value

//     en: {     // default for key
//         value: "Home page"
//     },
//     az: {
//         value: "Ana sehife"
//     }
// }