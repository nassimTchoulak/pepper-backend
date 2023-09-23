"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const tslib_1 = require("tslib");
const joi_1 = (0, tslib_1.__importDefault)(require("joi"));
const helpers_1 = require("helpers/helpers");
const orms_1 = require("orms");
const types_1 = require("models/types");
require("dotenv/config");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const attributes_visibility_1 = require("models/attributes.visibility");
const sequelize_1 = require("sequelize");
;
class AdminController {
    static dummyMethod(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            console.log(req.admin);
            return res.json({ answer: "good from " + req.admin.name });
        });
    }
    static generateAdminToken(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const admin = {
                name: req.body.name,
                id: 0,
            };
            const adminToken = jsonwebtoken_1.default.sign(admin, req.body.privateKey, {
                algorithm: 'RS256',
                issuer: 'application',
            });
            return res.json({ adminToken });
        });
    }
    static getOngoingClaims(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transactions = yield orms_1.Transaction.findAll({
                include: [
                    { model: orms_1.Claim, required: true },
                    { model: orms_1.History, as: 'Histories' },
                    { model: orms_1.Buyer, as: 'Buyer' },
                    { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }
                ],
                where: { outcome: types_1.TransactionOutcome.ONGOING },
                order: [['createdAt', 'DESC']]
            });
            const transaction_plain = lodash_1.default.map(transactions, (transaction) => {
                const v = transaction;
                if (v.Claims.length > 0)
                    return transaction.get({ plain: true });
            });
            return res.json({ transactions: attributes_visibility_1.AdminVisibility.adaptTransactionsWithSellerToPublic(transaction_plain) });
        });
    }
    static getOngoingPayedCanceled(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transactions = yield orms_1.Transaction.findAll({
                include: [
                    { model: orms_1.Claim, required: true },
                    { model: orms_1.History, as: 'Histories' },
                    { model: orms_1.Buyer, as: 'Buyer' },
                    { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }
                ],
                where: { outcome: types_1.TransactionOutcome.ONGOING, state: types_1.CANCELED_TO_BE_PAYED_LIST },
                order: [['createdAt', 'DESC']]
            });
            const transaction_plain = lodash_1.default.map(transactions, (transaction) => {
                return transaction.get({ plain: true });
            });
            return res.json({ transactions: attributes_visibility_1.AdminVisibility.adaptTransactionsWithSellerToPublic(transaction_plain) });
        });
    }
    static getOngoingPayedFulfilled(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const new_date = new Date();
            new_date.setMinutes(new_date.getMinutes() - 2);
            const transactions = yield orms_1.Transaction.findAll({
                include: [
                    { model: orms_1.Claim, required: true },
                    { model: orms_1.History, as: 'Histories' },
                    { model: orms_1.Buyer, as: 'Buyer' },
                    { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }
                ],
                where: { outcome: types_1.TransactionOutcome.ONGOING, state: types_1.FULFILLED_TO_BE_PAYED_LIST,
                    updatedAt: {
                        [sequelize_1.Op.lt]: new_date
                    } },
                order: [['createdAt', 'DESC']]
            });
            const transaction_plain = lodash_1.default.map(transactions, (transaction) => {
                return transaction.get({ plain: true });
            });
            return res.json({ transactions: attributes_visibility_1.AdminVisibility.adaptTransactionsWithSellerToPublic(transaction_plain) });
        });
    }
}
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        name: joi_1.default.string().required(),
        privateKey: joi_1.default.string().required()
    }))
], AdminController, "generateAdminToken", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], AdminController, "getOngoingClaims", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], AdminController, "getOngoingPayedCanceled", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], AdminController, "getOngoingPayedFulfilled", null);
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map