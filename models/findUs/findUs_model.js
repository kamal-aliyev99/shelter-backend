const db = require("../../config/db-config");

module.exports = {
    getFindUs,
    getFindUsWithLang,
    getFindUsByID,
    getFindUsByIDWithLang,
    getFindUsByKey,
    getFindUsByKeyWithLang,
    addFindUs,
    updateFindUs,
    deleteFindUs
}


//      Get findUs

function getFindUs() {   // not used
    return db("findUs")
}


//      Get Datas - with Lang

function getFindUsWithLang(lang) {
    return db("findUs_translate")
        .join("lang", "findUs_translate.langCode", "lang.langCode")
        .join("findUs", "findUs_translate.findUs_id", "findUs.id")
        .select(
            "findUs.*", 
            "findUs_translate.title", 
            "findUs_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang);
}


//      Get Data by ID

function getFindUsByID (id) {
    return db("findUs")
        .where({id})
        .first()
}


//      Get Data by ID - with Lang (1 lang)

function getFindUsByIDWithLang (id, lang) {
    return db("findUs_translate")
        .join("lang", "findUs_translate.langCode", "lang.langCode")
        .join("findUs", "findUs_translate.findUs_id", "findUs.id")
        .select(
            "findUs.*", 
            "findUs_translate.title", 
            "findUs_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("findUs.id", id)
        .first()
}


//      Get Data by Key

function getFindUsByKey (key) {
    return db("findUs")
        .where({key})
        .first()
}


//      Get Data by Key - with Lang

function getFindUsByKeyWithLang (key, lang) {
    return db("findUs_translate")
        .join("lang", "findUs_translate.langCode", "lang.langCode")
        .join("findUs", "findUs_translate.findUs_id", "findUs.id")
        .select(
            "findUs.*", 
            "findUs_translate.title", 
            "findUs_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("findUs.key", key)
        .first()
}


//      Add Data
 
function addFindUs (findUsData, translation) {
    return db.transaction(async trx => {
            const [{id}] = await trx("findUs").insert(findUsData).returning("id");

            const translationData = translation.map(data => { 
                return {
                    ...data,
                    findUs_id: id,
                }
            })

            await trx("findUs_translate").insert(translationData); 

            return id;
    })
}


//      Update Data

function updateFindUs (id, findUsData, translationData) {
    return db.transaction(async trx => {
        await trx("findUs")
            .where({id})
            .update(findUsData)      

        await trx("findUs_translate")
            .insert(translationData)
            .onConflict(["findUs_id", "langCode"])
            .merge() 
    })
}


//      Delete Data

function deleteFindUs (id) {
    return db("findUs")
        .where({id})
        .del()
}

