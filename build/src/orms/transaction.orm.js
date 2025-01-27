"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.initTransaction = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const types_1 = require("models/types");
const helpers_1 = require("helpers/helpers");
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
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
        uuid: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: () => {
                return (0, helpers_1.randomHashUpper)(2) + (0, moment_1.default)().format("-YY-MM-DD-") + (0, helpers_1.randomHashUpper)(3);
            }
        },
        deliveryDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        deliveryPlace: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        deliveryType: {
            type: sequelize_1.DataTypes.ENUM(types_1.DeliveryType.BETWEEN_WILAYAS, types_1.DeliveryType.LOCAL_WILAYA_ONLY, types_1.DeliveryType.NOT_NEEDED, types_1.DeliveryType.PICK_FROM_SHOP),
            allowNull: false,
            defaultValue: types_1.DeliveryType.LOCAL_WILAYA_ONLY
        },
        deliveryPrice: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        activationKey: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: () => {
                return (0, helpers_1.randomHashUpper)(7);
            }
        },
        paymentDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        state: {
            type: sequelize_1.DataTypes.ENUM(types_1.TransactionStatus.CANCELED, types_1.TransactionStatus.OPENED, types_1.TransactionStatus.FULFILLED, types_1.TransactionStatus.PAYED, types_1.TransactionStatus.PAYED_BUYER_CANCEL_MID, types_1.TransactionStatus.ACCEPTED, types_1.TransactionStatus.PAYED_BUYER_CANCEL_EARLY, types_1.TransactionStatus.PAYED_COMPLEX_CANCEL, types_1.TransactionStatus.FULFILLED_CONTINUE, types_1.TransactionStatus.FULFILLED_HOLD, types_1.TransactionStatus.PAYED_BUYER_CANCEL_LATE, types_1.TransactionStatus.PAYED_SELLER_CANCEL, types_1.TransactionStatus.PAYED_GHOSTED, types_1.TransactionStatus.PAYED_REIMBURSED),
            allowNull: false,
            defaultValue: types_1.TransactionStatus.OPENED
        },
        outcome: {
            type: sequelize_1.DataTypes.ENUM(types_1.TransactionOutcome.CANCELED, types_1.TransactionOutcome.ONGOING, types_1.TransactionOutcome.CLOSED_FAILED, types_1.TransactionOutcome.CLOSED_SUCCESS),
            allowNull: false,
            defaultValue: types_1.TransactionOutcome.ONGOING
        },
        certifiedDelivery: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        certifiedCompany: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
    }, { sequelize, paranoid: true });
};
exports.initTransaction = initTransaction;
//# sourceMappingURL=transaction.orm.js.map