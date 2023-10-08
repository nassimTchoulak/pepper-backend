"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seller = exports.associateSeller = exports.initSeller = void 0;
const sequelize_1 = require("sequelize");
const invitation_orm_1 = require("orms/invitation.orm");
const types_1 = require("models/types");
class Seller extends sequelize_1.Model {
}
exports.Seller = Seller;
const initSeller = (sequelize) => {
    Seller.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        businessName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        wilaya: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM(types_1.EntityStatus.Accepted, types_1.EntityStatus.Started, types_1.EntityStatus.Rejected, types_1.EntityStatus.Pending),
            allowNull: false,
            defaultValue: types_1.EntityStatus.Pending
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
exports.initSeller = initSeller;
const associateSeller = () => {
    Seller.hasMany(invitation_orm_1.Invitation);
};
exports.associateSeller = associateSeller;
//# sourceMappingURL=seller.orm.js.map