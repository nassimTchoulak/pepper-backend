"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invitation = exports.associateInvitation = exports.initInvitation = void 0;
const sequelize_1 = require("sequelize");
const seller_orm_1 = require("orms/seller.orm");
const transaction_orm_1 = require("./transaction.orm");
const buyer_orm_1 = require("./buyer.orm");
const helpers_1 = require("helpers/helpers");
const types_1 = require("models/types");
class Invitation extends sequelize_1.Model {
}
exports.Invitation = Invitation;
const initInvitation = (sequelize) => {
    Invitation.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        product: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        price: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
        },
        storeLocation: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        storeWilaya: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        deliveryType: {
            type: sequelize_1.DataTypes.ENUM(types_1.DeliveryType.BETWEEN_WILAYAS, types_1.DeliveryType.LOCAL_WILAYA_ONLY, types_1.DeliveryType.NOT_NEEDED, types_1.DeliveryType.PICK_FROM_SHOP),
            allowNull: false,
            defaultValue: types_1.DeliveryType.LOCAL_WILAYA_ONLY
        },
        localDeliveryPrice: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        uuid: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: () => {
                return (0, helpers_1.randomHash)(7);
            }
        },
        active: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, { sequelize, paranoid: true });
};
exports.initInvitation = initInvitation;
const associateInvitation = () => {
    Invitation.belongsTo(seller_orm_1.Seller);
    Invitation.belongsToMany(buyer_orm_1.Buyer, { through: { model: transaction_orm_1.Transaction, unique: false }, as: 'transaction' });
    transaction_orm_1.Transaction.belongsTo(buyer_orm_1.Buyer, { as: 'Buyer' });
    transaction_orm_1.Transaction.belongsTo(Invitation, { as: 'Invitation' });
    Invitation.hasMany(transaction_orm_1.Transaction, { as: 'InvitationTransactions' });
};
exports.associateInvitation = associateInvitation;
//# sourceMappingURL=invitation.orm.js.map