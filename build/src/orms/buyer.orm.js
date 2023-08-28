"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buyer = exports.associateUser = exports.initBuyer = void 0;
const sequelize_1 = require("sequelize");
const types_1 = require("models/types");
const invitation_orm_1 = require("orms/invitation.orm");
const transation_orm_1 = require("./transation.orm");
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
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        }
    }, { sequelize, paranoid: true });
};
exports.initBuyer = initBuyer;
const associateUser = () => {
    Buyer.belongsToMany(invitation_orm_1.Invitation, { through: transation_orm_1.Transaction, as: 'transactions' });
};
exports.associateUser = associateUser;
//# sourceMappingURL=buyer.orm.js.map