import { Model, DataTypes, Sequelize, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, Association, HasManyRemoveAssociationMixin } from 'sequelize';
import { Gender } from 'models/types';
import { Invitation } from 'orms/invitation.orm';
import { Transaction } from './transation.orm';


class Buyer extends Model {
  public id!: number;
  public name!: string;
  public firstName!: string;
  public gender!: Gender;
  public phoneNumber!: string;
  public email!: string;
  public address!: string;
  public password!: string;
  public readonly transactions!: Transaction[];

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getInvitations!: HasManyGetAssociationsMixin<Invitation>;
  public addInvitation!: HasManyAddAssociationMixin<Invitation, number>;
  public hasInvitation!: HasManyHasAssociationMixin<Invitation, number>;
  public countInvitations!: HasManyCountAssociationsMixin;
  public InvitationParty!: HasManyRemoveAssociationMixin<Invitation, number>;
}

const initBuyer = (sequelize: Sequelize) => {

  Buyer.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM(Gender.MAN, Gender.WOMAN),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, { sequelize, paranoid: true });
};

const associateUser = () => {
  Buyer.belongsToMany(Invitation, { through: Transaction, as: 'transactions' });
}

export { initBuyer as initBuyer, associateUser, Buyer as Buyer };