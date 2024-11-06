const settingModel = require("../../models/setting/setting_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const settingSchema = Joi.object({
    key: Joi.string().max(255).required(),
    value: Joi.string().allow(null)
})

module.exports = {
    getSettings,
    getSettingByKeyOrID,
    addSetting,
    updateSetting,
    deleteSetting
}


//      G E T    A L L    S E T T I N G

function getSettings (req, res, next) {
    settingModel.getSettings()  
        .then(settings => {
            res.status(200).json(settings);
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

function getSettingByKeyOrID (req, res, next) {
    const param = req.params.keyOrID;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getSettingByKey" :
    "getSettingByID" 

    settingModel[modelFunction](param)
        .then(setting => {
            if (setting) {
                res.status(200).json(setting);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The setting Not Found",
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

function addSetting (req, res, next) {   
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;
    const newSetting = 
    filePath ? 
    {
        ...formData,
        value: filePath
    }  :  
    {...formData}

    
    
    const {error} = settingSchema.validate(newSetting, {abortEarly: false})    
    
    if (error) {
        filePath && fileDelete(filePath);  // insert ugurlu olmasa sekil yuklenmesin,, silsin
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
        settingModel.getSettingByKey(newSetting.key)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${newSetting.key}' this key already exist`,
                        data
                    })
                } else {
                    settingModel.addSetting(newSetting)
                        .then(addedSetting => {
                            res.status(201).json({
                                message: "Setting successfully inserted",
                                data: addedSetting
                            });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding setting",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding setting",
                    error
                })
            })
    }
}




//      U P D A T E    S E T T I N G

function updateSetting (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;

    let editData =
    filePath ? 
    {
        ...formData,
        value: filePath
    }  :  
    {...formData};
    
    const {error} = settingSchema.validate(editData, {abortEarly: false})   

    if (error) {
        filePath && fileDelete(filePath);
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
        settingModel.getSettingByID(id)
            .then(data => {
                if (data) {
                    settingModel.updateSetting(id, editData)
                        .then(updatedData => {                            
                            Reflect.has(editData, "value") && data.value &&
                            fileDelete(data.value);

                            res.status(200).json({ message: "Setting updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating setting",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The setting not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating setting",
                    error
                })
            })
    }
}




//      D E L E T E    S E T T I N G

function deleteSetting (req, res, next) {
    const {id} = req.params;
    let imagePath;

    settingModel.getSettingByID(id)
        .then(data => {
            if (data) {
                imagePath = data.value || null;

                settingModel.deleteSetting(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting setting"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting setting",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The setting not found"
                })
            }
        })
}



//      Note :

//  edit olunan datada yeni key ferqli data'da varsa 500 internal server error verecek

