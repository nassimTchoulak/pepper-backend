"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const seller_controller_1 = require("services/seller/seller.controller");
const helpers_1 = require("helpers/helpers");
const acl_1 = require("acls/acl");
class SellerRoutes {
    constructor() {
        this._router = express_1.default.Router();
    }
    build() {
        this._assignRoute();
        return this._router;
    }
    _assignRoute() {
        this._router.route('/').get(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.getSeller));
        this._router.route('/').put(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.updateSeller));
        this._router.route('/login').put((0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.subscribe));
        this._router.route('/login').post((0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.login));
        this._router.route('/invitation').post(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.createNewInvitation));
        this._router.route('/invitation').get(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.getSellerInvitations));
        this._router.route('/invitation').delete(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(seller_controller_1.SellerController.deleteInvitation));
    }
}
exports.default = new SellerRoutes().build();
//# sourceMappingURL=seller.route.js.map