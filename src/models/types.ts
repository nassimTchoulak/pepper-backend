export interface IInvitation {
  uuid: string,
  product: string,
  description: string,
  price: number,
  instances: number,
  delivery: string,
  active: boolean,
  date: Date,
  createdAt: Date,
  updatedAt: Date,
  autoAccept: boolean
};


export interface ITransaction {
  uuid: string
  delivery: string,
  state: TransactionStatus,
  outcome: TransactionOutcome,
  activationKey: string,
  paymentDate: Date,
  deliveryDate: Date,
  createdAt: Date,
  updatedAt: Date,
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

export interface IBuyerBase {
  id: number,
  name: string,
  firstName: string,
  birthDay: Date,
  gender: Gender
  phoneNumber: string,
  address: string,
  status: UserStatus,
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
  description: string,
  status: UserStatus
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
  OPENED = 'opened',
  ACCEPTED = 'accepted',
  PAYED = 'payed',
  FULFILLED = 'fulfilled',
  CANCELED = 'canceled',
  BUYER_CANCEL_EARLY = 'buyer-cancel-early',
  BUYER_CANCEL_MID = 'buyer-cancel-mid',
  BUYER_CANCEL_LATE = 'buyer-cancel-late',
  GHOSTED = 'ghosted',
  SELLER_CANCEL ='seller-cancel'
}

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

export enum StoreStatus {
  Idle = 'idle',
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
};


export enum UserStatus {
  Pending = 'pending',
  Started = 'started',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

