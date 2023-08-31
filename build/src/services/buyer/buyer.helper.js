"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInvitations = void 0;
const tslib_1 = require("tslib");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const normalizeInvitations = (userParties) => {
    const normalizedInvitations = lodash_1.default.map(userParties, (party) => {
        return lodash_1.default.omit(party, ['createdAt', 'updatedAt', 'deletedAt']);
    });
    return normalizedInvitations;
};
exports.normalizeInvitations = normalizeInvitations;
//# sourceMappingURL=buyer.helper.js.map