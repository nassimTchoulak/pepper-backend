"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const admin_controller_1 = require("services/admin/admin.controller");
const helpers_1 = require("helpers/helpers");
const acl_1 = require("acls/acl");
class AdminRoutes {
    constructor() {
        this._router = express_1.default.Router();
    }
    build() {
        this._assignRoute();
        return this._router;
    }
    _assignRoute() {
        this._router.route('/').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/ongoing_claims').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.getOngoingClaims));
        this._router.route('/ongoing_payed_canceled').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.getOngoingPayedCanceled));
        this._router.route('/ongoing_fulfilled').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.getOngoingPayedFulfilled));
        this._router.route('/decide/ghosting').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/decide/change_mind_late').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/decide/seller_canceled').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/decide/reimburse').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/decide/reimburse_complex').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/decide/fulfilled').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/close').post(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/seller_history').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/buyer_history').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/transaction').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
        this._router.route('/actions').get(acl_1.authorizeForAdmin, (0, helpers_1.checkParametersAndCallRoute)(admin_controller_1.AdminController.dummyMethod));
    }
}
exports.default = new AdminRoutes().build();
//# sourceMappingURL=admin.route.js.map