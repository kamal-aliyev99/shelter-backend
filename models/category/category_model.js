const db = require("../../config/db-config");

module.exports = {
    getCategories,
    getCategoriesWithLang,
    getCategoryByID,
    getCategoryByIDWithLang,
    getCategoryBySlug,
    getCategoryBySlugWithLang,
    addCategory,
    updateCategory,
    deleteCategory
}


//      Get all Categories

function getCategories () {
    return db("category");
}


//      Get all Categories with Lang

function getCategoriesWithLang (lang) {
    return db("category_translate")
        .join("lang", "category_translate.langCode", "lang.langCode")
        .join("category", "category_translate.category_id", "category.id")
        .select(
            "category.*",
            "category_translate.id as translationID",
            "category_translate.title",
            "lang.langCode"
        )
        .where("lang.langCode", lang)
}


//      Get category by  ID

function getCategoryByID (id) {
    return db("category")
        .where({id})
        .first()
}


//      Get category by  ID  with Lang

function getCategoryByIDWithLang (id, lang) {
    return db("category_translate")
        .join("lang", "category_translate.langCode", "lang.langCode")
        .join("category", "category_translate.category_id", "category.id")
        .select(
            "category.*",
            "category_translate.id as translationID",
            "category_translate.title",
            "lang.langCode"
        )
        .where("category.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}


//      Get category by  slug

function getCategoryBySlug (slug) {    
    return db("category")
        .where({slug})
        .first()
}


//      Get category by  slug  with Lang

function getCategoryBySlugWithLang(slug, lang) {
    return db("category_translate")
        .join("lang", "category_translate.langCode", "lang.langCode")
        .join("category", "category_translate.category_id", "category.id")
        .select(
            "category.*",
            "category_translate.id as translationID",
            "category_translate.title",
            "lang.langCode"
        )
        .where("category.slug", slug)
        .andWhere("lang.langCode", lang) 
        .first()
}


//      Add category

function addCategory (newCategory, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("category").insert(newCategory).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                category_id: id
            }
        })

        await trx("category_translate").insert(translationData);

        return id;
    })
}


//      Update category

function updateCategory (id, categoryData, translationData) {
    return db.transaction(async trx => {
        await trx("category")
            .where({id})
            .update(categoryData)

        await trx("category_translate")
            .insert(translationData)
            .onConflict(["category_id", "langCode"])
            .merge() 
    })
}


//      Delete category

function deleteCategory (id) {
    return db("category")
        .where({id})
        .del()
}