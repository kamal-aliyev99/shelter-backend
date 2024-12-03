const bannerModel = require("../../models/banner/banner_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const bannerInsertSchema = Joi.object({
    page: Joi.string().max(255).required(),
    image: Joi.string().allow(null)
})

const bannerUpdateSchema = bannerInsertSchema.concat(
    Joi.object({
        id: Joi.number().positive().required()
    })
);

module.exports = {
    getBanners,
    getBannerByPageOrID,
    addBanner,
    updateBanner,
    deleteBanner
}


//      G E T    A L L    B A N N E R S

function getBanners (req, res, next) {
    bannerModel.getBanners()  // edit
        .then(banners => {
            res.status(200).json(banners);
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




//      G E T    B A N N E R   b y   I D / page

function getBannerByPageOrID (req, res, next) {
    const {pageOrID} = req.params;

    const modelFunction = 
    isNaN(Number(pageOrID)) ?
    "getBannerByPage" :
    "getBannerByID" 

    bannerModel[modelFunction](pageOrID)
        .then(banner => {
            if (banner) {
                res.status(200).json(banner);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The banner Not Found",
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




//      A D D    B A N N E R

function addBanner (req, res, next) {   
    const formData = req.body;
    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;
    const newBanner = {
        ...formData,
        image: filePath
    }    
    
    const {error} = bannerInsertSchema.validate(newBanner, {abortEarly: false})    
    
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
        bannerModel.getBannerByPage(newBanner.page)
            .then(data => {
                if (data) {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${newBanner.page}' page's banner already exist`,
                        data
                    })
                } else {
                    bannerModel.addBanner(newBanner)
                        .then(addedBanner => {
                            res.status(201).json({
                                message: "Banner successfully inserted",
                                data: addedBanner
                            });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "An error occurred while adding banner",
                                error
                            })
                        })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding banner",
                    error
                })
            })
    }
}




//      U P D A T E    B A N N E R  

function updateBanner (req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};

    if (formData.image === "null") {
        formData.image = null;
    }

    const file = req.file;
    const filePath = file ? 
    `${req.protocol}://${req.get('host')}/${path.posix.join(...file.path.split(path.sep))}` 
    : null;

    let editData;

    if (filePath) {
        editData = {...formData, image: filePath}
    } else {
        editData = {...formData}
        if (formData.image !== null) {
            Reflect.deleteProperty(editData, "image");
        }
    }    

    
    const {error} = bannerUpdateSchema.validate(editData, {abortEarly: false})   

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
        bannerModel.getBannerByID(id)
            .then(data => {
                if (data) {
                    bannerModel.updateBanner(id, editData)
                        .then(updatedData => {                            
                            Reflect.has(editData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({ message: "Banner updated successfully", data: updatedData });
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating banner",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The banner not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating banner",
                    error
                })
            })
    }
}




//      D E L E T E    B A N N E R

function deleteBanner (req, res, next) {
    const {id} = req.params;
    let imagePath;

    bannerModel.getBannerByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                bannerModel.deleteBanner(id)
                    .then(deletedCount => {
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting banner"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting banner",
                            error
                        })
                    })

            } else {
                next({
                    statusCode: 404,
                    message: "The banner not found"
                })
            }
        })
}