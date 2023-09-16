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
  date: Date,
  createdAt: Date,
  updatedAt: Date,
};

export interface IInvitationTransaction extends IInvitation {
  InvitationTransactions: ITransaction[]
}

export interface ITransactionSellerSide extends ITransaction {
  Invitation: IInvitation,
  Buyer: IBuyerBase
}

export interface ITransactionBuyer extends IInvitation, ITransaction, ISellerBase{};

export interface IFullTransaction extends ITransaction{
  Invitation: IInvitation
}

export interface IFullPlusSeller extends IFullTransaction{
  Seller: ISellerBase
}

export interface ITransactionSeller extends IInvitation, ITransaction, IBuyerBase{};

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

export interface IBuyer extends IBuyerBase {
  transactions: ITransactionBuyer[],
};

export interface ISeller extends ISellerBase {
  invitations : IInvitation[],
  transactions: ITransactionSeller[]
}


export enum TransactionStatus {
  OPENED = 'opened',
  ACCEPTED = 'accepted',
  PAYED = 'payed',
  FULFILLED = 'fulfilled',
  CANCELED = 'canceled',
  CHANGED_MIND_EARLY = 'changed-mind-early',
  CHANGED_MIND_LATE = 'changed-mind-late',
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

