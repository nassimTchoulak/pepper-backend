import { Model, DataTypes, Sequelize, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, Association, HasManyRemoveAssociationMixin, NOW } from 'sequelize';
import { Gender, UserStatus } from 'models/types';
import { Invitation } from 'orms/invitation.orm';
import { Transaction } from './transaction.orm';


class Buyer extends Model {
  public id!: number;
  public name!: string;
  public firstName!: string;
  public gender!: Gender;
  public birthDay!: Date;
  public phoneNumber!: string;
  public email!: string;
  public address!: string;
  public password!: string;
  public status!: UserStatus;

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
    birthDay: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: NOW()
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
    status: {
      type: DataTypes.ENUM(UserStatus.Pending, UserStatus.Accepted, UserStatus.Rejected, UserStatus.Started),
      allowNull: false,
      defaultValue: UserStatus.Pending,
    }
  }, { sequelize, paranoid: true });
};

const associateTransaction = () => {
  Buyer.belongsToMany(Invitation, { through: Transaction, as: 'transactions', uniqueKey: 'transactionId' });
}

export { initBuyer as initBuyer, associateTransaction , Buyer as Buyer };