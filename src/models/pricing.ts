import { TransactionStatus } from "./types";



export default function priceCalculator(status: TransactionStatus) : { 
  commission: (price : number)=>number,
  buyer: (price : number)=>number,
  seller: (price : number)=>number 
}
{
  let commission_rate = 0;
  let buyer_rate = 0;
  let seller_rate = 0;

  switch(status) { 
    case TransactionStatus.PAYED_GHOSTED: { 
      //statements; 
      commission_rate = 0.02;
      buyer_rate = 0.97;
      seller_rate = 0.01;
      break; 
    } 
    case TransactionStatus.PAYED_BUYER_CANCEL_LATE: { 
      //statements; 
      commission_rate = 0.02;
      buyer_rate = 0.97;
      seller_rate = 0.01;
      break; 
    }
    case TransactionStatus.PAYED_BUYER_CANCEL_MID: { 
      //statements; 
      commission_rate = 0.02;
      buyer_rate = 0.97;
      seller_rate = 0.01;
      break; 
    }
    case TransactionStatus.PAYED_BUYER_CANCEL_EARLY: { 
      //statements; 
      commission_rate = 0.02;
      buyer_rate = 0.97;
      seller_rate = 0.01;
      break; 
    }
    case TransactionStatus.PAYED_REIMBURSED: { 
      //statements; 
      commission_rate = 0.0;
      buyer_rate = 1;
      seller_rate = 0.0;
      break; 
    }
    case TransactionStatus.PAYED_SELLER_CANCEL: { 
      //statements;
      commission_rate = 0.0;
      buyer_rate = 1;
      seller_rate = 0.0; 
      break; 
    }
    case TransactionStatus.PAYED_COMPLEX_CANCEL: { 
      //statements; 
      commission_rate = 0.01;
      buyer_rate = 0.99;
      seller_rate = 0.0;
      break; 
    }
    case TransactionStatus.FULFILLED: { 
      //statements; 
      commission_rate = 0.037;
      buyer_rate = 0.00;
      seller_rate = 0.963;
      break; 
    }
    case TransactionStatus.FULFILLED_CONTINUE: { 
      //statements;
      commission_rate = 0.037;
      buyer_rate = 0.00;
      seller_rate = 0.963;
      break; 
    }
  } 
  return { 
    commission: (price : number)=>{ return price * commission_rate},
    buyer: (price : number)=>{ return price * buyer_rate},
    seller: (price : number)=>{ return price * seller_rate},
  }
}