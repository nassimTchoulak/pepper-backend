"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeForAdmin = exports.authorizeForSeller = exports.authorizeForBuyer = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
require("dotenv/config");
const authorizeForBuyer = (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    let buyer;
    try {
        if (!process.env.JWT_BUYER_KEY) {
            throw 'JWT key not provided';
        }
        buyer = jsonwebtoken_1.default.verify(req.headers.authorization, process.env.JWT_BUYER_KEY);
        if (!(buyer === null || buyer === void 0 ? void 0 : buyer.id)) {
            throw 'Does not contain buyer';
        }
        req.user = buyer;
        next();
    }
    catch (e) {
        res.status(http_status_1.default.UNAUTHORIZED);
        res.json({
            message: `Invalid token: ${e}`,
        });
    }
});
exports.authorizeForBuyer = authorizeForBuyer;
const authorizeForSeller = (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    let seller;
    try {
        if (!process.env.JWT_SELLER_KEY) {
            throw 'JWT key not provided';
        }
        seller = jsonwebtoken_1.default.verify(req.headers.authorization, process.env.JWT_SELLER_KEY);
        if (!(seller === null || seller === void 0 ? void 0 : seller.id)) {
            throw 'Does not contain seller';
        }
        req.organizer = seller;
        next();
    }
    catch (e) {
        res.status(http_status_1.default.UNAUTHORIZED);
        res.json({
            message: `Invalid token: ${e}`,
        });
    }
});
exports.authorizeForSeller = authorizeForSeller;
const authorizeForAdmin = (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    if (!process.env.RSA_PUBLIC) {
        throw 'public key';
    }
    const publicKey = process.env.RSA_PUBLIC.replace(/\\n/g, '\n');
    try {
        if (!process.env.JWT_SELLER_KEY) {
            throw 'JWT key not provided';
        }
        const decoded = jsonwebtoken_1.default.verify(req.headers.authorization, publicKey, {
            algorithms: ['RS256'],
            issuer: 'application',
        });
        req.admin = decoded;
        next();
    }
    catch (e) {
        res.status(http_status_1.default.UNAUTHORIZED);
        res.json({
            message: `Invalid token: ${e}`,
        });
    }
});
exports.authorizeForAdmin = authorizeForAdmin;
//# sourceMappingURL=acl.js.map