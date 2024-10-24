/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('productType_translation').del()
  await knex('productType_translation').insert([
    {
      productType_id: 1,
      langCode: "en",
      title: "Shelter"
    },
    {
      productType_id: 1,
      langCode: "az",
      title: "Siginacaq"
    },
    {
      productType_id: 2,
      langCode: "en",
      title: "Equipment"
    },
    {
      productType_id: 2,
      langCode: "az",
      title: "Techizat"
    }
  ]);
};
