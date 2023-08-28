"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.StoreStatus = exports.Gender = exports.TransactionStatus = void 0;
;
;
;
;
;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["OPENED"] = "opened";
    TransactionStatus["CONFIRMED"] = "confirmed";
    TransactionStatus["PAYED"] = "payed";
    TransactionStatus["DONE"] = "done";
    TransactionStatus["CANCELED"] = "canceled";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
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