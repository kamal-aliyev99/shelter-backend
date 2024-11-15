/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("about_translate", table => {
        table.increments("id").primary();
        table.integer("about_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.text("value");

        table
          .foreign("about_id")
          .references("id")
          .inTable("about")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table
          .foreign("langCode")
          .references("langCode")
          .inTable("lang")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table.unique(["about_id", "langCode"], {indexName: "unique_aboutID_langCode"})
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("about_translate")
};
