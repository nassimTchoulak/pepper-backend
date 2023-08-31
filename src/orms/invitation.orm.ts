import { Model, DataTypes, Sequelize, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin, HasManyRemoveAssociationMixin, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin } from 'sequelize';
import { Seller } from 'orms/seller.orm';
import { Transaction } from './transaction.orm';
import { Buyer } from './buyer.orm';
import { TransactionStatus } from 'models/types';

class Invitation extends Model {
  public id!: number;
  public product!: string;
  public description!: string;
  public date!: Date;
  public price!: number;
  public instances!: number;
  public delivery!: string;
  public active!: boolean;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getSeller!: BelongsToGetAssociationMixin<Seller>;
  public setSeller!: BelongsToSetAssociationMixin<Seller, number>; 

  public getTransactions!: HasManyGetAssociationsMixin<Transaction>;
  public addTransaction!: HasManyAddAssociationMixin<Transaction, number>;
  public hasTransaction!: HasManyHasAssociationMixin<Transaction, number>;
  public countTransaction!: HasManyCountAssociationsMixin;
  public removeTransaction!: HasManyRemoveAssociationMixin<Transaction, number>;
}
const initInvitation = (sequelize: Sequelize) => {
  Invitation.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    instances: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  }, { sequelize, paranoid: true });
  
};

const associateInvitation = () => {
  Invitation.belongsTo(Seller);
  Invitation.belongsToMany(Buyer, { through: Transaction, as: 'transaction' });
}

export { initInvitation , associateInvitation , Invitation };