"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerService = void 0;
const tslib_1 = require("tslib");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
class BuyerService {
    static cleanBuyerToSend(user) {
        return lodash_1.default.omit(user, ['createdAt', 'deletedAt', 'updatedAt', 'password', 'birthDay', 'emailCode']);
    }
}
exports.BuyerService = BuyerService;
//# sourceMappingURL=buyer.service.js.map