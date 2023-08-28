"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invitation = exports.associateInvitation = exports.initInvitation = void 0;
const sequelize_1 = require("sequelize");
const seller_orm_1 = require("orms/seller.orm");
const transation_orm_1 = require("./transation.orm");
const buyer_orm_1 = require("./buyer.orm");
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
        status: {
            type: sequelize_1.DataTypes.ENUM(types_1.TransactionStatus.OPENED, types_1.TransactionStatus.CONFIRMED, types_1.TransactionStatus.CANCELED, types_1.TransactionStatus.PAYED, types_1.TransactionStatus.DONE),
            allowNull: false,
            defaultValue: types_1.TransactionStatus.OPENED
        },
    }, { sequelize, paranoid: true });
};
exports.initInvitation = initInvitation;
const associateInvitation = () => {
    Invitation.belongsTo(seller_orm_1.Seller);
    Invitation.belongsToMany(buyer_orm_1.Buyer, { through: transation_orm_1.Transaction, as: 'transaction' });
};
exports.associateInvitation = associateInvitation;
//# sourceMappingURL=invitation.orm.js.map