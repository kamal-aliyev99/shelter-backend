const db = require("../../config/db-config");

module.exports = {
    getAbouts,
    getAboutsWithLang,
    getAboutByID,
    getAboutByIDWithLang,
    getAboutByKey,
    getAboutByKeyWithLang,
    addAbout,
    updateAbout,
    deleteAbout
}


//      Get About

function getAbouts() {   // not used
    return db("about")
}


//      Get Datas - with Lang

function getAboutsWithLang(lang) {
    return db("about_translate")
        .join("lang", "about_translate.langCode", "lang.langCode")
        .join("about", "about_translate.about_id", "about.id")
        .select(
            "about.*", 
            "about_translate.value", 
            "about_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang);
}


//      Get Data by ID

function getAboutByID (id) {
    return db("about")
        .where({id})
        .first()
}


//      Get Data by ID - with Lang (1 lang)

function getAboutByIDWithLang (id, lang) {
    return db("about_translate")
        .join("lang", "about_translate.langCode", "lang.langCode")
        .join("about", "about_translate.about_id", "about.id")
        .select(
            "about.*", 
            "about_translate.value", 
            "about_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("about.id", id)
        .first()
}


//      Get Data by Key

function getAboutByKey (key) {
    return db("about")
        .where({key})
        .first()
}


//      Get Data by Key - with Lang

function getAboutByKeyWithLang (key, lang) {
    return db("about_translate")
        .join("lang", "about_translate.langCode", "lang.langCode")
        .join("about", "about_translate.about_id", "about.id")
        .select(
            "about.*", 
            "about_translate.value", 
            "about_translate.id as translationID", 
            "lang.langCode"
        )
        .where("lang.langCode", lang)
        .andWhere("about.key", key)
        .first()
}


//      Add Data
 
function addAbout (aboutData, translation) {
    return db.transaction(async trx => {
            const [{id}] = await trx("about").insert(aboutData).returning("id");

            const translationData = translation.map(data => { 
                return {
                    ...data,
                    about_id: id,
                }
            })

            await trx("about_translate").insert(translationData); 

            return id;
    })
}


//      Update Data

function updateAbout (id, aboutData, translationData) {
    return db.transaction(async trx => {
        await trx("about")
            .where({id})
            .update(aboutData)      

        await trx("about_translate")
            .insert(translationData)
            .onConflict(["about_id", "langCode"])
            .merge() 
    })
}


//      Delete Data

function deleteAbout (id) {
    return db("about")
        .where({id})
        .del()
}

