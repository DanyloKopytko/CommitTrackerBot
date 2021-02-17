const Sequelize = require('sequelize')

class Connection extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        chatId: Sequelize.BIGINT,
        token: Sequelize.UUID,
      },
      { sequelize, tableName: 'connections' }
    )
  }
}

module.exports = Connection
