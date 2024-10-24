/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('product').del()
  await knex('product').insert([
    {
      id: 1,
      category_id: 1,
      slug: "mini_bunker_1"
    },
    {
      id: 2,
      category_id: 1,
      slug: "mini_bunker_2"
    },
    {
      id: 3,
      category_id: 2,
      slug: "standart_bomb_shelter_1"
    },
    {
      id: 4,
      category_id: 2,
      slug: "standart_bomb_shelter_2"
    },
    {
      id: 5,
      category_id: 5,
      slug: "disinfection_room_1"
    },
    {
      id: 6,
      category_id: 5,
      slug: "disinfection_room_2"
    },
    {
      id: 7,
      category_id: 5,
      slug: "disinfection_room_3"
    }
  ]);
};
