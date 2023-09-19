import { Model, DataTypes, Sequelize, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin, NOW,  } from 'sequelize';
import { Seller } from 'orms/seller.orm';
import { Buyer } from './buyer.orm';
import { Invitation } from './invitation.orm';
import { TransactionOutcome, TransactionStatus } from 'models/types';
import { randomHash, randomHashUpper } from 'helpers/helpers';
import moment from 'moment';

class Transaction extends Model {
  public id!: number;
  public uuid!: number;
  public activationKey!: string;
  public paymentDate!: Date;
  // public product!: string;
  // public description!: string;
  public deliveryDate!: Date;
  // public price!: number;
  public delivery!: string;

  public state!: TransactionStatus;
  public outcome!: TransactionOutcome;

  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getInvitation!: BelongsToGetAssociationMixin<Invitation>;
  public setInvitation!: BelongsToSetAssociationMixin<Invitation, number>; 

  public getBuyer!: BelongsToGetAssociationMixin<Buyer>;
  public setBuyer!: BelongsToSetAssociationMixin<Buyer, number>; 

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
      allowNull: false,
      defaultValue: NOW()
    },
    delivery: {
      type: DataTypes.STRING,
      allowNull: false,
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
      type: DataTypes.ENUM(TransactionStatus.CANCELED, TransactionStatus.OPENED, TransactionStatus.FULFILLED, TransactionStatus.PAYED, TransactionStatus.BUYER_CANCEL_MID,
         TransactionStatus.ACCEPTED, TransactionStatus.BUYER_CANCEL_EARLY, TransactionStatus.BUYER_CANCEL_LATE, TransactionStatus.SELLER_CANCEL, TransactionStatus.GHOSTED),
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