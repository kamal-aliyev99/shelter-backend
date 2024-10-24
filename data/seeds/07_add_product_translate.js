/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('product_translate').del()
  await knex('product_translate').insert([
    {
      product_id: 1,
      langCode: "en",
      title: "Mini bunker 1"
    },
    {
      product_id: 1,
      langCode: "az",
      title: "Balaca bunker 1"
    },
    {
      product_id: 7,
      langCode: "en",
      title: "Disinfection otagi 3"
    },
    {
      product_id: 7,
      langCode: "az",
      title: "Disinfection otagi 3"
    }
  ]);
};
