"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerVisibility = void 0;
const tslib_1 = require("tslib");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
class SellerVisibility {
    static AdaptSimpleInvitationToSeller(invitation) {
        return lodash_1.default.omit(invitation.get({ plain: true }), ["id", "deletedAt", "SellerId"]);
    }
    static adaptSimpleITransaction(transaction) {
        return lodash_1.default.omit(transaction, ["id", "BuyerId", "InvitationId", "deletedAt", "SellerId", "activationKey"]);
    }
    static AdaptInvitationTransactionToSeller(transaction) {
        const tmp = lodash_1.default.omit(transaction.get({ plain: true }), ["id", "deletedAt", "SellerId"]);
        tmp.InvitationTransactions = lodash_1.default.map(tmp.InvitationTransactions, (transaction) => {
            return this.adaptSimpleITransaction(transaction);
        });
        return tmp;
    }
    static AdaptListOfInvitationTransactionToSeller(invitation) {
        return lodash_1.default.map(invitation, (transaction) => {
            return this.AdaptInvitationTransactionToSeller(transaction);
        });
    }
    static AdaptSellerForSeller(seller) {
        return lodash_1.default.omit(seller, ['createdAt', 'updatedAt', 'deletedAt', 'password', 'emailCode']);
    }
    static AdaptSellerFullTransactionToSeller(transaction) {
        const tmp = lodash_1.default.omit(transaction, ["id", "BuyerId", "InvitationId", "deletedAt", "SellerId", "activationKey"]);
        tmp.Buyer = lodash_1.default.omit(tmp.Buyer, ['birthDay', 'password', 'id', 'deletedAt', 'createdAt', 'updatedAt', 'name']);
        tmp.Invitation = lodash_1.default.omit(tmp.Invitation, ["id", "deletedAt", "SellerId"]);
        return tmp;
    }
}
exports.SellerVisibility = SellerVisibility;
//# sourceMappingURL=attributes.visibility.js.map