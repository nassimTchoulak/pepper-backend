export interface IInvitation {
  uuid: string,
  product: string,
  description: string,
  price: number,
  storeWilaya : string,
  storeLocation: string,
  deliveryType: DeliveryType,
  localDeliveryPrice: number,
  active: boolean,
  autoAccept: boolean,
  deliveryDelayHours: number,
  date: Date,
  createdAt: Date,
  updatedAt: Date,
};


export interface ITransaction {
  uuid: string,
  deliveryPlace: string,
  deliveryType: DeliveryType,
  deliveryPrice: number,
  deliveryDate: Date,
  state: TransactionStatus,
  outcome: TransactionOutcome,
  activationKey: string,
  paymentDate: Date,
  createdAt: Date,
  updatedAt: Date,
  certifiedDelivery: boolean,
  certifiedCompany: string
};

// Seller interfaces
export interface IInvitationTransaction extends IInvitation {
  InvitationTransactions: ITransaction[]
}

export interface ITransactionSellerSide extends ITransaction {
  Invitation: IInvitation,
  Buyer: IBuyerBase
}

// Buyer interfaces
export interface IInvitationComplete extends IInvitation {
  Seller: ISellerBase
}

export interface ITransactionWithSeller extends ITransaction {
  Invitation: IInvitationComplete
}

export interface ITransactionNoSeller extends ITransaction {
  Invitation: IInvitation
}

// admin interface
export interface IAdminTransaction extends ITransaction {
  Invitation: IInvitationComplete,
  Buyer: IBuyerBase
}

export interface IAdminFullTransaction extends IAdminTransaction {
  Claims: IClaim[],
  History: IHistory[]
}

export interface IClaim {
  id: number,
  sender: string,
  reason: string,
  text: string,
  createdAt: Date
}
export interface IHistory {
  id: number,
  action: string,
  actionType: string,
  reason: string,
  createdAt: Date
}

export interface IBuyerBase {
  id: number,
  name: string,
  firstName: string,
  birthDay: Date,
  gender: Gender,
  phoneNumber: string,
  wilaya: string;
  address: string,
  status: EntityStatus,
  email: string,
}

export interface ISellerBase {
  id: number,
  name: string,
  phoneNumber: string,
  email: string,
  firstName: string,
  businessName: string,
  location: string,
  wilaya: string
  description: string,
  status: EntityStatus
}


// TO-DO: remove IBuyer & ISeller
export interface IBuyer extends IBuyerBase {
  transactions: ITransaction[],
};

export interface ISeller extends ISellerBase {
  invitations : IInvitation[],
  transactions: ITransactionSellerSide[]
}


export enum TransactionStatus {
  // initiated by the Buyer
  OPENED = 'opened',
  // accepted by the seller
  ACCEPTED = 'accepted',
  // payed by the buyer
  PAYED = 'payed',
  // validated by the seller -> to be sent
  FULFILLED = 'fulfilled',
  // validated but with reserve | activated when claim is submitted after validation
  FULFILLED_HOLD = 'fulfilled-hold',
  // decision : the hold is lifted no more claims
  FULFILLED_CONTINUE = 'fulfilled-continue',
  // canceled no process
  CANCELED = 'canceled',
  // cancel directly by buyer change mind
  PAYED_BUYER_CANCEL_EARLY = 'payed-buyer-cancel-early',
  PAYED_BUYER_CANCEL_MID = 'payed-buyer-cancel-mid',
  // decision + state of cancelation
  PAYED_BUYER_CANCEL_LATE = 'payed-buyer-cancel-late',
  // decision : buyer did not show up
  PAYED_GHOSTED = 'payed-ghosted',
  // decision : seller requested the cancelation
  PAYED_SELLER_CANCEL ='payed-seller-cancel',
  // decision
  PAYED_REIMBURSED = 'payed-reimbursed',
  // decision
  PAYED_COMPLEX_CANCEL = 'payed-reimbursed-complex',
  
}

export const CANCELED_TO_BE_PAYED_LIST = [TransactionStatus.PAYED_BUYER_CANCEL_EARLY, TransactionStatus.PAYED_BUYER_CANCEL_LATE,
  TransactionStatus.PAYED_BUYER_CANCEL_MID, TransactionStatus.PAYED_GHOSTED, TransactionStatus.PAYED_REIMBURSED,
  TransactionStatus.PAYED_COMPLEX_CANCEL, TransactionStatus.PAYED_SELLER_CANCEL]

export const FULFILLED_TO_BE_PAYED_LIST = [TransactionStatus.FULFILLED_CONTINUE , TransactionStatus.FULFILLED]

export enum TransactionOutcome {
  CLOSED_FAILED = 'closed-failed',
  CLOSED_SUCCESS = 'closed-success',
  CANCELED = 'canceled',
  ONGOING = 'ongoing'
}

export enum Gender {
  MAN = 'man',
  WOMAN = 'woman'
}

export enum DeliveryType {
  LOCAL_WILAYA_ONLY = 'local-wilaya-only',
  BETWEEN_WILAYAS = 'between-wilayas',
  PICK_FROM_SHOP = 'pick-from-shop',
  NOT_NEEDED = 'not-needed',
};


export enum EntityStatus {
  Pending = 'pending',
  Started = 'started',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

