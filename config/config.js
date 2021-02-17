require('dotenv-flow').config()

/**
 * This file is REQUIRED by sequelize-cli, including MIGRATIONS
 */

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    dialect: 'postgres',
    operatorsAliases: false,
  },
}
