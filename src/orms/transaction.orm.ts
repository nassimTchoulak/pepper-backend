import { Model, DataTypes, Sequelize, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin, NOW, BelongsToManyAddAssociationMixin, HasManyGetAssociationsMixin, HasManyAddAssociationsMixin, HasManyAddAssociationMixin,  } from 'sequelize';
import { Seller } from 'orms/seller.orm';
import { Buyer } from './buyer.orm';
import { Invitation } from './invitation.orm';
import { DeliveryType, TransactionOutcome, TransactionStatus } from 'models/types';
import { randomHash, randomHashUpper } from 'helpers/helpers';
import moment from 'moment';
import { Claim } from './claim.orm';

class Transaction extends Model {
  public id!: number;
  public uuid!: number;
  public activationKey!: string;
  public paymentDate!: Date;
  public deliveryDate!: Date;
  public deliveryPlace!: string;
  public deliveryType!: DeliveryType;
  public deliveryPrice!: number;
  public state!: TransactionStatus;
  public outcome!: TransactionOutcome;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getInvitation!: BelongsToGetAssociationMixin<Invitation>;
  public setInvitation!: BelongsToSetAssociationMixin<Invitation, number>; 

  public getBuyer!: BelongsToGetAssociationMixin<Buyer>;
  public setBuyer!: BelongsToSetAssociationMixin<Buyer, number>; 

  public getClaims!: HasManyGetAssociationsMixin<Claim>;
  public addClaim!: HasManyAddAssociationMixin<Claim, number>;

}
const initTransaction = (sequelize: Sequelize) => {
    Transaction.init({
      id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: ()=>{
        return randomHashUpper(2) + moment().format("-YY-MM-DD-") + randomHashUpper(3)
      }
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveryPlace: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryType: {
      type: DataTypes.ENUM(DeliveryType.BETWEEN_WILAYAS, DeliveryType.LOCAL_WILAYA_ONLY, DeliveryType.NOT_NEEDED, DeliveryType.PICK_FROM_SHOP),
      allowNull: false,
      defaultValue: DeliveryType.LOCAL_WILAYA_ONLY
    },
    deliveryPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    activationKey: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ()=>{
        return randomHashUpper(7)
      }
    },
    paymentDate : {
      type: DataTypes.DATE,
      allowNull: true
    },
    state: {
      type: DataTypes.ENUM(TransactionStatus.CANCELED, TransactionStatus.OPENED, TransactionStatus.FULFILLED, TransactionStatus.PAYED, 
        TransactionStatus.PAYED_BUYER_CANCEL_MID, TransactionStatus.ACCEPTED, TransactionStatus.PAYED_BUYER_CANCEL_EARLY, TransactionStatus.PAYED_COMPLEX_CANCEL,
        TransactionStatus.FULFILLED_CONTINUE, TransactionStatus.FULFILLED_HOLD,
         TransactionStatus.PAYED_BUYER_CANCEL_LATE, TransactionStatus.PAYED_SELLER_CANCEL, TransactionStatus.PAYED_GHOSTED,  TransactionStatus.PAYED_REIMBURSED),
      allowNull: false,
      defaultValue: TransactionStatus.OPENED
    },
    outcome : {
      type: DataTypes.ENUM( TransactionOutcome.CANCELED, TransactionOutcome.ONGOING, TransactionOutcome.CLOSED_FAILED, TransactionOutcome.CLOSED_SUCCESS),
      allowNull: false,
      defaultValue: TransactionOutcome.ONGOING
    }
  }, { sequelize, paranoid: true });
  
};


export { initTransaction, Transaction };