/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("service_translate", table => {
        table.increments("id").primary();
        table.integer("service_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        table.string("title").notNullable();
        table.text("desc");

        table
          .foreign("service_id")
          .references("id")
          .inTable("service")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table
          .foreign("langCode")
          .references("langCode")
          .inTable("lang")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table.unique(["service_id", "langCode"], {indexName: "unique_serviceID_langCode"})
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("service_translate")
};
