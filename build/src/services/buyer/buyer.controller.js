"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerController = void 0;
const tslib_1 = require("tslib");
const joi_1 = (0, tslib_1.__importDefault)(require("joi"));
const helpers_1 = require("helpers/helpers");
const orms_1 = require("orms");
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const types_1 = require("models/types");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
require("dotenv/config");
const auth_1 = (0, tslib_1.__importDefault)(require("helpers/auth"));
;
class BuyerController {
    static createLoginVerificationAndCheckIfUserExisits(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield orms_1.Buyer.findOne({ where: { phoneNumber: req.query.phoneNumber }, raw: true });
            yield auth_1.default.createVerification(req.query.phoneNumber);
            return res.json({ userExists: !!user });
        });
    }
    static subscribe(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const isVerified = yield auth_1.default.checkVerification(req.body.phoneNumber, req.body.code);
            if (!isVerified) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Verification code not valid' });
            }
            yield orms_1.Buyer.create({
                name: req.body.name,
                gender: req.body.gender,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                description: req.body.description,
            });
            const user = yield orms_1.Buyer.findOne({ where: { phoneNumber: req.body.phoneNumber }, raw: true });
            if (!user) {
                res.status(http_status_1.default.INTERNAL_SERVER_ERROR);
                return res.json({ message: 'User could not be created!' });
            }
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_KEY);
            return res.json({ token });
        });
    }
    static login(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield orms_1.Buyer.findOne({ where: { phoneNumber: req.body.phoneNumber }, raw: true });
            if (!user) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'User does not exist' });
            }
            const isVerified = yield auth_1.default.checkVerification(req.body.phoneNumber, req.body.code);
            if (!isVerified) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Verification code not valid' });
            }
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_KEY);
            return res.json({ token });
        });
    }
    static getBuyer(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield orms_1.Buyer.findOne({ where: { id: req.user.id }, raw: true });
            if (!user) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            return res.json({ user: lodash_1.default.omit(user, ['createdAt', 'updatedAt', 'deletedAt']) });
        });
    }
    static updateBuyer(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield orms_1.Buyer.update(Object.assign({}, req.body), { where: { id: req.user.id } });
            const user = yield orms_1.Buyer.findOne({ where: { id: req.user.id }, raw: true });
            return res.json({ user: lodash_1.default.omit(user, ['createdAt', 'updatedAt', 'deletedAt']) });
        });
    }
}
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        phoneNumber: joi_1.default.string().required(),
    }))
], BuyerController, "createLoginVerificationAndCheckIfUserExisits", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        phoneNumber: joi_1.default.string().required(),
        email: joi_1.default.string().required(),
        code: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
        firstName: joi_1.default.string().required(),
        gender: joi_1.default.string().valid(...Object.values(types_1.Gender)).required(),
        address: joi_1.default.string().optional(),
        description: joi_1.default.string().optional(),
    }))
], BuyerController, "subscribe", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        phoneNumber: joi_1.default.string().required(),
        code: joi_1.default.string().required(),
    }))
], BuyerController, "login", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], BuyerController, "getBuyer", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        address: joi_1.default.string().optional(),
        description: joi_1.default.string().optional(),
        name: joi_1.default.string().optional(),
        firstName: joi_1.default.string().optional(),
    }))
], BuyerController, "updateBuyer", null);
exports.BuyerController = BuyerController;
//# sourceMappingURL=buyer.controller.js.map