/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('category_translate').del()
  await knex('category_translate').insert([
    {
      category_id: 1,
      langCode: "en",
      title: "Mini bunker"
    },
    {
      category_id: 1,
      langCode: "az",
      title: "Balaca bunker"
    },
    {
      category_id: 2,
      langCode: "en",
      title: "Standart bomb shelter"
    },
    {
      category_id: 2,
      langCode: "az",
      title: "Standart bomba siginacag"
    },
    {
      category_id: 4,
      langCode: "en",
      title: "air_filtration_system"
    },
    {
      category_id: 4,
      langCode: "az",
      title: "hava filter sistemi"
    },
  ]);
};
