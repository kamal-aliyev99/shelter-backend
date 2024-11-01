/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("productType_translation", table => {
        table.increments("id").primary();
        table.integer("productType_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.string("title").notNullable();

        table
          .foreign("productType_id")
          .references("id")
          .inTable("productType")
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
    .dropTableIfExists("productType_translation")
};
