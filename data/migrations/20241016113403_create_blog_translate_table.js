/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("blog_translate", table => {
        table.increments("id").primary();
        table.integer("blog_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.string("title").notNullable();
        table.text("shortDesc");
        table.text("desc");

        table
          .foreign("blog_id")
          .references("id")
          .inTable("blog")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table
          .foreign("langCode")
          .references("langCode")
          .inTable("lang")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table.unique(["blog_id", "langCode"], {indexName: "unique_blogID_langCode"})
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("blog_translate")
};
