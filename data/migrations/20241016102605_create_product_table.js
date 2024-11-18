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
        table.text("image")  
        table.date("date")

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
