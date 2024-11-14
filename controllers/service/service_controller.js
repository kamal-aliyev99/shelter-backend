const serviceModel = require("../../models/service/service_model");
const langModel = require("../../models/lang/lang_model");
const fileDelete = require("../../middlewares/fileDelete");

const Joi = require("joi");
const path = require("path");

const serviceInsertSchema = Joi.object({
    slug: Joi.string().max(255).required(),
    image: Joi.string().allow(null),
    translation: Joi.array()
        .items(
            Joi.object({
                langCode: Joi.string().max(10).required(),
                title: Joi.string().max(255).required(),
                desc: Joi.string()
            })
        )
        .min(1) // arrayda min 1 obj olmalidi - for key
        .required()
})

const serviceUpdateSchema = Joi.object({
    id: Joi.number().positive().required(),
    slug: Joi.string().max(255),
    image: Joi.string().allow(null),
    translationID: Joi.number().positive().required(),
    langCode: Joi.string().max(10),
    title: Joi.string().max(255).required(),
    desc: Joi.string()
})


const defaultLang = "en";

module.exports = {
    getServices,
    getStaticTextBySlugOrID,
    addService,
    updateService,
    deleteService
}


//      Get all services 

function getServices (req, res, next) {
    const lang = req.query.lang || defaultLang;    

    serviceModel.getServicesWithLang(lang)  
        .then(services => {
            res.status(200).json(services);
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



//      Get service by ID / slug

function getStaticTextBySlugOrID (req, res, next) {
    const param = req.params.slugOrID;
    const lang = req.query.lang || defaultLang;

    const modelFunction = 
    isNaN(Number(param)) ?
    "getServiceBySlugWithLang" :
    "getServiceByIDWithLang" 

    serviceModel[modelFunction](param, lang) 
        .then(service => {
            if (service) {
                res.status(200).json(service);
            } else {
                next(
                    {
                        statusCode: 404,
                        message: "The service Not Found",
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


//      Add service

function addService (req, res, next) {
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;
    const newService = {
        ...formData,    
        image: filePath
    }
    const {translation, ...serviceData} = newService;

    const {error} = serviceInsertSchema.validate(newService, {abortEarly: false})  
    
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

        serviceModel.getServiceBySlug(serviceData.slug)
            .then(data => {
                if (data) {
                    next({
                        statusCode: 409,  // Conflict
                        message: `'${serviceData.key}' this slug already exist`,
                        data
                    })
                } else {
                    langModel.getLangs()
                        .then(langs => {    
                            langs.forEach(lang => {
                                const existLang = translation.some(tr => tr.langCode === lang.langCode)
    
                                if (!existLang) {
                                    translation.push({
                                        langCode: lang.langCode,
                                        title: serviceData.slug,
                                        desc: ""
                                    })
                                }
                            });
    
                            serviceModel.addService(serviceData, translation)
                                .then(id => {
                                    res.status(201).json({
                                        message: "Service successfully inserted",
                                        data: {id}
                                    })
                                })
                                .catch(error => {
                                    next({
                                        statusCode: 500,
                                        message: "An error occurred while adding Service",
                                        error
                                    })
                                })  
                            
                        })
                }
            })
            .catch(error => {
                next({
                    statusCode: 500,
                    message: "Unexpected error occurred while adding Service",
                    error
                })
            })
    }
}

// const exampleNewService = {
//     slug: "medical-assistance",
//     image: null,
//     translation: [
//         {
//             langCode: "en",
//             title: "Medical assistance",
//             desc: "Medical assistance 123"
//         },
//         {
//             langCode: "az",
//             title: "Tibbi Yardım",
//             desc: "Tibbi Yardım 123"
//         }
//     ]
// }



//      Update service

function updateService(req, res, next) {
    const {id} = req.params;
    const formData = {...req.body};
    const file = req.file;
    const filePath = file ? path.resolve(file.path) : null;
    
    const {id: serviceID, slug, image, translationID, langCode, title, desc} = formData,
    serviceData = {id: serviceID, slug, image},
    translationData = {id: translationID, langCode, title, desc};

    if (filePath) {
        serviceData.image = filePath
    } else {
        if (serviceData.image !== null) {
            Reflect.deleteProperty(serviceData, "image");
        }
    }   

    const {error} = serviceUpdateSchema.validate(formData, {abortEarly: false})   


    if (error) {
        filePath && fileDelete(filePath);
        const errors = error.details.map(err => ({ 
            field: err.context.key,
            message: err.message
        }));

        next({
            statusCode: 400,
            message: "Bad Request: The server could not understand the request because of invalid syntax.",
            errors
        })  
        
    } else {
        serviceModel.getServiceByID(id)
            .then(data => {
                if (data) {
                    serviceModel.updateService(id, serviceData, translationData)
                        .then(() =>{
                            Reflect.has(serviceData, "image") && data.image &&
                            fileDelete(data.image);

                            res.status(200).json({
                                message: "Service updated successfully"
                            })
                        })
                        .catch(error => {
                            filePath && fileDelete(filePath);
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while updating service",
                                error
                            })
                        })
                } else {
                    filePath && fileDelete(filePath);
                    next({
                        statusCode: 404,
                        message: "The service not found"
                    })
                }
            })
            .catch(error => {
                filePath && fileDelete(filePath);
                next({
                    statusCode: 500,
                    message: "Internal Server Error: Unexpected occurred while updating service",
                    error
                })
            })
    }

}

// const exampleEditService = {
//     id: 1,
//     slug: "test-1",
//     image: null,
//     translationID: 5,
//     langCode: "en",
//     title: "Test",
//     desc: "Tessssttttt"
// }



//      delete Service

function deleteService(req, res, next) {
    const {id} = req.params;
    let imagePath;

    serviceModel.getServiceByID(id)
        .then(data => {
            if (data) {
                imagePath = data.image || null;

                serviceModel.deleteService(id)
                    .then((deletedCount) => {                        
                        if (deletedCount) {
                            imagePath && fileDelete(imagePath);
                            res.status(204).end();
                        } else {
                            next({
                                statusCode: 500,
                                message: "Internal Server Error: An error occurred while deleting service"
                            })
                        }
                    }) 
                    .catch(error => {
                        next({
                            statusCode: 500,
                            message: "Internal Server Error: Unexpected occurred while deleting service",
                            error
                        })
                    })
            } else {
                next({
                    statusCode: 404,
                    message: "The service not found"
                })
            }
        })
        .catch(error => {
            next({
                statusCode: 500,
                message: "Internal Server Error: Unexpected occurred while deleting service",
                error
            })
        })
}




