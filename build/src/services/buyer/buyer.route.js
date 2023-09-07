"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const buyer_controller_1 = require("services/buyer/buyer.controller");
const helpers_1 = require("helpers/helpers");
const acl_1 = require("acls/acl");
class UserRoutes {
    constructor() {
        this._router = express_1.default.Router();
    }
    build() {
        this._assignRoute();
        return this._router;
    }
    _assignRoute() {
        this._router.route('/').get(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(buyer_controller_1.BuyerController.getBuyer));
        this._router.route('/').put(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(buyer_controller_1.BuyerController.updateBuyer));
        this._router.route('/login').get((0, helpers_1.checkParametersAndCallRoute)(buyer_controller_1.BuyerController.createLoginVerificationAndCheckIfUserExisits));
        this._router.route('/login').put((0, helpers_1.checkParametersAndCallRoute)(buyer_controller_1.BuyerController.subscribe));
        this._router.route('/login').patch(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(buyer_controller_1.BuyerController.validateEmail));
        this._router.route('/login').post((0, helpers_1.checkParametersAndCallRoute)(buyer_controller_1.BuyerController.login));
    }
}
exports.default = new UserRoutes().build();
//# sourceMappingURL=buyer.route.js.map