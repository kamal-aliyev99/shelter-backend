const db = require("../../config/db-config");

module.exports = {
    getBlogs,
    getBlogsWithLang,
    getBlogByID,
    getBlogByIDWithLang,
    getBlogBySlug,
    getBlogBySlugWithLang,
    addBlog,
    updateBlog,
    deleteBlog
}


//      Get all blogs

function getBlogs () {
    return db("blog");
}


//      Get all blogs with Lang

function getBlogsWithLang (lang, search) {
    const getData = db("blog_translate")
        .join("lang", "blog_translate.langCode", "lang.langCode")
        .join("blog", "blog_translate.blog_id", "blog.id")
        .select(
            "blog.*",
            "blog_translate.id as translationID",
            "blog_translate.title",
            "blog_translate.desc",
            "blog_translate.shortDesc",
            "lang.langCode"
        )
        .where("lang.langCode", lang);

    if (search) {
        getData.andWhere("blog_translate.title", "ilike", `%${search}%`)
    }
    return getData
}


//      Get blog by  ID

function getBlogByID (id) {
    return db("blog")
        .where({id})
        .first()
}


//      Get blog by  ID  with Lang

function getBlogByIDWithLang (id, lang) {
    return db("blog_translate")
        .join("lang", "blog_translate.langCode", "lang.langCode")
        .join("blog", "blog_translate.blog_id", "blog.id")
        .select(
            "blog.*",
            "blog_translate.id as translationID",
            "blog_translate.title",
            "blog_translate.desc",
            "blog_translate.shortDesc",
            "lang.langCode"
        )
        .where("blog.id", id)
        .andWhere("lang.langCode", lang)  
        .first()  
}


//      Get blog by  slug

function getBlogBySlug (slug) {    
    return db("blog")
        .where({slug})
        .first()
}


//      Get blog by  slug  with Lang

function getBlogBySlugWithLang(slug, lang) {
    return db("blog_translate")
        .join("lang", "blog_translate.langCode", "lang.langCode")
        .join("blog", "blog_translate.blog_id", "blog.id")
        .select(
            "blog.*",
            "blog_translate.id as translationID",
            "blog_translate.title",
            "blog_translate.desc",
            "blog_translate.shortDesc",
            "lang.langCode"
        )
        .where("blog.slug", slug)
        .andWhere("lang.langCode", lang) 
        .first()
}


//      Add blog

function addBlog (newBlog, translation) { 
    return db.transaction(async trx => {
        const [{id}] = await trx("blog").insert(newBlog).returning("id");

        const translationData = translation.map(data => {
            return {
                ...data,
                blog_id: id
            }
        })

        await trx("blog_translate").insert(translationData);

        return id;
    })
}


//      Update blog

function updateBlog (id, blogData, translationData) {
    return db.transaction(async trx => {
        await trx("blog")
            .where({id})
            .update(blogData)

        await trx("blog_translate")
            .insert(translationData)
            .onConflict(["blog_id", "langCode"])
            .merge() 
    })
}


//      Delete blog

function deleteBlog (id) {
    return db("blog")
        .where({id})
        .del()
}