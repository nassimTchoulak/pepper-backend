import { Model, DataTypes, Sequelize } from 'sequelize';

import { Transaction } from './transaction.orm';

/**
 * Admin side actions on every transaction
 */
class History extends Model {
  public id!: number;
  public action!: string;
  public reason!: string;
  public admin!: string;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

}
const initHistory = (sequelize: Sequelize) => {
  History.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, { sequelize, paranoid: true });
  
};

const associateHistory = () => {
  History.belongsTo(Transaction)
  Transaction.hasMany(History)
}

export { initHistory , associateHistory , History };