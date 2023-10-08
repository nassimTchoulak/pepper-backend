import { Model, DataTypes, Sequelize } from 'sequelize';

import { Transaction } from './transaction.orm';


class DeliveryOffice extends Model {
  public id!: number;
  public name!: string;
  public company!: string;
  public email!: string;
  public admin!: boolean;
  public password!: string;


  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  // public getInvitations!: HasManyGetAssociationsMixin<Invitation>;
  // public addInvitation!: BelongsToManyAddAssociationMixin<Invitation, number>;
  // public hasInvitation!: BelongsToManyHasAssociationsMixin<Invitation, number>;
  // public countInvitations!: HasManyCountAssociationsMixin;
}

const initDeliveryOffice = (sequelize: Sequelize) => {

  DeliveryOffice.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

  }, { sequelize, paranoid: true, indexes: [{ fields:['name', 'company'], unique: true, name: 'Unique_company_name'}] });
};

const associateDeliveryOffice = () => {
  DeliveryOffice.hasMany(Transaction);
  Transaction.belongsTo(DeliveryOffice);
}

export { initDeliveryOffice, associateDeliveryOffice , DeliveryOffice as DeliveryOffice };