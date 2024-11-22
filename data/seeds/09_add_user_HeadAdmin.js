const bcrypt = require("bcrypt");
const fileDelete = require("../../middlewares/fileDelete");

const saltRounds = 10;

const headAdminData = {
  fullName: "Admin",
  username: "admin",
  email: "myangels.n1@gmail.com",
  password: "Admin123",
  role: 0
}

const {password, ...data} =headAdminData 

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('user').where({role: 0}).del();

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  data.password_hash = hashedPassword;

  await knex('user').insert(data);

  // fileDelete(__filename);    // Head Admin elave olunannan sonra melumatlarini silsin 
};
