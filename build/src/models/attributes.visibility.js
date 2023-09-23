"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminVisibility = exports.BuyerVisibility = exports.SellerVisibility = void 0;
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
        return lodash_1.default.omit(seller, ['createdAt', 'updatedAt', 'deletedAt', 'password', 'emailCode', 'id']);
    }
    static AdaptSellerFullTransactionToSeller(transaction) {
        const tmp = lodash_1.default.omit(transaction, ["id", "BuyerId", "InvitationId", "deletedAt", "SellerId", "activationKey"]);
        tmp.Buyer = lodash_1.default.omit(tmp.Buyer, ['birthDay', 'password', 'id', 'deletedAt', 'createdAt', 'updatedAt', 'name', 'emailCode']);
        tmp.Invitation = lodash_1.default.omit(tmp.Invitation, ["id", "deletedAt", "SellerId"]);
        return tmp;
    }
}
exports.SellerVisibility = SellerVisibility;
class BuyerVisibility {
    static adaptBuyerToBuyer(buyer) {
        return lodash_1.default.omit(buyer, ['createdAt', 'updatedAt', 'deletedAt', 'password', 'emailCode', 'id']);
    }
    static adaptTransactionWithSellerToBuyer(transaction) {
        const tmp = lodash_1.default.omit(transaction, ['id', 'BuyerId', 'InvitationId']);
        tmp.Invitation = lodash_1.default.omit(tmp.Invitation, ['id', 'SellerId']);
        tmp.Invitation.Seller = lodash_1.default.omit(tmp.Invitation.Seller, ['id', 'password', 'emailCode', 'createdAt', 'updatedAt']);
        return tmp;
    }
    static adaptTransactionNoSellerToBuyer(transaction) {
        const tmp = lodash_1.default.omit(transaction, ['id', 'BuyerId', 'InvitationId']);
        tmp.Invitation = lodash_1.default.omit(tmp.Invitation, ['id', 'SellerId']);
        return tmp;
    }
    static adaptListOfTransactionWithSellerToBuyer(invitation) {
        return lodash_1.default.map(invitation, (transaction) => {
            return this.adaptTransactionWithSellerToBuyer(transaction);
        });
    }
    static adaptListOfTransactionNoSellerToBuyer(invitation) {
        return lodash_1.default.map(invitation, (transaction) => {
            return this.adaptTransactionNoSellerToBuyer(transaction);
        });
    }
    static adaptInvitationToBuyer(invitation) {
        const tmp = lodash_1.default.omit(invitation, ['id', 'SellerId']);
        tmp.Seller = lodash_1.default.omit(tmp.Seller, ['id', 'password', 'emailCode', 'createdAt', 'updatedAt']);
        return tmp;
    }
}
exports.BuyerVisibility = BuyerVisibility;
class AdminVisibility {
    static adaptTransactionWithSellerToPublic(transaction) {
        const tmp = lodash_1.default.omit(transaction, ['id', 'BuyerId', 'InvitationId']);
        tmp.Buyer = lodash_1.default.omit(tmp.Buyer, ['birthDay', 'password', 'id', 'deletedAt', 'createdAt', 'updatedAt', 'name', 'emailCode']);
        tmp.Invitation = lodash_1.default.omit(tmp.Invitation, ['id', 'SellerId']);
        tmp.Invitation.Seller = lodash_1.default.omit(tmp.Invitation.Seller, ['id', 'password', 'emailCode', 'createdAt', 'updatedAt']);
        return tmp;
    }
    static adaptTransactionsWithSellerToPublic(transactions) {
        return lodash_1.default.map(transactions, (transaction) => {
            return this.adaptTransactionWithSellerToPublic(transaction);
        });
    }
}
exports.AdminVisibility = AdminVisibility;
//# sourceMappingURL=attributes.visibility.js.map