"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Claim = exports.associateClaim = exports.initClaim = void 0;
const sequelize_1 = require("sequelize");
const transaction_orm_1 = require("./transaction.orm");
class Claim extends sequelize_1.Model {
}
exports.Claim = Claim;
const initClaim = (sequelize) => {
    Claim.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sender: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        reason: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        text: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
    }, { sequelize, paranoid: true });
};
exports.initClaim = initClaim;
const associateClaim = () => {
    Claim.belongsTo(transaction_orm_1.Transaction);
    transaction_orm_1.Transaction.hasMany(Claim);
};
exports.associateClaim = associateClaim;
//# sourceMappingURL=claim.orm.js.map