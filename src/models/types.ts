export interface IInvitation {
  id: number,
  product: string,
  description: string,
  date: Date,
  price: number,
  instances: number,
  delivery: string,
  active: boolean,
  SellerId: number
};


export interface ITransaction {
  id: number,
  uuid: string
  product: string,
  description: string,
  date: Date,
  price: number,
  instances: number,
  delivery: string,
  state: TransactionStatus,
  BuyerId: number,
  InvitationId: number
};

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
  CONFIRMED = 'confirmed',
  PAYED = 'payed',
  DONE = 'done',
  CANCELED = 'canceled',
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

