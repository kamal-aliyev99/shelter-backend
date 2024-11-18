const db = require("../../config/db-config");

module.exports = {
    getProducts,
    getProductsWithLang,
    getProductByID,
    getProductByIDWithLang,
    getProductBySlug,
    getProductBySlugWithLang,
    addProduct,
    updateProduct,
    deleteProduct
}


//      Get all Products

function getProducts () {
    return db("product");
}


//      Get all Products with Lang

function getProductsWithLang (lang) {
    return db("product_translate")
        .join("lang", "product_translate.langCode", "lang.langCode")
        .join("product", "product_translate.product_id", "product.id")
        .select(
            "product.*",
            "product_translate.id as translationID",
            "product_translate.title",
            "product_translate.desc",
            "product_translate.client",
            "product_translate.location",
            "lang.langCode"
        )
        .where("lang.langCode", lang)
}


//      Get product by  ID

function getProductByID (id) {
    return db("product")
        .where({id})
        .first()
}


//      Get product by  ID  with Lang

function getProductByIDWithLang (id, lang) {
    return db("product_translate")
        .join("lang", "product_translate.langCode", "lang.langCode")
        .join("product", "product_translate.product_id", "product.id")
        .select(
            "product.*",
            "product_translate.id as translationID",
            "product_translate.title",
            "product_translate.desc",
            "product_translate.client",
            "product_translate.location",
            "lang.langCode"
        )
        .where("product.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}


//      Get product by  slug

function getProductBySlug (slug) {    
    return db("product")
        .where({slug})
        .first()
}


//      Get product by  slug  with Lang

function getProductBySlugWithLang(slug, lang) {
    return db("product_translate")
        .join("lang", "product_translate.langCode", "lang.langCode")
        .join("product", "product_translate.product_id", "product.id")
        .select(
            "product.*",
            "product_translate.id as translationID",
            "product_translate.title",
            "product_translate.desc",
            "product_translate.client",
            "product_translate.location",
            "lang.langCode"
        )
        .where("product.slug", slug)
        .andWhere("lang.langCode", lang) 
        .first()
}


//      Add product

function addProduct (newProduct, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("product").insert(newProduct).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                product_id: id
            }
        })

        await trx("product_translate").insert(translationData);

        return id;
    })
}


//      Update product

function updateProduct (id, productData, translationData) {
    return db.transaction(async trx => {
        await trx("product")
            .where({id})
            .update(productData)

        await trx("product_translate")
            .insert(translationData)
            .onConflict(["product_id", "langCode"])
            .merge() 
    })
}


//      Delete product

function deleteProduct (id) {
    return db("product")
        .where({id})
        .del()
}