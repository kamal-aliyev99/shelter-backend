const staticTextModel = require("../../models/staticText/staticText_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const staticTextSchema = Joi.object({
    key: Joi.string().max(255).required(),
    value: Joi.string().allow(null)
})

module.exports = {
    getStaticTexts,
    // getSettingByKeyOrID,
    // addSetting,
    // updateSetting,
    // deleteSetting
}


//      G E T    A L L    S E T T I N G

function getStaticTexts (req, res, next) {
    const {lang} = req.query;

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

// function getStaticTextByKeyOrID (req, res, next) {
//     const param = req.params.keyOrID;

//     const modelFunction = 
//     isNaN(Number(param)) ?
//     "getSettingByKey" :
//     "getSettingByID" 

//     staticTextModel[modelFunction](param)
//         .then(setting => {
//             if (setting) {
//                 res.status(200).json(setting);
//             } else {
//                 next(
//                     {
//                         statusCode: 404,
//                         message: "The setting Not Found",
//                     }
//                 )
//             }
//         })
//         .catch(error => {
//             next(
//                 {
//                     statusCode: 500,
//                     message: "Internal Server Error",
//                     error
//                 }
//             )
//         })
// }




//      A D D    S E T T I N G

// function addStaticText (req, res, next) {   
//     const formData = {...req.body};
//     const file = req.file;
//     const filePath = file ? path.resolve(file.path) : null;
//     const newSetting = 
//     filePath ? 
//     {
//         ...formData,
//         value: filePath
//     }  :  
//     {...formData}

    
    
//     const {error} = staticTextSchema.validate(newSetting, {abortEarly: false})    
    
//     if (error) {
//         filePath && fileDelete(filePath);  // insert ugurlu olmasa sekil yuklenmesin,, silsin
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
//         staticTextModel.getSettingByKey(newSetting.key)
//             .then(data => {
//                 if (data) {
//                     filePath && fileDelete(filePath);
//                     next({
//                         statusCode: 409,  // Conflict
//                         message: `'${newSetting.key}' this key already exist`,
//                         data
//                     })
//                 } else {
//                     staticTextModel.addSetting(newSetting)
//                         .then(addedSetting => {
//                             res.status(201).json({
//                                 message: "Setting successfully inserted",
//                                 data: addedSetting
//                             });
//                         })
//                         .catch(error => {
//                             filePath && fileDelete(filePath);
//                             next({
//                                 statusCode: 500,
//                                 message: "An error occurred while adding setting",
//                                 error
//                             })
//                         })
//                 }
//             })
//             .catch(error => {
//                 filePath && fileDelete(filePath);
//                 next({
//                     statusCode: 500,
//                     message: "Unexpected error occurred while adding setting",
//                     error
//                 })
//             })
//     }
// }




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




