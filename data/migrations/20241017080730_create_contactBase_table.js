/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("contactBase", table => {
        table.increments("id").primary();
        table.integer("findUs_id").unsigned();
        table.string("findUs_other");
        table.string("name").notNullable();
        table.string("surname").notNullable();
        table.string("email").notNullable();
        table.text("message");

        table
          .foreign("findUs_id")
          .references("id")
          .inTable("findUs")
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
    .dropTableIfExists("contactBase")
};
