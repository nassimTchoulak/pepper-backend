
import _ from "lodash";
import { IBuyerBase, IInvitation, IInvitationTransaction, ISellerBase, ITransaction, ITransactionSellerSide, IInvitationComplete, ITransactionWithSeller, ITransactionNoSeller, IAdminTransaction } from "models/types";
import { Buyer, Invitation, Seller, Transaction } from "orms";

export class SellerVisibility{
  
  public static AdaptSimpleInvitationToSeller(invitation: Invitation) : IInvitation {
    return _.omit(invitation.get({plain : true}), ["id", "deletedAt", "SellerId"]) as unknown as IInvitation;
  }

  public static adaptSimpleITransaction(transaction: ITransaction) : ITransaction {
    return _.omit(transaction, ["id", "BuyerId", "InvitationId", "deletedAt", "SellerId", "activationKey"]) as unknown as ITransaction;
  }

  /**
   * @param transaction must involve Sequilize methods
   * @returns IInvitationTransaction
   */
  public static AdaptInvitationTransactionToSeller(transaction: Invitation) : IInvitationTransaction {
    const tmp = _.omit(transaction.get({plain : true}), ["id", "deletedAt", "SellerId"]) as unknown as IInvitationTransaction;
    tmp.InvitationTransactions = _.map(tmp.InvitationTransactions, (transaction) => {
        return this.adaptSimpleITransaction(transaction);
      });
    return tmp;
  }

  public static AdaptListOfInvitationTransactionToSeller(invitation : Invitation[]) : IInvitationTransaction[] {
    return _.map(invitation, (transaction) => {
        return this.AdaptInvitationTransactionToSeller(transaction)
      }); 
  }

  /**
   * @param seller raw without methods
   * @returns ISellerBase
   */
  public static AdaptSellerForSeller(seller: Seller) : ISellerBase {
    return _.omit(seller, ['createdAt', 'updatedAt', 'deletedAt', 'password', 'emailCode', 'id']) as unknown as ISellerBase
  }

  public static AdaptSellerFullTransactionToSeller(transaction: ITransactionSellerSide) : ITransactionSellerSide {
    const tmp = _.omit(transaction, ["id", "BuyerId", "InvitationId", "deletedAt", "SellerId", "activationKey"]) as unknown as ITransactionSellerSide;
    tmp.Buyer = _.omit(tmp.Buyer, ['birthDay', 'password', 'id', 'deletedAt', 'createdAt', 'updatedAt', 'name', 'emailCode' ]) as unknown as IBuyerBase
    tmp.Invitation = _.omit(tmp.Invitation, ["id", "deletedAt", "SellerId"]) as unknown as IInvitation
    return tmp;
  }

  

}


export class BuyerVisibility {

    public static adaptBuyerToBuyer(buyer : Buyer) : IBuyerBase {
        return _.omit(buyer, ['createdAt', 'updatedAt', 'deletedAt', 'password', 'emailCode', 'id']) as unknown as IBuyerBase
    }

    public static adaptTransactionWithSellerToBuyer(transaction: Transaction) : ITransactionWithSeller {
        const tmp = _.omit(transaction, ['id', 'BuyerId', 'InvitationId']) as unknown as ITransactionWithSeller
        tmp.Invitation = _.omit(tmp.Invitation, ['id', 'SellerId']) as unknown as IInvitationComplete;
        tmp.Invitation.Seller = _.omit(tmp.Invitation.Seller, ['id', 'password', 'emailCode', 'createdAt', 'updatedAt']) as unknown as ISellerBase;
        return tmp;
    }
    public static adaptTransactionNoSellerToBuyer(transaction: Transaction) : ITransactionNoSeller {
        const tmp = _.omit(transaction, ['id', 'BuyerId', 'InvitationId']) as unknown as ITransactionNoSeller
        tmp.Invitation = _.omit(tmp.Invitation, ['id', 'SellerId']) as unknown as IInvitation;
        return tmp;
    }

    public static adaptListOfTransactionWithSellerToBuyer(invitation : Transaction[]) : ITransactionWithSeller[] {
        return _.map(invitation, (transaction) => {
            return this.adaptTransactionWithSellerToBuyer(transaction)
          }); 
    }

    public static adaptListOfTransactionNoSellerToBuyer(invitation : Transaction[]) : ITransactionNoSeller[] {
        return _.map(invitation, (transaction) => {
            return this.adaptTransactionNoSellerToBuyer(transaction)
          }); 
    }

    public static adaptInvitationToBuyer(invitation : Invitation): IInvitationComplete {
        const tmp =  _.omit(invitation, ['id', 'SellerId']) as unknown as IInvitationComplete;
        tmp.Seller = _.omit(tmp.Seller, ['id', 'password', 'emailCode', 'createdAt', 'updatedAt']) as unknown as ISellerBase;
        return tmp;
    }
}


export class AdminVisibility {
  public static adaptTransactionWithSellerToPublic(transaction: Transaction) : IAdminTransaction {
    const tmp = _.omit(transaction, ['id', 'BuyerId', 'InvitationId']) as unknown as IAdminTransaction
    tmp.Buyer = _.omit(tmp.Buyer, ['birthDay', 'password', 'id', 'deletedAt', 'createdAt', 'updatedAt', 'name', 'emailCode' ]) as unknown as IBuyerBase
    tmp.Invitation = _.omit(tmp.Invitation, ['id', 'SellerId']) as unknown as IInvitationComplete;
    tmp.Invitation.Seller = _.omit(tmp.Invitation.Seller, ['id', 'password', 'emailCode', 'createdAt', 'updatedAt']) as unknown as ISellerBase;
    return tmp;
  }

  public static adaptTransactionsWithSellerToPublic(transactions: Transaction[]) : IAdminTransaction[] {
    return _.map(transactions, (transaction) => {
      return this.adaptTransactionWithSellerToPublic(transaction)
    }); 
  }
}