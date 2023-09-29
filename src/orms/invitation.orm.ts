import { Model, DataTypes, Sequelize, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin, HasManyRemoveAssociationMixin, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyAddAssociationMixin, BelongsToManyHasAssociationMixin, BelongsToManyCountAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCreateAssociationMixin } from 'sequelize';
import { Seller } from 'orms/seller.orm';
import { Transaction } from './transaction.orm';
import { Buyer } from './buyer.orm';
import { randomHash } from 'helpers/helpers';
import { DeliveryType } from 'models/types';

class Invitation extends Model {

  public id!: number;
  public uuid!: string;
  public product!: string;
  public description!: string;
  public date!: Date;
  public price!: number;
  public storeWilaya !: string;
  public storeLocation!: string;
  public deliveryType!: DeliveryType;
  public localDeliveryPrice!: number;
  public active!: boolean;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getSeller!: BelongsToGetAssociationMixin<Seller>;
  public setSeller!: BelongsToSetAssociationMixin<Seller, number>; 

  public getTransactions!: BelongsToManyGetAssociationsMixin<Buyer>;
  public addTransaction!: BelongsToManyCreateAssociationMixin<Buyer>;
  public hasTransaction!: BelongsToManyHasAssociationMixin<Buyer, number>;
  public countTransaction!: BelongsToManyCountAssociationsMixin;
  public removeTransaction!: BelongsToManyRemoveAssociationMixin<Buyer, number>;
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
      type: DataTypes.TEXT,
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
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storeWilaya: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryType: {
      type: DataTypes.ENUM(DeliveryType.BETWEEN_WILAYAS, DeliveryType.LOCAL_WILAYA_ONLY, DeliveryType.NOT_NEEDED, DeliveryType.PICK_FROM_SHOP),
      allowNull: false,
      defaultValue: DeliveryType.LOCAL_WILAYA_ONLY
    },
    localDeliveryPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ()=>{
        return randomHash(7)
      }
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
  Invitation.belongsToMany(Buyer, { through: { model: Transaction, unique: false }, as: 'transaction' });

  Transaction.belongsTo(Buyer, { as: 'Buyer'})
  Transaction.belongsTo(Invitation, { as: 'Invitation'})

  Invitation.hasMany(Transaction, { as: 'InvitationTransactions'})
}

export { initInvitation , associateInvitation , Invitation };