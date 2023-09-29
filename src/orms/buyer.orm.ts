import { Model, DataTypes, Sequelize, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, Association, HasManyRemoveAssociationMixin, NOW, BelongsToManyHasAssociationsMixin, BelongsToManyAddAssociationMixin } from 'sequelize';
import { Gender, UserStatus } from 'models/types';
import { Invitation } from 'orms/invitation.orm';
import { Transaction } from './transaction.orm';
import { Claim } from './claim.orm';


class Buyer extends Model {
  public id!: number;
  public name!: string;
  public firstName!: string;
  public gender!: Gender;
  public birthDay!: Date;
  public phoneNumber!: string;
  public email!: string;
  public wilaya!: string;
  public address!: string;
  public password!: string;
  public status!: UserStatus;
  public emailCode!: number;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  // public getInvitations!: HasManyGetAssociationsMixin<Invitation>;
  // public addInvitation!: BelongsToManyAddAssociationMixin<Invitation, number>;
  // public hasInvitation!: BelongsToManyHasAssociationsMixin<Invitation, number>;
  // public countInvitations!: HasManyCountAssociationsMixin;
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
    wilaya: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(UserStatus.Pending, UserStatus.Accepted, UserStatus.Rejected, UserStatus.Started),
      allowNull: false,
      defaultValue: UserStatus.Pending,
    },
    emailCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: ()=>{
        return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
      }
    },
  }, { sequelize, paranoid: true });
};

const associateTransaction = () => {
  Buyer.belongsToMany(Invitation, { through: { model: Transaction, unique: false }, as: 'transaction' });
}

export { initBuyer as initBuyer, associateTransaction , Buyer as Buyer };