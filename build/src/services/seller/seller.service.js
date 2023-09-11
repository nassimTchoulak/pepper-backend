"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerService = void 0;
const tslib_1 = require("tslib");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const buyer_helper_1 = require("services/buyer/buyer.helper");
class SellerService {
    static getSellerInvitations(seller) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const invitations = yield seller.getInvitations({ order: [['createdAt', 'DESC']], raw: true });
            const normalizedParties = (0, buyer_helper_1.normalizeInvitations)(invitations);
            return normalizedParties;
        });
    }
    static cleanSellerToSend(user) {
        return lodash_1.default.omit(user, ['createdAt', 'deletedAt', 'updatedAt', 'password', 'birthDay', 'emailCode']);
    }
}
exports.SellerService = SellerService;
//# sourceMappingURL=seller.service.js.map