"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = exports.associateHistory = exports.initHistory = void 0;
const sequelize_1 = require("sequelize");
const transaction_orm_1 = require("./transaction.orm");
class History extends sequelize_1.Model {
}
exports.History = History;
const initHistory = (sequelize) => {
    History.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        actionType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        action: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        reason: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        admin: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    }, { sequelize, paranoid: true });
};
exports.initHistory = initHistory;
const associateHistory = () => {
    History.belongsTo(transaction_orm_1.Transaction);
    transaction_orm_1.Transaction.hasMany(History);
};
exports.associateHistory = associateHistory;
//# sourceMappingURL=history.orm.js.map