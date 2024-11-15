const db = require("../../config/db-config");

module.exports = {
    getProductTypes,
    getProductTypesWithLang,
    getProductTypeByID,
    getProductTypeByIDWithLang,
    getProductTypeBySlug,
    getProductTypeBySlugWithLang,
    addProductType,
    updateProductType,
    deleteProductType
}


//      Get all ProductTypes

function getProductTypes () {
    return db("productType");
}


//      Get all ProductTypes with Lang

function getProductTypesWithLang (lang) {
    return db("productType_translation")
        .join("lang", "productType_translation.langCode", "lang.langCode")
        .join("productType", "productType_translation.productType_id", "productType.id")
        .select(
            "productType.*",
            "productType_translation.id as translationID",
            "productType_translation.title",
            "lang.langCode"
        )
        .where("lang.langCode", lang)
}


//      Get ProductType by  ID

function getProductTypeByID (id) {
    return db("productType")
        .where({id})
        .first()
}


//      Get ProductType by  ID  with Lang

function getProductTypeByIDWithLang (id, lang) {
    return db("productType_translation")
        .join("lang", "productType_translation.langCode", "lang.langCode")
        .join("productType", "productType_translation.productType_id", "productType.id")
        .select(
            "productType.*",
            "productType_translation.id as translationID",
            "productType_translation.title",
            "lang.langCode"
        )
        .where("productType.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}


//      Get ProductType by  slug

function getProductTypeBySlug (slug) {    
    return db("productType")
        .where({slug})
        .first()
}


//      Get ProductType by  slug  with Lang

function getProductTypeBySlugWithLang(slug, lang) {
    return db("productType_translation")
        .join("lang", "productType_translation.langCode", "lang.langCode")
        .join("productType", "productType_translation.productType_id", "productType.id")
        .select(
            "productType.*",
            "productType_translation.id as translationID",
            "productType_translation.title",
            "lang.langCode"
        )
        .where("productType.slug", slug)
        .andWhere("lang.langCode", lang) 
        .first()
}


//      Add ProductType 

function addProductType (newProductType, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("productType").insert(newProductType).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                productType_id: id
            }
        })

        await trx("productType_translation").insert(translationData);

        return id;
    })
}


//      Update ProductType

function updateProductType (id, productTypeData, translationData) {
    return db.transaction(async trx => {
        await trx("productType")
            .where({id})
            .update(productTypeData)

        await trx("productType_translation")
            .insert(translationData)
            .onConflict(["productType_id", "langCode"])
            .merge()          
    })
}


//      Delete ProductType

function deleteProductType (id) {
    return db("productType")
        .where({id})
        .del()
}