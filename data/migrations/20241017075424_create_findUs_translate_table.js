/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("findUs_translate", table => {
        table.increments("id").primary();
        table.integer("findUs_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.string("title");

        table
          .foreign("findUs_id")
          .references("id")
          .inTable("findUs")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table
          .foreign("langCode")
          .references("langCode")
          .inTable("lang")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("findUs_translate")
};
