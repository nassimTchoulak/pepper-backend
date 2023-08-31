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
        this._router.route('/').get(acl_1.authorizeForBuyer, (0, helpers_1.checkParametersAndCallRoute)(invitation_controller_1.InvitationController.getPartiesThatUserCanGoTo));
    }
}
exports.default = new PartyRoutes().build();
//# sourceMappingURL=invitation.route.js.map