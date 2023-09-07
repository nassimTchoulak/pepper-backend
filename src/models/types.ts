export interface IInvitation {
  id: number,
  product: string,
  description: string,
  date: Date,
  price: number,
  instances: number,
  delivery: string,
  active: boolean
};


export interface ITransaction {
  id: number,
  operation: string
  code: string,
  product: string,
  description: string,
  date: Date,
  price: number,
  instances: number,
  delivery: string,
  state: TransactionStatus,
};

export interface ITransactionBuyer extends IInvitation, ITransaction, ISellerBase{};

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
  gender: Gender,
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

