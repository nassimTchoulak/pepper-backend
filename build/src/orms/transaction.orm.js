"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.initTransaction = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const buyer_orm_1 = require("./buyer.orm");
const invitation_orm_1 = require("./invitation.orm");
const types_1 = require("models/types");
const helpers_1 = require("helpers/helpers");
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
class Transaction extends sequelize_1.Model {
}
exports.Transaction = Transaction;
const initTransaction = (sequelize) => {
    Transaction.init({
        transactionId: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: () => {
                return (0, helpers_1.randomHash)(2) + (0, moment_1.default)().format("YY-MM-DD") + (0, helpers_1.randomHash)(3);
            }
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
        activationKey: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: () => {
                return (0, helpers_1.randomHash)(6);
            }
        },
        state: {
            type: sequelize_1.DataTypes.ENUM(types_1.TransactionStatus.CANCELED, types_1.TransactionStatus.OPENED, types_1.TransactionStatus.DONE, types_1.TransactionStatus.PAYED, types_1.TransactionStatus.CONFIRMED),
            allowNull: false,
            defaultValue: types_1.TransactionStatus.OPENED
        }
    }, { sequelize, paranoid: true });
};
exports.initTransaction = initTransaction;
//# sourceMappingURL=transaction.orm.js.map