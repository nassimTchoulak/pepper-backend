"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityStatus = exports.DeliveryType = exports.Gender = exports.TransactionOutcome = exports.FULFILLED_TO_BE_PAYED_LIST = exports.CANCELED_TO_BE_PAYED_LIST = exports.TransactionStatus = void 0;
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
var DeliveryType;
(function (DeliveryType) {
    DeliveryType["LOCAL_WILAYA_ONLY"] = "local-wilaya-only";
    DeliveryType["BETWEEN_WILAYAS"] = "between-wilayas";
    DeliveryType["PICK_FROM_SHOP"] = "pick-from-shop";
    DeliveryType["NOT_NEEDED"] = "not-needed";
})(DeliveryType = exports.DeliveryType || (exports.DeliveryType = {}));
;
var EntityStatus;
(function (EntityStatus) {
    EntityStatus["Pending"] = "pending";
    EntityStatus["Started"] = "started";
    EntityStatus["Accepted"] = "accepted";
    EntityStatus["Rejected"] = "rejected";
})(EntityStatus = exports.EntityStatus || (exports.EntityStatus = {}));
//# sourceMappingURL=types.js.map