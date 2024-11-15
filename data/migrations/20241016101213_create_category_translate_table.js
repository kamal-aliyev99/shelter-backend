/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("category_translate", table => {
        table.increments("id").primary();
        table.integer("category_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.string("title").notNullable();

        table
          .foreign("category_id")
          .references("id")
          .inTable("category")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table
          .foreign("langCode")
          .references("langCode")
          .inTable("lang")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table.unique(["category_id", "langCode"], {indexName: "unique_categoryID_langCode"})
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("category_translate")
};
