"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryOffice = exports.associateDeliveryOffice = exports.initDeliveryOffice = void 0;
const sequelize_1 = require("sequelize");
const transaction_orm_1 = require("./transaction.orm");
class DeliveryOffice extends sequelize_1.Model {
}
exports.DeliveryOffice = DeliveryOffice;
const initDeliveryOffice = (sequelize) => {
    DeliveryOffice.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        company: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        admin: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
        },
    }, { sequelize, paranoid: true, indexes: [{ fields: ['name', 'company'], unique: true, name: 'Unique_company_name' }] });
};
exports.initDeliveryOffice = initDeliveryOffice;
const associateDeliveryOffice = () => {
    DeliveryOffice.hasMany(transaction_orm_1.Transaction);
    transaction_orm_1.Transaction.belongsTo(DeliveryOffice);
};
exports.associateDeliveryOffice = associateDeliveryOffice;
//# sourceMappingURL=deliveryOffice.orm.js.map