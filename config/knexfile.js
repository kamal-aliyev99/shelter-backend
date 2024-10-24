module.exports = {
    development: {
        client: "pg",
        connection: {
            database: "shelter",
            user: "admin",
            password: "admin"
        },
        migrations: {
            directory: "../data/migrations"
        },
        seeds: {
            directory: "../data/seeds"
        }
    },
    production: {

    }
}