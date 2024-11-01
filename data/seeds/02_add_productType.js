/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('productType').del()
  await knex('productType').insert([
    {
      // id: 1,
      slug: "shelter"
    },
    {
      // id: 2,
      slug: "equipment"
    }
  ]);
};
