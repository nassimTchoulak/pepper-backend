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
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const seller_service_1 = require("services/seller/seller.service");
const sequelize_1 = require("sequelize");
;
class SellerController {
    static subscribe(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
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
                location: req.body.location,
                description: req.body.description,
                email: req.body.email
            });
            const organizer = yield orms_1.Seller.findOne({
                where: { email: req.body.email },
                attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'] },
                raw: true,
            });
            if (organizer === null) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller could not be created!' });
            }
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const token = jsonwebtoken_1.default.sign(organizer, process.env.JWT_KEY);
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
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const token = jsonwebtoken_1.default.sign(seller, process.env.JWT_KEY, { expiresIn: '5s' });
            return res.json({ token });
        });
    }
    static getSeller(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_KEY);
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'seller does not exist' });
            }
            return res.json({ seller: lodash_1.default.omit(seller, ['createdAt', 'updatedAt', 'deletedAt', 'password']) });
        });
    }
    static updateSeller(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const TokenSeller = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_KEY);
            yield orms_1.Seller.update(Object.assign({}, req.body), { where: { id: TokenSeller.id } });
            const seller = yield orms_1.Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
            console.log("@@", TokenSeller);
            return res.json({ seller: lodash_1.default.omit(seller, ['createdAt', 'updatedAt', 'deletedAt', 'password']) });
        });
    }
    static createNewInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const seller = yield orms_1.Seller.findOne({ where: { id: req.seller.id } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const invitation = yield orms_1.Invitation.create({
                product: req.body.product,
                date: req.body.date,
                price: req.body.price,
                instances: req.body.instances,
                delivery: req.body.delivery,
                description: req.body.description,
            });
            yield seller.addInvitation(invitation);
            const normalizedParties = yield seller_service_1.SellerService.getSellerInvitations(seller);
            return res.json({ invitations: normalizedParties });
        });
    }
    static getSellerInvitations(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const seller = yield orms_1.Seller.findOne({ where: { id: req.seller.id } });
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const invitations = yield seller_service_1.SellerService.getSellerInvitations(seller);
            return res.json({ parties: invitations });
        });
    }
    static deleteInvitation(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const seller = yield orms_1.Seller.findOne({ where: { id: req.seller.id } });
            const invitation = yield orms_1.Invitation.findByPk(req.body.invitationId);
            const invitationSeller = yield (invitation === null || invitation === void 0 ? void 0 : invitation.getSeller());
            if ((invitationSeller != undefined) && (invitation != null) && (invitationSeller.id == req.seller.id)) {
                yield invitation.destroy();
            }
            if (!seller) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            const remainingInvitations = yield seller_service_1.SellerService.getSellerInvitations(seller);
            return res.json({ invitations: remainingInvitations });
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
        description: joi_1.default.string().required(),
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
        name: joi_1.default.string().required(),
        firstName: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
        businessName: joi_1.default.string().required(),
        location: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
    }))
], SellerController, "updateSeller", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        product: joi_1.default.string().required(),
        date: joi_1.default.date().required(),
        price: joi_1.default.number().required(),
        instances: joi_1.default.number().required(),
        description: joi_1.default.string().required(),
        delivery: joi_1.default.string().required(),
    }))
], SellerController, "createNewInvitation", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], SellerController, "getSellerInvitations", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        invitationId: joi_1.default.number().required(),
    }))
], SellerController, "deleteInvitation", null);
exports.SellerController = SellerController;
//# sourceMappingURL=seller.controller.js.map