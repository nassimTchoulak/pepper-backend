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
;
class InvitationController {
    static createTransactionFromInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const invitation = yield orms_1.Invitation.findOne({ where: { uuid: req.body.InvitationUuid } });
            if (!invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'invitation does not exist' });
            }
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const buyer_token = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_KEY);
            const buyer = yield orms_1.Buyer.findOne({ where: { id: buyer_token.id }, raw: false });
            if (!buyer) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'buyer does not exist' });
            }
            const transactionInfo = {
                InvitationId: invitation.id,
                BuyerId: buyer.id,
                delivery: req.body.delivery,
                uuid: (0, helpers_1.transactionUUid)()
            };
            yield transaction_orm_1.Transaction.create(transactionInfo);
            const transaction = yield transaction_orm_1.Transaction.findOne({
                where: { uuid: transactionInfo.uuid },
                include: [{ model: orms_1.Invitation, as: 'Invitation', include: [{ model: orms_1.Seller, as: 'Seller' }] }], nest: true, raw: true
            });
            return res.json({ transaction: Object.assign({}, transaction) });
        });
    }
    static payTheTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uuid = req.body.uuid;
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const buyer_token = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_KEY);
            const transaction = yield transaction_orm_1.Transaction.findOne({ where: { uuid: uuid, BuyerId: buyer_token.id } });
            if (!transaction) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'transaction does not exist' });
            }
            if (transaction.state !== types_1.TransactionStatus.ACCEPTED) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Cant pay a transaction that is not in accepted state' });
            }
            const result = yield transaction.update({ state: types_1.TransactionStatus.PAYED });
            return res.json({ transaction: result.get({ plain: true }) });
        });
    }
    static getPublicInvitationInfo(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uuid = req.params.uuid;
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
            return res.json({ invitation });
        });
    }
}
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        InvitationUuid: joi_1.default.string().required(),
        delivery: joi_1.default.string().required(),
    }))
], InvitationController, "createTransactionFromInvitation", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        transactionUuid: joi_1.default.string().required()
    }))
], InvitationController, "payTheTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], InvitationController, "getPublicInvitationInfo", null);
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitation.controller.js.map