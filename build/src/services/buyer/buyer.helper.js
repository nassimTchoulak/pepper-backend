"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInvitations = void 0;
const tslib_1 = require("tslib");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
const normalizeInvitations = (userParties) => {
    let normalizedInvitations = lodash_1.default.map(userParties, (invitation) => {
        return lodash_1.default.omit(invitation, ['updatedAt', 'deletedAt']);
    });
    normalizedInvitations = lodash_1.default.filter(normalizedInvitations, (o) => { return o.uuid != undefined; });
    return normalizedInvitations;
};
exports.normalizeInvitations = normalizeInvitations;
//# sourceMappingURL=buyer.helper.js.map