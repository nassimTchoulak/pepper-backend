"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
function priceCalculator(status) {
    let commission_rate = 0;
    let buyer_rate = 0;
    let seller_rate = 0;
    switch (status) {
        case types_1.TransactionStatus.PAYED_GHOSTED: {
            commission_rate = 0.02;
            buyer_rate = 0.97;
            seller_rate = 0.01;
            break;
        }
        case types_1.TransactionStatus.PAYED_BUYER_CANCEL_LATE: {
            commission_rate = 0.02;
            buyer_rate = 0.97;
            seller_rate = 0.01;
            break;
        }
        case types_1.TransactionStatus.PAYED_BUYER_CANCEL_MID: {
            commission_rate = 0.02;
            buyer_rate = 0.97;
            seller_rate = 0.01;
            break;
        }
        case types_1.TransactionStatus.PAYED_BUYER_CANCEL_EARLY: {
            commission_rate = 0.02;
            buyer_rate = 0.97;
            seller_rate = 0.01;
            break;
        }
        case types_1.TransactionStatus.PAYED_REIMBURSED: {
            commission_rate = 0.0;
            buyer_rate = 1;
            seller_rate = 0.0;
            break;
        }
        case types_1.TransactionStatus.PAYED_SELLER_CANCEL: {
            commission_rate = 0.0;
            buyer_rate = 1;
            seller_rate = 0.0;
            break;
        }
        case types_1.TransactionStatus.PAYED_COMPLEX_CANCEL: {
            commission_rate = 0.01;
            buyer_rate = 0.99;
            seller_rate = 0.0;
            break;
        }
        case types_1.TransactionStatus.FULFILLED: {
            commission_rate = 0.037;
            buyer_rate = 0.00;
            seller_rate = 0.963;
            break;
        }
        case types_1.TransactionStatus.FULFILLED_CONTINUE: {
            commission_rate = 0.037;
            buyer_rate = 0.00;
            seller_rate = 0.963;
            break;
        }
    }
    return {
        commission: (price) => { return price * commission_rate; },
        buyer: (price) => { return price * buyer_rate; },
        seller: (price) => { return price * seller_rate; },
    };
}
exports.default = priceCalculator;
//# sourceMappingURL=pricing.js.map