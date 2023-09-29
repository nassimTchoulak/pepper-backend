"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationController = void 0;
const tslib_1 = require("tslib");
const joi_1 = (0, tslib_1.__importDefault)(require("joi"));
const helpers_1 = require("helpers/helpers");
const orms_1 = require("orms");
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
require("dotenv/config");
const types_1 = require("models/types");
const transaction_orm_1 = require("orms/transaction.orm");
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const attributes_visibility_1 = require("models/attributes.visibility");
const wilayas_1 = require("models/wilayas");
const console_1 = require("console");
;
class InvitationController {
    static createTransactionFromInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const invitation = yield orms_1.Invitation.findOne({ where: { uuid: req.body.InvitationUuid } });
            if (!invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'invitation does not exist' });
            }
            if (!process.env.JWT_BUYER_KEY) {
                throw 'JWT key not provided';
            }
            const buyer_token = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY);
            const buyer = yield orms_1.Buyer.findOne({ where: { id: buyer_token.id }, raw: false });
            if (!buyer) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'buyer does not exist' });
            }
            if ((invitation.deliveryType === types_1.DeliveryType.LOCAL_WILAYA_ONLY)
                && (req.body.deliveryWilaya !== invitation.storeWilaya)) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'transaction is not allowed in different wilaya' });
            }
            let price = 0;
            let type;
            if ((invitation.deliveryType === types_1.DeliveryType.NOT_NEEDED) ||
                (invitation.deliveryType === types_1.DeliveryType.PICK_FROM_SHOP)) {
                price = 0;
                type = invitation.deliveryType;
            }
            else {
                if (invitation.deliveryType === types_1.DeliveryType.LOCAL_WILAYA_ONLY) {
                    (0, console_1.assert)(req.body.deliveryWilaya === invitation.storeWilaya);
                    price = invitation.localDeliveryPrice;
                    type = types_1.DeliveryType.LOCAL_WILAYA_ONLY;
                }
                else {
                    if (req.body.deliveryWilaya === invitation.storeWilaya) {
                        price = invitation.localDeliveryPrice;
                        type = types_1.DeliveryType.LOCAL_WILAYA_ONLY;
                    }
                    else {
                        price = -1;
                        type = types_1.DeliveryType.BETWEEN_WILAYAS;
                    }
                }
            }
            const transactionInfo = {
                InvitationId: invitation.id,
                BuyerId: buyer.id,
                deliveryPlace: req.body.deliveryPlace + ", " + req.body.deliveryWilaya,
                deliveryType: type,
                deliveryPrice: price,
                uuid: (0, helpers_1.transactionUUid)()
            };
            yield transaction_orm_1.Transaction.create(transactionInfo);
            const transaction = yield transaction_orm_1.Transaction.findOne({
                where: { uuid: transactionInfo.uuid },
                include: [{ model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }], nest: true, raw: true
            });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(transaction) });
        });
    }
    static payTheTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uuid = req.body.transactionUuid;
            if (!process.env.JWT_BUYER_KEY) {
                throw 'JWT key not provided';
            }
            const buyer_token = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY);
            const transaction = yield transaction_orm_1.Transaction.findOne({ where: { uuid: uuid, BuyerId: buyer_token.id } });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'transaction does not exist' });
            }
            if (transaction.state !== types_1.TransactionStatus.ACCEPTED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Cant pay a transaction that is not in accepted state' });
            }
            const result = yield transaction.update({ state: types_1.TransactionStatus.PAYED, paymentDate: new Date() });
            return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({ plain: true })) });
        });
    }
    static closeTheTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uuid = req.body.transactionUuid;
            if (!process.env.JWT_BUYER_KEY) {
                throw 'JWT key not provided';
            }
            const buyer_token = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY);
            const transaction = yield transaction_orm_1.Transaction.findOne({ where: { uuid: uuid, BuyerId: buyer_token.id } });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'transaction does not exist' });
            }
            if (transaction.state === types_1.TransactionStatus.FULFILLED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'transaction is already fulfilled' });
            }
            if (transaction.state === types_1.TransactionStatus.CANCELED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'transaction is already Canceled' });
            }
            if ((transaction.state === types_1.TransactionStatus.ACCEPTED) || (transaction.state === types_1.TransactionStatus.OPENED)) {
                const result = yield transaction.update({ state: types_1.TransactionStatus.CANCELED, outcome: types_1.TransactionOutcome.CANCELED });
                return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({ plain: true })) });
            }
            if (transaction.state === types_1.TransactionStatus.PAYED) {
                const paymentDate = new Date(transaction.paymentDate);
                paymentDate.setHours(paymentDate.getHours() + 3);
                const nowDate = new Date();
                if (paymentDate > nowDate) {
                    const result = yield transaction.update({ state: types_1.TransactionStatus.PAYED_BUYER_CANCEL_EARLY });
                    return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({ plain: true })) });
                }
                else {
                    paymentDate.setHours(paymentDate.getHours() + 21);
                    const delivery_time_minus_24 = new Date(transaction.deliveryDate);
                    delivery_time_minus_24.setHours(delivery_time_minus_24.getHours() - 24);
                    if ((nowDate < paymentDate) && (nowDate < delivery_time_minus_24)) {
                        const result = yield transaction.update({ state: types_1.TransactionStatus.PAYED_BUYER_CANCEL_MID });
                        return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({ plain: true })) });
                    }
                    else {
                        const result = yield transaction.update({ state: types_1.TransactionStatus.PAYED_BUYER_CANCEL_LATE });
                        return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({ plain: true })) });
                    }
                }
            }
            const result = yield transaction.update({ state: types_1.TransactionStatus.PAYED });
            return res.json({ transaction: attributes_visibility_1.BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({ plain: true })) });
        });
    }
    static addBuyerClaim(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_BUYER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY);
            const transaction_invitation = yield transaction_orm_1.Transaction.findOne({ where: { uuid: req.body.transactionUuid },
                raw: false });
            if (!transaction_invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction_invitation.BuyerId !== TokenSeller.id) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Transaction can only be accessed by it\'s Buyer ' });
            }
            const transaction = transaction_invitation;
            const claim = yield orms_1.Claim.create({ sender: 'From Buyer', reason: req.body.reason, text: req.body.text });
            yield transaction.addClaim(claim);
            return res.json({ status: true });
        });
    }
    static acceptTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const transaction_invitation = yield transaction_orm_1.Transaction.findOne({ where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Invitation, as: 'Invitation' }, { model: orms_1.Buyer, as: 'Buyer' }], nest: true, raw: false });
            if (!transaction_invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Transaction can only be accessed by it\'s seller ' });
            }
            if (transaction_invitation.state !== types_1.TransactionStatus.OPENED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'The Transaction has been modified and can not be accepted' });
            }
            const price = (transaction_invitation.deliveryType === types_1.DeliveryType.BETWEEN_WILAYAS) ? req.body.deliveryPrice : transaction_invitation.deliveryPrice;
            const transaction = transaction_invitation;
            yield transaction.update({ state: types_1.TransactionStatus.ACCEPTED, deliveryPrice: price, deliveryDate: req.body.date });
            return res.json({ transaction: attributes_visibility_1.SellerVisibility.AdaptSellerFullTransactionToSeller(transaction.get({ plain: true })) });
        });
    }
    static rejectTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const transaction_invitation = yield transaction_orm_1.Transaction.findOne({ where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Invitation, as: 'Invitation' }, { model: orms_1.Buyer, as: 'Buyer' }], nest: true, raw: false });
            if (!transaction_invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Transaction can only be accessed by it\'s seller ' });
            }
            if ((transaction_invitation.state === types_1.TransactionStatus.OPENED) || (transaction_invitation.state === types_1.TransactionStatus.ACCEPTED)) {
                const transaction = transaction_invitation;
                yield transaction.update({ state: types_1.TransactionStatus.CANCELED, outcome: types_1.TransactionOutcome.CANCELED, delivery: req.body.delivery, date: req.body.date });
                return res.json({ transaction: attributes_visibility_1.SellerVisibility.AdaptSellerFullTransactionToSeller(transaction.get({ plain: true })) });
            }
            else {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Can not cancel the Transaction ' });
            }
        });
    }
    static addSellerClaim(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const transaction_invitation = yield transaction_orm_1.Transaction.findOne({ where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Invitation, as: 'Invitation' }], raw: false });
            if (!transaction_invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Transaction can only be accessed by it\'s seller ' });
            }
            const transaction = transaction_invitation;
            const claim = yield orms_1.Claim.create({ sender: 'From Seller', reason: req.body.reason, text: req.body.text });
            yield transaction.addClaim(claim);
            return res.json({ status: true });
        });
    }
    static getPublicInvitationInfo(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uuid = req.body.InvitationUuid;
            if (!uuid) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Invitation does not exist wrong request' });
            }
            const invitation = yield orms_1.Invitation.findOne({ where: { uuid: uuid },
                include: { model: orms_1.Seller, as: 'Seller' }, nest: true, raw: true });
            if (!invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Invitation does not exist' });
            }
            return res.json({ invitation: attributes_visibility_1.BuyerVisibility.adaptInvitationToBuyer(invitation) });
        });
    }
    static canValidateTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transaction = yield transaction_orm_1.Transaction.findOne({
                where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Buyer, as: 'Buyer' }, { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }], nest: true, raw: true
            });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction.state !== types_1.TransactionStatus.PAYED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'This transaction is not payed' });
            }
            if (transaction.activationKey !== req.body.activationKey) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Wrong activation key' });
            }
            return res.json({ transaction: attributes_visibility_1.AdminVisibility.adaptTransactionWithSellerToPublic(transaction) });
        });
    }
    static validateTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const transaction = yield transaction_orm_1.Transaction.findOne({
                where: { uuid: req.body.transactionUuid },
                include: [{ model: orms_1.Buyer, as: 'Buyer' }, { model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }], nest: true, raw: false
            });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction.state !== types_1.TransactionStatus.PAYED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'This transaction is not payed' });
            }
            if (transaction.activationKey !== req.body.activationKey) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Wrong activation key' });
            }
            yield transaction.update({ state: types_1.TransactionStatus.FULFILLED });
            return res.json({ transaction: attributes_visibility_1.AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({ plain: true })) });
        });
    }
}
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        InvitationUuid: joi_1.default.string().required(),
        deliveryWilaya: joi_1.default.string().valid(...wilayas_1.WILAYAS).required(),
        deliveryPlace: joi_1.default.string().required(),
    }))
], InvitationController, "createTransactionFromInvitation", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required()
    }))
], InvitationController, "payTheTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required()
    }))
], InvitationController, "closeTheTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
        reason: joi_1.default.string().required(),
        text: joi_1.default.string().required()
    }))
], InvitationController, "addBuyerClaim", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
        date: joi_1.default.date().min(new Date()).required(),
        deliveryPrice: joi_1.default.string().required()
    }))
], InvitationController, "acceptTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
    }))
], InvitationController, "rejectTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
        reason: joi_1.default.string().required(),
        text: joi_1.default.string().required()
    }))
], InvitationController, "addSellerClaim", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        InvitationUuid: joi_1.default.string().required(),
    }))
], InvitationController, "getPublicInvitationInfo", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
        activationKey: joi_1.default.string().required(),
    }))
], InvitationController, "canValidateTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required(),
        activationKey: joi_1.default.string().required(),
    }))
], InvitationController, "validateTransaction", null);
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitation.controller.js.map