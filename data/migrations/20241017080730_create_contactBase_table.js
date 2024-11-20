/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("contactBase", table => {
        table.increments("id").primary();
        table.integer("findUs_id").unsigned().notNullable();  // other id 0 olacag
        table.string("findUs_other");
        table.string("fullName").notNullable();
        table.string("phone").notNullable();
        table.string("email").notNullable();
        table.text("message");
        table.timestamp("created_at").defaultTo(knex.fn.now());  
        table.boolean("isRead").defaultTo(false);

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
