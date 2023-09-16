
import _ from "lodash";
import { IBuyerBase, IInvitation, IInvitationTransaction, ISellerBase, ITransaction, ITransactionSellerSide } from "models/types";
import { Invitation, Seller, Transaction } from "orms";

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
    return _.omit(seller, ['createdAt', 'updatedAt', 'deletedAt', 'password', 'emailCode']) as unknown as ISellerBase
  }

  public static AdaptSellerFullTransactionToSeller(transaction: ITransactionSellerSide) : ITransactionSellerSide {
    const tmp = _.omit(transaction, ["id", "BuyerId", "InvitationId", "deletedAt", "SellerId", "activationKey"]) as unknown as ITransactionSellerSide;
    tmp.Buyer = _.omit(tmp.Buyer, ['birthDay', 'password', 'id', 'deletedAt', 'createdAt', 'updatedAt', 'name' ]) as unknown as IBuyerBase
    tmp.Invitation = _.omit(tmp.Invitation, ["id", "deletedAt", "SellerId"]) as unknown as IInvitation
    return tmp;
  }

  

}