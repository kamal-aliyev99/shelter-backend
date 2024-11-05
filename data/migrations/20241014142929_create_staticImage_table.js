/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("staticImage", table => {
        table.increments("id").primary();
        table.string("key").unique().notNullable(); // edit with "key"
        table.text("image"); 
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("staticImage")
};
 