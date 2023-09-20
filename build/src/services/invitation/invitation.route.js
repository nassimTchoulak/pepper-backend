"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const invitation_controller_1 = require("services/invitation/invitation.controller");
const helpers_1 = require("helpers/helpers");
const acl_1 = require("acls/acl");
class PartyRoutes {
    constructor() {
        this._router = express_1.default.Router();
    }
    build() {
        this._assignRoute();
        return this._router;
    }
    _assignRoute() {
        this._router.route('/create').post(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.createTransactionFromInvitation));
        this._router.route('/pay').post(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.payTheTransaction));
        this._router.route('/cancel').post(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.closeTheTransaction));
        this._router.route('/buyer_claim').post(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.addBuyerClaim));
        this._router.route('/accept').post(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.acceptTransaction));
        this._router.route('/refuse').post(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.rejectTransaction));
        this._router.route('/seller_claim').post(acl_1.authorizeForSeller, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.addSellerClaim));
        this._router.route('/').get((0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.getPublicInvitationInfo));
        this._router.route('/fulfill').get((0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.canValidateTransaction));
        this._router.route('/fulfill').post((0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.validateTransaction));
    }
}
exports.default = new PartyRoutes().build();
//# sourceMappingURL=invitation.route.js.map