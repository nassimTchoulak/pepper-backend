import {
  Model, DataTypes, Sequelize, 
  HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, HasManyCountAssociationsMixin,
} from 'sequelize';
import { Invitation } from 'orms/invitation.orm';
import { UserStatus } from 'models/types';

class Seller extends Model {
  public id!: number;
  public phoneNumber!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public firstName!: string;
  public businessName!: string;
  public location!: string;
  public description!: string;
  public status!: UserStatus;
  public emailCode !: number;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getInvitations!: HasManyGetAssociationsMixin<Invitation>;
  public addInvitation!: HasManyAddAssociationMixin<Invitation, number>;
  public hasInvitations!: HasManyHasAssociationMixin<Invitation, number>;
  public countInvitations!: HasManyCountAssociationsMixin;
}

const initSeller = (sequelize: Sequelize) => {
  Seller.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM( UserStatus.Accepted, UserStatus.Started, UserStatus.Rejected, UserStatus.Pending ),
      allowNull: false,
      defaultValue: UserStatus.Pending 
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

const associateSeller = () => {
  Seller.hasMany(Invitation);
}

export { initSeller as initSeller, associateSeller as associateSeller, Seller as Seller };