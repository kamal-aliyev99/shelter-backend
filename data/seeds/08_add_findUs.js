/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('findUs').del()
  await knex('findUs').insert([
    {
      id: 0,
      key: "other"
    }
  ]);
};
