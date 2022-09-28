require("dotenv").config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
    },
    pool: {
      min: 1,
      max: 3,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
