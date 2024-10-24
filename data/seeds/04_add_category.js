/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('category').del()
  await knex('category').insert([
    {
      id: 1,
      productType_id: 1,
      slug: "mini_bunker"
    },
    {
      id: 2,
      productType_id: 1,
      slug: "standart_bomb_shelter"
    },
    {
      id: 3,
      productType_id: 1,
      slug: "luxury_bunker"
    },
    {
      id: 4,
      productType_id: 2,
      slug: "air_filtration_system"
    },
    {
      id: 5,
      productType_id: 2,
      slug: "disinfection_room"
    },
    {
      id: 6,
      productType_id: 2,
      slug: "water_supply_system"
    }
  ]);
};
