"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.StoreStatus = exports.Gender = exports.TransactionOutcome = exports.FULFILLED_TO_BE_PAYED_LIST = exports.CANCELED_TO_BE_PAYED_LIST = exports.TransactionStatus = void 0;
;
;
;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["OPENED"] = "opened";
    TransactionStatus["ACCEPTED"] = "accepted";
    TransactionStatus["PAYED"] = "payed";
    TransactionStatus["FULFILLED"] = "fulfilled";
    TransactionStatus["FULFILLED_HOLD"] = "fulfilled-hold";
    TransactionStatus["FULFILLED_CONTINUE"] = "fulfilled-continue";
    TransactionStatus["CANCELED"] = "canceled";
    TransactionStatus["PAYED_BUYER_CANCEL_EARLY"] = "payed-buyer-cancel-early";
    TransactionStatus["PAYED_BUYER_CANCEL_MID"] = "payed-buyer-cancel-mid";
    TransactionStatus["PAYED_BUYER_CANCEL_LATE"] = "payed-buyer-cancel-late";
    TransactionStatus["PAYED_GHOSTED"] = "payed-ghosted";
    TransactionStatus["PAYED_SELLER_CANCEL"] = "payed-seller-cancel";
    TransactionStatus["PAYED_REIMBURSED"] = "payed-reimbursed";
    TransactionStatus["PAYED_COMPLEX_CANCEL"] = "payed-reimbursed-complex";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
exports.CANCELED_TO_BE_PAYED_LIST = [TransactionStatus.PAYED_BUYER_CANCEL_EARLY, TransactionStatus.PAYED_BUYER_CANCEL_LATE,
    TransactionStatus.PAYED_BUYER_CANCEL_MID, TransactionStatus.PAYED_GHOSTED, TransactionStatus.PAYED_REIMBURSED,
    TransactionStatus.PAYED_COMPLEX_CANCEL, TransactionStatus.PAYED_SELLER_CANCEL];
exports.FULFILLED_TO_BE_PAYED_LIST = [TransactionStatus.FULFILLED_CONTINUE, TransactionStatus.FULFILLED];
var TransactionOutcome;
(function (TransactionOutcome) {
    TransactionOutcome["CLOSED_FAILED"] = "closed-failed";
    TransactionOutcome["CLOSED_SUCCESS"] = "closed-success";
    TransactionOutcome["CANCELED"] = "canceled";
    TransactionOutcome["ONGOING"] = "ongoing";
})(TransactionOutcome = exports.TransactionOutcome || (exports.TransactionOutcome = {}));
var Gender;
(function (Gender) {
    Gender["MAN"] = "man";
    Gender["WOMAN"] = "woman";
})(Gender = exports.Gender || (exports.Gender = {}));
var StoreStatus;
(function (StoreStatus) {
    StoreStatus["Idle"] = "idle";
    StoreStatus["Pending"] = "pending";
    StoreStatus["Fulfilled"] = "fulfilled";
    StoreStatus["Rejected"] = "rejected";
})(StoreStatus = exports.StoreStatus || (exports.StoreStatus = {}));
;
var UserStatus;
(function (UserStatus) {
    UserStatus["Pending"] = "pending";
    UserStatus["Started"] = "started";
    UserStatus["Accepted"] = "accepted";
    UserStatus["Rejected"] = "rejected";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
//# sourceMappingURL=types.js.map