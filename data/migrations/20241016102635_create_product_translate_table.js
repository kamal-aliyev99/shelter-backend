/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable("product_translate", table => {
        table.increments("id").primary();
        table.integer("product_id").unsigned().notNullable();
        table.string("langCode", 10).notNullable();
        
        table.string("title").notNullable();
        table.text("desc");
        table.string("client");
        table.string("location");

        table
          .foreign("product_id")
          .references("id")
          .inTable("product")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table
          .foreign("langCode")
          .references("langCode")
          .inTable("lang")
          .onUpdate("CASCADE")
          .onDelete("CASCADE")

        table.unique(["product_id", "langCode"], {indexName: "unique_productID_langCode"})
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("product_translate")
};
