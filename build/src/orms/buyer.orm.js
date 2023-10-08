"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buyer = exports.associateTransaction = exports.initBuyer = void 0;
const sequelize_1 = require("sequelize");
const types_1 = require("models/types");
const invitation_orm_1 = require("orms/invitation.orm");
const transaction_orm_1 = require("./transaction.orm");
class Buyer extends sequelize_1.Model {
}
exports.Buyer = Buyer;
const initBuyer = (sequelize) => {
    Buyer.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: sequelize_1.DataTypes.ENUM(types_1.Gender.MAN, types_1.Gender.WOMAN),
            allowNull: false,
        },
        birthDay: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: (0, sequelize_1.NOW)()
        },
        phoneNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        wilaya: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM(types_1.EntityStatus.Pending, types_1.EntityStatus.Accepted, types_1.EntityStatus.Rejected, types_1.EntityStatus.Started),
            allowNull: false,
            defaultValue: types_1.EntityStatus.Pending,
        },
        emailCode: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: () => {
                return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
            }
        },
    }, { sequelize, paranoid: true });
};
exports.initBuyer = initBuyer;
const associateTransaction = () => {
    Buyer.belongsToMany(invitation_orm_1.Invitation, { through: { model: transaction_orm_1.Transaction, unique: false }, as: 'transaction' });
};
exports.associateTransaction = associateTransaction;
//# sourceMappingURL=buyer.orm.js.map