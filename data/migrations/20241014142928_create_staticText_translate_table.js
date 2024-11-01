/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("staticText_translate", table => {
        table.increments("id").primary();
        table.integer("staticText_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.string("value").notNullable();  // translated text

        table
          .foreign("staticText_id")
          .references("id")
          .inTable("staticText")
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
    .dropTableIfExists("staticText_translate")
};
