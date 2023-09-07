"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const seller_route_1 = (0, tslib_1.__importDefault)(require("services/seller/seller.route"));
const buyer_route_1 = (0, tslib_1.__importDefault)(require("services/buyer/buyer.route"));
const invitation_route_1 = (0, tslib_1.__importDefault)(require("services/invitation/invitation.route"));
const proxy_route_1 = (0, tslib_1.__importDefault)(require("services/proxy/proxy.route"));
const admin_route_1 = (0, tslib_1.__importDefault)(require("services/admin/admin.route"));
const routes = express_1.default.Router();
routes.use('/seller', seller_route_1.default);
routes.use('/buyer', buyer_route_1.default);
routes.use('/invitation', invitation_route_1.default);
routes.use('/proxy', proxy_route_1.default);
routes.use('/admin', admin_route_1.default);
exports.default = routes;
//# sourceMappingURL=routes.js.map