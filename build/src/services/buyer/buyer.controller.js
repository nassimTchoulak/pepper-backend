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
const sequelize_1 = require("sequelize");
const mailer_1 = require("services/mailer/mailer");
;
class BuyerController {
    static createLoginVerificationAndCheckIfUserExisits(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield orms_1.Buyer.findOne({ where: { [sequelize_1.Op.or]: [
                        { phoneNumber: req.body.phoneNumber },
                        { email: req.body.email }
                    ] }, raw: true });
            yield auth_1.default.createVerification(req.query.phoneNumber);
            return res.json({ userExists: !!user });
        });
    }
    static subscribe(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const isVerified = yield auth_1.default.checkVerification(req.body.phoneNumber, req.body.code);
            const buyerTest = yield orms_1.Buyer.findOne({ where: { [sequelize_1.Op.or]: [
                        { phoneNumber: req.body.phoneNumber },
                        { email: req.body.email }
                    ] }, raw: true });
            if (buyerTest !== null) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'phoneNumber or email already exists' });
            }
            if (!isVerified) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'Verification code not valid' });
            }
            yield orms_1.Buyer.create({
                email: req.body.email,
                name: req.body.name,
                firstName: req.body.firstName,
                password: req.body.password,
                birthDay: req.body.birthDay,
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
            (0, mailer_1.sendEmailVerificationCode)(user.email, user.emailCode, user.firstName);
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_KEY, { expiresIn: "24h" });
            return res.json({ token });
        });
    }
    static login(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield orms_1.Buyer.findOne({ where: { [sequelize_1.Op.or]: [
                        { phoneNumber: req.body.phoneNumber },
                        { email: req.body.email }
                    ] }, raw: true });
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            if (user === null) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'User does not exist' });
            }
            if (user.status !== types_1.UserStatus.Accepted) {
                const token = jsonwebtoken_1.default.sign(user, process.env.JWT_KEY, { expiresIn: "600s" });
                return res.json({ token });
            }
            const token = jsonwebtoken_1.default.sign(user, process.env.JWT_KEY, { expiresIn: "24h" });
            return res.json({ token });
        });
    }
    static validateEmail(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const buyer = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_KEY);
            if (buyer.status != types_1.UserStatus.Pending) {
                return res.json({ token: req.headers.authorization || "" });
            }
            const user = yield orms_1.Buyer.findOne({ where: { email: buyer.email }, raw: false });
            if (!user) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            if (user.emailCode !== parseInt(req.body.emailCode)) {
                res.status(http_status_1.default.UNAUTHORIZED);
                return res.json({ message: 'wrong code' });
            }
            user.update({ status: types_1.UserStatus.Accepted });
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const user_data = user.get({ plain: true });
            const token = jsonwebtoken_1.default.sign(user_data, process.env.JWT_KEY);
            return res.json({ token });
        });
    }
    static getBuyer(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const buyer = jsonwebtoken_1.default.verify(req.headers.authorization || "", process.env.JWT_KEY);
            const user = yield orms_1.Buyer.findOne({ where: { email: buyer.email }, raw: true });
            if (!user) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            return res.json({ user: lodash_1.default.omit(user, ['createdAt', 'updatedAt', 'deletedAt', 'emailCode']) });
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
        email: joi_1.default.string().required(),
    }))
], BuyerController, "createLoginVerificationAndCheckIfUserExisits", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        phoneNumber: joi_1.default.string().required(),
        email: joi_1.default.string().required(),
        code: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
        firstName: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
        birthDay: joi_1.default.date().required(),
        gender: joi_1.default.string().valid(...Object.values(types_1.Gender)).required(),
        address: joi_1.default.string().optional(),
        description: joi_1.default.string().optional(),
    }))
], BuyerController, "subscribe", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        email: joi_1.default.string().required().allow(''),
        phoneNumber: joi_1.default.string().required().allow(''),
        password: joi_1.default.string().required(),
    }))
], BuyerController, "login", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        emailCode: joi_1.default.number().required()
    }))
], BuyerController, "validateEmail", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], BuyerController, "getBuyer", null);
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({
        address: joi_1.default.string().optional(),
        description: joi_1.default.string().optional(),
        name: joi_1.default.string().optional(),
        firstName: joi_1.default.string().optional(),
        birthday: joi_1.default.date().optional(),
        password: joi_1.default.string().optional(),
    }))
], BuyerController, "updateBuyer", null);
exports.BuyerController = BuyerController;
//# sourceMappingURL=buyer.controller.js.map