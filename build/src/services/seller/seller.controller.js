"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerController = void 0;
const tslib_1 = require("tslib");
const joi_1 = (0, tslib_1.__importDefault)(require("joi"));
const helpers_1 = require("helpers/helpers");
const orms_1 = require("orms");
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const types_1 = require("models/types");
require("dotenv/config");
const sequelize_1 = require("sequelize");
const mailer_1 = require("services/mailer/mailer");
const auth_1 = (0, tslib_1.__importDefault)(require("helpers/auth"));
const transaction_orm_1 = require("orms/transaction.orm");
const attributes_visibility_1 = require("models/attributes.visibility");
const wilayas_1 = require("models/wilayas");
;
class SellerController {
    static subscribe(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const isVerified = yield auth_1.default.checkVerification(req.body.phoneNumber, req.body.code);
            if (!isVerified) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Verification code not valid' });
            }
            const organizerTest = yield orms_1.Seller.findOne({ where: { [sequelize_1.Op.or]: [
                        { phoneNumber: req.body.phoneNumber },
                        { email: req.body.email }
                    ] }, raw: true });
            if (organizerTest !== null) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'phoneNumber or email already exists' });
            }
            yield orms_1.Seller.create({
                name: req.body.name,
                firstName: req.body.firstName,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                businessName: req.body.businessName,
                wilaya: req.body.wilaya,
                location: req.body.location,
                description: req.body.description,
                email: req.body.email
            });
            const seller = yield orms_1.Seller.findOne({
                where: { email: req.body.email },
                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
                raw: true,
            });
            if (seller === null) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller could not be created!' });
            }
            (0, mailer_1.sendEmailVerificationCodeSeller)(seller.email, seller.emailCode, seller.firstName);
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const token = jsonwebtoken_1.default.sign(seller, process.env.JWT_SELLER_KEY, { expiresIn: '24h' });
            return res.json({ token });
        });
    }
    static login(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const seller = yield orms_1.Seller.findOne({ where: { email: req.body.email, password: req.body.password }, raw: true });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller does not exist' });
            }
            const isAuthorized = seller.status !== types_1.UserStatus.Rejected;
            if (!isAuthorized) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'seller removed' });
            }
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const token = jsonwebtoken_1.default.sign(seller, process.env.JWT_SELLER_KEY, { expiresIn: '24h' });
            return res.json({ token });
        });
    }
    static getSeller(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller does not exist' });
            }
            return res.json({ seller: attributes_visibility_1.SellerVisibility.AdaptSellerForSeller(seller) });
        });
    }
    static updateSeller(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            yield orms_1.Seller.update(Object.assign({}, req.body), { where: { id: TokenSeller.id } });
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller does not exist' });
            }
            return res.json({ seller: attributes_visibility_1.SellerVisibility.AdaptSellerForSeller(seller) });
        });
    }
    static validateSellerEmail(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const user = yield orms_1.Seller.findOne({ where: { email: TokenSeller.email }, raw: false });
            if (!user) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            if (user.emailCode !== parseInt(req.body.emailCode)) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'wrong code' });
            }
            user.update({ status: types_1.UserStatus.Accepted });
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const user_data = user.get({ plain: true });
            const token = jsonwebtoken_1.default.sign(user_data, process.env.JWT_SELLER_KEY);
            return res.json({ token });
        });
    }
    static createNewInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id }, raw: false });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const invitation = yield orms_1.Invitation.create({
                product: req.body.product,
                date: req.body.date,
                price: req.body.price,
                description: req.body.description,
                storeWilaya: req.body.storeWilaya,
                storeLocation: req.body.storeLocation,
                deliveryType: req.body.deliveryType,
                localDeliveryPrice: req.body.localDeliveryPrice,
            });
            yield seller.addInvitation(invitation);
            return res.json({ invitation: attributes_visibility_1.SellerVisibility.AdaptSimpleInvitationToSeller(invitation) });
        });
    }
    static getSellerInvitations(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const invitations = yield orms_1.Invitation.findAll({
                include: [
                    { model: transaction_orm_1.Transaction, as: 'InvitationTransactions' },
                    { model: transaction_orm_1.Transaction, as: 'InvitationTransactions', paranoid: true, required: false }
                ],
                where: {
                    SellerId: TokenSeller.id
                }
            });
            return res.json({ invitations: attributes_visibility_1.SellerVisibility.AdaptListOfInvitationTransactionToSeller(invitations) });
        });
    }
    static getSellerOneInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const invitation = yield orms_1.Invitation.findOne({
                include: [
                    { model: transaction_orm_1.Transaction, as: 'InvitationTransactions' },
                    { model: transaction_orm_1.Transaction, as: 'InvitationTransactions', paranoid: true, required: false }
                ],
                where: {
                    uuid: req.body.uuid,
                    SellerId: TokenSeller.id
                }
            });
            if (!invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Invitation not found for Seller' });
            }
            return res.json({ invitation: attributes_visibility_1.SellerVisibility.AdaptInvitationTransactionToSeller(invitation) });
        });
    }
    static getSellerOneTransaction(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const transaction_invitation = yield transaction_orm_1.Transaction.findOne({ where: { uuid: req.body.uuid },
                include: [{ model: orms_1.Invitation, as: 'Invitation' }, { model: orms_1.Buyer, as: 'Buyer' }], nest: true, raw: true });
            if (!transaction_invitation) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'Transaction not found' });
            }
            if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Transaction can only be accessed by it\'s seller ' });
            }
            const casted_transaction = transaction_invitation;
            return res.json({ transaction: attributes_visibility_1.SellerVisibility.AdaptSellerFullTransactionToSeller(casted_transaction) });
        });
    }
    static deleteInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller does not exist' });
            }
            const invitation = yield orms_1.Invitation.findOne({ where: { uuid: req.body.uuid } });
            const invitationSeller = yield (invitation === null || invitation === void 0 ? void 0 : invitation.getSeller());
            if ((invitationSeller != null) && (invitation != null) && (invitationSeller.id == seller.id)) {
                const result = yield invitation.update({ active: false });
                return res.json({ invitation: attributes_visibility_1.SellerVisibility.AdaptSimpleInvitationToSeller(result) });
            }
            else {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'No matching invitation found' });
            }
        });
    }
}
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        name: joi_1.default.string().required(),
        firstName: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
        phoneNumber: joi_1.default.string().required(),
        email: joi_1.default.string().required(),
        businessName: joi_1.default.string().required(),
        location: joi_1.default.string().required(),
        wilaya: joi_1.default.string().valid(...wilayas_1.WILAYAS).required(),
        description: joi_1.default.string().required(),
        code: joi_1.default.string().required()
    }))
], SellerController, "subscribe", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        email: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
    }))
], SellerController, "login", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], SellerController, "getSeller", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        name: joi_1.default.string().optional(),
        firstName: joi_1.default.string().optional(),
        password: joi_1.default.string().optional(),
        businessName: joi_1.default.string().optional(),
        location: joi_1.default.string().optional(),
        wilaya: joi_1.default.string().valid(...wilayas_1.WILAYAS).optional(),
        description: joi_1.default.string().optional(),
    }))
], SellerController, "updateSeller", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        emailCode: joi_1.default.number().required()
    }))
], SellerController, "validateSellerEmail", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        product: joi_1.default.string().required(),
        date: joi_1.default.date().required(),
        price: joi_1.default.number().required(),
        description: joi_1.default.string().required(),
        storeWilaya: joi_1.default.string().valid(...wilayas_1.WILAYAS).required(),
        storeLocation: joi_1.default.string().required(),
        deliveryType: joi_1.default.string().valid(...Object.values(types_1.DeliveryType)).required(),
        localDeliveryPrice: joi_1.default.number().required(),
    }))
], SellerController, "createNewInvitation", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], SellerController, "getSellerInvitations", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        uuid: joi_1.default.string().required()
    }))
], SellerController, "getSellerOneInvitation", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        uuid: joi_1.default.string().required()
    }))
], SellerController, "getSellerOneTransaction", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        uuid: joi_1.default.string().required(),
    }))
], SellerController, "deleteInvitation", null);
exports.SellerController = SellerController;
//# sourceMappingURL=seller.controller.js.map