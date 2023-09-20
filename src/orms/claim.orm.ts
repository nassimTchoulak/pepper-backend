import { Model, DataTypes, Sequelize } from 'sequelize';

import { Transaction } from './transaction.orm';


class Claim extends Model {
  public id!: number;
  public sender!: string;
  public reason!: string;
  public text!: string;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

}
const initClaim = (sequelize: Sequelize) => {
  Claim.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, { sequelize, paranoid: true });
  
};

const associateClaim = () => {
  Claim.belongsTo(Transaction)
  Transaction.hasMany(Claim)
}

export { initClaim , associateClaim , Claim };