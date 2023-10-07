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
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const pricing_1 = (0, tslib_1.__importDefault)(require("models/pricing"));
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
                    { model: orms_1.History, as: 'Histories', required: false },
                    { model: orms_1.Buyer, as: 'Buyer' },
                    { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }
                ],
                where: { outcome: types_1.TransactionOutcome.ONGOING, state: [types_1.TransactionStatus.FULFILLED, types_1.TransactionStatus.PAYED, types_1.TransactionStatus.ACCEPTED] },
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
                    { model: orms_1.Claim, required: false },
                    { model: orms_1.History, as: 'Histories', required: false },
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
                    { model: orms_1.Claim, required: false },
                    { model: orms_1.History, as: 'Histories', required: false },
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
    static decideOnTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transaction = yield orms_1.Transaction.findOne({
                where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Buyer, as: 'Buyer' }, { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }], nest: true, raw: false
            });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            yield orms_1.History.create({ actionType: 'decision modify state',
                action: `${transaction.uuid} modified state from ${transaction.state} to ${req.body.decision} `, reason: req.body.reason,
                admin: req.admin.name, TransactionId: transaction.id });
            yield transaction.update({ state: req.body.decision });
            return res.json({ transaction: attributes_visibility_1.AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({ plain: true })) });
        });
    }
    static closeTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transaction = yield orms_1.Transaction.findOne({
                where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Buyer, as: 'Buyer' }, { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }], nest: true, raw: false
            });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction.outcome !== types_1.TransactionOutcome.ONGOING) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Transaction already closed' });
            }
            const state = transaction === null || transaction === void 0 ? void 0 : transaction.state;
            let outcome;
            if (types_1.CANCELED_TO_BE_PAYED_LIST.indexOf(state) !== -1) {
                outcome = types_1.TransactionOutcome.CLOSED_FAILED;
            }
            else {
                if (types_1.FULFILLED_TO_BE_PAYED_LIST.indexOf(state) != -1) {
                    outcome = types_1.TransactionOutcome.CLOSED_SUCCESS;
                }
                else {
                    res.status(http_status_1.default.UNAUTHORIZED);
                    return res.json({ message: 'Transaction can not be closed' });
                }
            }
            const priceInterface = (0, pricing_1.default)(transaction);
            yield orms_1.History.create({ actionType: 'closing & accounting',
                action: `${transaction.uuid}`,
                reason: `${JSON.stringify(priceInterface)}`,
                admin: req.admin.name, TransactionId: transaction.id });
            yield transaction.update({ outcome: outcome });
            return res.json({ transaction: attributes_visibility_1.AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({ plain: true })) });
        });
    }
    static getSellerHistory(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const seller = yield orms_1.Seller.findOne({ where: { email: req.body.sellerEmail } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Seller not found' });
            }
            const invitations = yield orms_1.Invitation.findAll({
                include: [
                    { model: orms_1.Transaction, as: 'InvitationTransactions', required: false }
                ],
                where: {
                    SellerId: seller.id
                }, raw: true,
                order: [['createdAt', 'DESC']]
            });
            return res.json({ invitations: attributes_visibility_1.SellerVisibility.AdaptListOfInvitationTransactionToSeller(invitations) });
        });
    }
    static getBuyerHistory(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const buyer = yield orms_1.Buyer.findOne({ where: { email: req.body.BuyerEmail } });
            if (!buyer) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Seller not found' });
            }
            const transactions = yield orms_1.Transaction.findAll({ where: { BuyerId: buyer.id },
                include: [{ model: orms_1.Invitation, as: 'Invitation' }], raw: true, nest: true, order: [['createdAt', 'DESC']] });
            return res.json({ transactions: attributes_visibility_1.BuyerVisibility.adaptListOfTransactionNoSellerToBuyer(transactions) });
        });
    }
    static getActionsHistory(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const actions = yield orms_1.History.findAll({ order: [['createdAt', 'DESC']], raw: true, nest: true });
            return res.json({ history: actions });
        });
    }
    static getTransactionDetail(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transaction = yield orms_1.Transaction.findOne({
                include: [
                    { model: orms_1.Claim, as: 'Claims', required: false },
                    { model: orms_1.History, as: 'Histories', required: false },
                    { model: orms_1.Buyer, as: 'Buyer' },
                    { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }
                ],
                where: { uuid: req.body.transactionUuid },
                order: [['createdAt', 'DESC']],
                raw: false, nest: true
            });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'transaction not found' });
            }
            return res.json({ transactions: attributes_visibility_1.AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({ plain: true })) });
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
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
        decision: joi_1.default.string().valid(types_1.TransactionStatus.PAYED_GHOSTED, types_1.TransactionStatus.PAYED_BUYER_CANCEL_LATE, types_1.TransactionStatus.PAYED_SELLER_CANCEL, types_1.TransactionStatus.PAYED_REIMBURSED, types_1.TransactionStatus.PAYED_COMPLEX_CANCEL, types_1.TransactionStatus.FULFILLED_CONTINUE, types_1.TransactionStatus.FULFILLED_HOLD, types_1.TransactionStatus.FULFILLED).required(),
        reason: joi_1.default.string().required()
    }))
], AdminController, "decideOnTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
    }))
], AdminController, "closeTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        sellerEmail: joi_1.default.string().required()
    }))
], AdminController, "getSellerHistory", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        BuyerEmail: joi_1.default.string().required()
    }))
], AdminController, "getBuyerHistory", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], AdminController, "getActionsHistory", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required()
    }))
], AdminController, "getTransactionDetail", null);
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map