/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("banner", table => {
        table.increments("id").primary();
        table.string("page").unique().notNullable();   // slug esasinda saxlayacaq, hansi sehifenin banneri oldugu
        table.string("image");
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("banner")
};
