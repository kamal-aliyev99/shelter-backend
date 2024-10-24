/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("product", table => {
        table.increments("id").primary();
        table.integer("category_id").unsigned().notNullable();
        table.string("slug").unique().notNullable();
        table.string("image")  // image path

        table
          .foreign("category_id")
          .references("id")
          .inTable("category")
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
    .dropTableIfExists("product")
};
