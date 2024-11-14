const db = require("../../config/db-config");

module.exports = {
    getServices,
    getServicesWithLang,
    getServiceByID,
    getServiceByIDWithLang,
    getServiceBySlug,
    getServiceBySlugWithLang,
    addService,
    updateService,
    deleteService
}


//      Get all services

function getServices () {
    return db("service");
}


//      Get all services with Lang

function getServicesWithLang (lang) {
    return db("service_translate")
        .join("lang", "service_translate.langCode", "lang.langCode")
        .join("service", "service_translate.service_id", "service.id")
        .select(
            "service.*",
            "service_translate.id as translationID",
            "service_translate.title",
            "service_translate.desc",
            "lang.langCode"
        )
        .where("lang.langCode", lang)
}


//      Get service by  ID

function getServiceByID (id) {
    return db("service")
        .where({id})
        .first()
}


//      Get service by  ID  with Lang

function getServiceByIDWithLang (id, lang) {
    return db("service_translate")
        .join("lang", "service_translate.langCode", "lang.langCode")
        .join("service", "service_translate.service_id", "service.id")
        .select(
            "service.*",
            "service_translate.id as translationID",
            "service_translate.title",
            "service_translate.desc",
            "lang.langCode"
        )
        .where("service.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}


//      Get service by  slug

function getServiceBySlug (slug) {    
    return db("service")
        .where({slug})
        .first()
}


//      Get service by  slug  with Lang

function getServiceBySlugWithLang(slug, lang) {
    return db("service_translate")
        .join("lang", "service_translate.langCode", "lang.langCode")
        .join("service", "service_translate.service_id", "service.id")
        .select(
            "service.*",
            "service_translate.id as translationID",
            "service_translate.title",
            "service_translate.desc",
            "lang.langCode"
        )
        .where("service.slug", slug)
        .andWhere("lang.langCode", lang) 
        .first()
}


//      Add Service

function addService (newService, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("service").insert(newService).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                service_id: id
            }
        })

        await trx("service_translate").insert(translationData);

        return id;
    })
}


//      Update Service

function updateService (id, serviceData, translationData) {
    return db.transaction(async trx => {
        await trx("service")
            .where({id})
            .update(serviceData)

        await trx("service_translate")
            .where({ id: translationData.id })
            .update(translationData)        
    })
}


//      Delete Service

function deleteService (id) {
    return db("service")
        .where({id})
        .del()
}