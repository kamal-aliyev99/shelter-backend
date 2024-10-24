/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("category", table => {
        table.increments("id").primary();
        table.integer("productType_id").unsigned().notNullable();
        table.string("slug").unique().notNullable();
        table.string("image");

        table
          .foreign("productType_id")
          .references("id")
          .inTable("productType")
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
    .dropTableIfExists("category")
};
