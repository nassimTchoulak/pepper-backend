import { Model, DataTypes, Sequelize, BelongsToSetAssociationMixin, BelongsToGetAssociationMixin,  } from 'sequelize';
import { Seller } from 'orms/seller.orm';
import { Buyer } from './buyer.orm';
import { Invitation } from './invitation.orm';

class Transaction extends Model {
  public id!: number;
  public operation!: string;
  public code!: string;
  public product!: string;
  public description!: string;
  public date!: Date;
  public price!: number;
  public instances!: number;
  public delivery!: string;



  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date;

  public getSeller!: BelongsToGetAssociationMixin<Seller>;
  public setSeller!: BelongsToSetAssociationMixin<Seller, number>; 

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
    buyerId: {
      type: DataTypes.INTEGER,
      references: {
        model: Buyer, 
        key: 'id'
      }
    },
    invitationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Invitation,
        key: 'id'
      }
    },
    operation: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
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
    },
    delivery: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, { sequelize, paranoid: true });
  
};


export { initTransaction, Transaction };