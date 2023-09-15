"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invitation = exports.associateInvitation = exports.initInvitation = void 0;
const sequelize_1 = require("sequelize");
const seller_orm_1 = require("orms/seller.orm");
const transaction_orm_1 = require("./transaction.orm");
const buyer_orm_1 = require("./buyer.orm");
const helpers_1 = require("helpers/helpers");
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
            type: sequelize_1.DataTypes.STRING,
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
        instances: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        delivery: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        autoAccept: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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