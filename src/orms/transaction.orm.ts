import { Model, DataTypes, Sequelize, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin, NOW,  } from 'sequelize';
import { Seller } from 'orms/seller.orm';
import { Buyer } from './buyer.orm';
import { Invitation } from './invitation.orm';
import { TransactionStatus } from 'models/types';
import { randomHash, randomHashUpper } from 'helpers/helpers';
import moment from 'moment';

class Transaction extends Model {
  public id!: number;
  public uuid!: number;
  public activationKey!: string;
  // public product!: string;
  // public description!: string;
  public date!: Date;
  // public price!: number;
  public delivery!: string;

  public state!: TransactionStatus;

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
    date: {
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
        return randomHashUpper(6)
      }
    },
    state: {
      type: DataTypes.ENUM(TransactionStatus.CANCELED, TransactionStatus.OPENED, TransactionStatus.DONE, TransactionStatus.PAYED, TransactionStatus.CONFIRMED),
      allowNull: false,
      defaultValue: TransactionStatus.OPENED
    }
  }, { sequelize, paranoid: true });
  
};


export { initTransaction, Transaction };