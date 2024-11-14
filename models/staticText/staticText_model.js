const db = require("../../config/db-config");

module.exports = {
    getStaticTexts,
    getStaticTextsWithLang,
    getStaticTextByID,
    getStaticTextByIDWithLang,
    getStaticTextTranslationsByID,
    getStaticTextByKey,
    getStaticTextByKeyWithLang,
    addStaticText,
    updateStaticText,
    deleteStaticText
}


//      Get Datas

function getStaticTexts() {   // not used
    return db("staticText")
}


//      Get Datas - with Lang

function getStaticTextsWithLang(lang) {
    return db("staticText_translate")
        .join("lang", "staticText_translate.langCode", "lang.langCode")
        .join("staticText", "staticText_translate.staticText_id", "staticText.id")
        .select(
            "staticText.*", 
            "staticText_translate.value", 
            "staticText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang);
}


//      Get Data by ID

function getStaticTextByID (id) {
    return db("staticText")
        .where({id})
        .first()
}


//      Get Data by ID - with Lang (1 lang)

function getStaticTextByIDWithLang (id, lang) {
    return db("staticText_translate")
        .join("lang", "staticText_translate.langCode", "lang.langCode")
        .join("staticText", "staticText_translate.staticText_id", "staticText.id")
        .select(
            "staticText.*", 
            "staticText_translate.value", 
            "staticText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("staticText.id", id)
        .first()
}


//      Get Translation by staticTextID 

function getStaticTextTranslationsByID (id) {       // not used 
    return db("staticText_translate")
        .join("lang", "staticText_translate.langCode", "lang.langCode")
        .join("staticText", "staticText_translate.staticText_id", "staticText.id")
        .select("staticText_translate.*")
        .where("staticText.id", id)
}


//      Get Data by Key

function getStaticTextByKey (key) {
    return db("staticText")
        .where({key})
        .first()
}


//      Get Data by Key - with Lang

function getStaticTextByKeyWithLang (key, lang) {
    return db("staticText_translate")
        .join("lang", "staticText_translate.langCode", "lang.langCode")
        .join("staticText", "staticText_translate.staticText_id", "staticText.id")
        .select(
            "staticText.*", 
            "staticText_translate.value", 
            "staticText_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("staticText.key", key)
        .first()
}


//      Add Data
 
function addStaticText (staticTextData, translation) {
    return db.transaction(async trx => {
            const [{id}] = await trx("staticText").insert(staticTextData).returning("id");

            const translationData = translation.map(data => { 
                return {
                    ...data,
                    staticText_id: id,
                }
            })

            await trx("staticText_translate").insert(translationData); 

            return id;
    })
}


//      Update Data

function updateStaticText (id, staticTextData, translationData) {
    return db.transaction(async trx => {
        await trx("staticText")
            .where({id})
            .update(staticTextData)

        await trx("staticText_translate")
            .where({ id: translationData.id })
            .update(translationData)        
    })
}


//      Delete Data

function deleteStaticText (id) {
    return db("staticText")
        .where({id})
        .del()
}

