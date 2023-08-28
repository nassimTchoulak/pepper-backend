"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.initTransaction = void 0;
const sequelize_1 = require("sequelize");
const buyer_orm_1 = require("./buyer.orm");
const invitation_orm_1 = require("./invitation.orm");
class Transaction extends sequelize_1.Model {
}
exports.Transaction = Transaction;
const initTransaction = (sequelize) => {
    Transaction.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        buyerId: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: buyer_orm_1.Buyer,
                key: 'id'
            }
        },
        invitationId: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: invitation_orm_1.Invitation,
                key: 'id'
            }
        },
        operation: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        code: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
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
        },
        delivery: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, { sequelize, paranoid: true });
};
exports.initTransaction = initTransaction;
//# sourceMappingURL=transation.orm.js.map