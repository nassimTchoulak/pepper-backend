"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationController = void 0;
const tslib_1 = require("tslib");
const joi_1 = (0, tslib_1.__importDefault)(require("joi"));
const helpers_1 = require("helpers/helpers");
const orms_1 = require("orms");
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
require("dotenv/config");
;
class InvitationController {
    static getPartiesThatUserCanGoTo(req, res) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield orms_1.Buyer.findOne({ where: { id: req.user.id } });
            user === null || user === void 0 ? void 0 : user.addInvitation();
            if (!user) {
                res.status(http_status_1.default.NOT_FOUND);
                return res.json({ message: 'User does not exist' });
            }
            return res.json({ parties: [] });
        });
    }
}
(0, tslib_1.__decorate)([
    (0, helpers_1.validation)(joi_1.default.object({}))
], InvitationController, "getPartiesThatUserCanGoTo", null);
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitation.controller.js.map