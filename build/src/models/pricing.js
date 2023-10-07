"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
function priceCalculator(transaction) {
    const total_price = (transaction.deliveryPrice + transaction.Invitation.price);
    const total_commissioned_input_money = (transaction.deliveryPrice + transaction.Invitation.price) * 1.015;
    let delivery_return = 0;
    if (transaction.certifiedDelivery) {
        delivery_return = transaction.deliveryPrice;
    }
    switch (transaction.state) {
        case types_1.TransactionStatus.PAYED_GHOSTED: {
            return {
                commission_money: total_commissioned_input_money - transaction.Invitation.price - delivery_return,
                buyer_money: transaction.Invitation.price,
                seller_money: delivery_return,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.PAYED_BUYER_CANCEL_LATE: {
            return {
                commission_money: total_commissioned_input_money - transaction.Invitation.price - delivery_return,
                buyer_money: transaction.Invitation.price,
                seller_money: delivery_return,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.PAYED_BUYER_CANCEL_MID: {
            return {
                commission_money: total_commissioned_input_money - total_price,
                buyer_money: total_price,
                seller_money: 0,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.PAYED_BUYER_CANCEL_EARLY: {
            return {
                commission_money: total_commissioned_input_money - total_price,
                buyer_money: total_price,
                seller_money: 0,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.PAYED_REIMBURSED: {
            return {
                commission_money: total_commissioned_input_money - total_price,
                buyer_money: total_price,
                seller_money: 0,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.PAYED_SELLER_CANCEL: {
            return {
                commission_money: total_commissioned_input_money - total_price,
                buyer_money: total_price,
                seller_money: 0,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.PAYED_COMPLEX_CANCEL: {
            return {
                commission_money: total_commissioned_input_money - total_price,
                buyer_money: total_price,
                seller_money: 0,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.FULFILLED: {
            return {
                commission_money: total_commissioned_input_money - total_price * 0.98,
                buyer_money: 0,
                seller_money: total_price * 0.98,
                payed_money: total_commissioned_input_money
            };
        }
        case types_1.TransactionStatus.FULFILLED_CONTINUE: {
            return {
                commission_money: total_commissioned_input_money - total_price * 0.98,
                buyer_money: 0,
                seller_money: total_price * 0.98,
                payed_money: total_commissioned_input_money
            };
        }
    }
    return {
        commission_money: 0,
        buyer_money: 0,
        seller_money: 0,
        payed_money: 0
    };
}
exports.default = priceCalculator;
//# sourceMappingURL=pricing.js.map