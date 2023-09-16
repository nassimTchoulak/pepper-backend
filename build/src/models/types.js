"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.StoreStatus = exports.Gender = exports.TransactionOutcome = exports.TransactionStatus = void 0;
;
;
;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["OPENED"] = "opened";
    TransactionStatus["ACCEPTED"] = "accepted";
    TransactionStatus["PAYED"] = "payed";
    TransactionStatus["FULFILLED"] = "fulfilled";
    TransactionStatus["CANCELED"] = "canceled";
    TransactionStatus["CHANGED_MIND_EARLY"] = "changed-mind-early";
    TransactionStatus["CHANGED_MIND_LATE"] = "changed-mind-late";
    TransactionStatus["GHOSTED"] = "ghosted";
    TransactionStatus["SELLER_CANCEL"] = "seller-cancel";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
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