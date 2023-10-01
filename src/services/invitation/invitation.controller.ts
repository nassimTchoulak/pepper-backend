import { Request, Response } from 'express';
import Joi from 'joi';
import { transactionUUid, validation } from 'helpers/helpers';
import { Buyer, Claim, Invitation, Seller } from 'orms';
import httpStatus from 'http-status';
// import { UserService } from 'services/buyer/buyer.service';
import 'dotenv/config';
import { DeliveryType, IAdminTransaction, IBuyer, IInvitationComplete, ISeller, ITransactionSellerSide, TransactionOutcome, TransactionStatus } from 'models/types';
import { Transaction } from 'orms/transaction.orm';
import jwt from 'jsonwebtoken';
import { AdminVisibility, BuyerVisibility, SellerVisibility } from 'models/attributes.visibility';
import { WILAYAS } from 'models/wilayas';
import { Delegate } from 'aws-sdk/clients/workmail';
import { assert } from 'console';


interface UserRequest extends Request {
  user: any;
};

export class InvitationController {
  /**
   * Transaction life line is as follow:
   * 1- creation by Buyer from Invitation "Opened"
   * 2- approval from Seller [set delivery time approx] (TO-DO: Auto Bypass with additional fields in Invitation) "Accepted"
   * 3- Payment by Buyer "Payed"
   * 4- validation (Public) "Done"
   */


  /***
   * methods for Buyer process
   */

  @validation(Joi.object({
    InvitationUuid: Joi.string().required(),
    deliveryWilaya: Joi.string().valid(...WILAYAS).required(),
    deliveryPlace: Joi.string().required(),
  }))
  public static async createTransactionFromInvitation(req: UserRequest, res: Response): Promise<Response<{ transaction: IInvitationComplete }>> {
    const invitation = await Invitation.findOne({where: { uuid: req.body.InvitationUuid }})
    if (!invitation) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'invitation does not exist' });
    }

    if (!process.env.JWT_BUYER_KEY) {
      throw 'JWT key not provided';
    }
    const buyer_token = jwt.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY) as unknown as IBuyer;
    const buyer = await Buyer.findOne({ where: {id: buyer_token.id}, raw: false});
    if (!buyer) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'buyer does not exist' });
    }

    if (!invitation.active) {
        res.status(httpStatus.UNAUTHORIZED);
        return res.json({ message: 'Invitation is closed' });
    }

    if ((invitation.deliveryType === DeliveryType.LOCAL_WILAYA_ONLY) 
      && (req.body.deliveryWilaya !== invitation.storeWilaya)){
        res.status(httpStatus.UNAUTHORIZED);
        return res.json({ message: 'transaction is not allowed in different wilaya' });
    }

    let price = 0;
    let type: DeliveryType;

    if ((invitation.deliveryType === DeliveryType.NOT_NEEDED) || 
        (invitation.deliveryType === DeliveryType.PICK_FROM_SHOP)) {
          price = 0;
          type = invitation.deliveryType;
    }
    else {
      if (invitation.deliveryType === DeliveryType.LOCAL_WILAYA_ONLY) {
        assert(req.body.deliveryWilaya === invitation.storeWilaya)
        // auto-accept
        price = invitation.localDeliveryPrice;
        type = DeliveryType.LOCAL_WILAYA_ONLY;
      }
      else {
        ///invitation.deliveryType === DeliveryType.BETWEEN_WILAYAS
        if(req.body.deliveryWilaya === invitation.storeWilaya) {
          // auto-accept
          price = invitation.localDeliveryPrice;
          type = DeliveryType.LOCAL_WILAYA_ONLY;
        }
        else {
          price = 0
          type = DeliveryType.BETWEEN_WILAYAS;
        }
      }
    }
    const transactionInfo = {
      InvitationId: invitation.id,
      BuyerId: buyer.id,
      deliveryPlace: req.body.deliveryPlace + ", " + req.body.deliveryWilaya,
      deliveryType: type,
      deliveryPrice: price,
      uuid: transactionUUid(),
      state: (invitation.autoAccept && (type !== DeliveryType.BETWEEN_WILAYAS))? TransactionStatus.ACCEPTED : TransactionStatus.OPENED
    }
    //instead of await invitation.addTransaction(buyer, { through : transactionInfo })
    await Transaction.create(transactionInfo)
    
    const transaction = await Transaction.findOne({
      where: { uuid: transactionInfo.uuid },
      include: [{ model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: true
    });
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }

    return res.json({transaction : BuyerVisibility.adaptTransactionWithSellerToBuyer(transaction) });
  }

    /**
   * TO-DO
   * @param transactionUuid the uuid of the transaction created
   * @param res 
   * @returns 
   */
  @validation(Joi.object({
    transactionUuid: Joi.string().required()
  }))
  public static async payTheTransaction(req: UserRequest, res: Response): Promise<Response<{ invitation: IInvitationComplete }>> {
    const uuid = req.body.transactionUuid;
    if (!process.env.JWT_BUYER_KEY) {
      throw 'JWT key not provided';
    }
    const buyer_token = jwt.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY) as unknown as IBuyer;

    const transaction = await Transaction.findOne({ where : { uuid: uuid, BuyerId: buyer_token.id}})
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'transaction does not exist' });
    }
    if (transaction.state !== TransactionStatus.ACCEPTED) 
    {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Cant pay a transaction that is not in accepted state' });
    }
    const result = await transaction.update({ state : TransactionStatus.PAYED, paymentDate: new Date() })
    return res.json({ transaction: BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({plain: true})) })
  }


  @validation(Joi.object({
    transactionUuid: Joi.string().required()
  }))
  public static async closeTheTransaction(req: UserRequest, res: Response): Promise<Response<{ invitation: IInvitationComplete }>> {
    const uuid = req.body.transactionUuid;
    if (!process.env.JWT_BUYER_KEY) {
      throw 'JWT key not provided';
    }
    const buyer_token = jwt.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY) as unknown as IBuyer;

    const transaction = await Transaction.findOne({ where : { uuid: uuid, BuyerId: buyer_token.id}})
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'transaction does not exist' });
    }

    // if the transaction is finished
    if (transaction.state === TransactionStatus.FULFILLED) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'transaction is already fulfilled' });
    }

    if (transaction.state === TransactionStatus.CANCELED) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'transaction is already Canceled' });
    }

    // if early stage: Buyer can cancel directly
    if ((transaction.state === TransactionStatus.ACCEPTED) || (transaction.state === TransactionStatus.OPENED) )
    {
      const result = await transaction.update({ state : TransactionStatus.CANCELED, outcome : TransactionOutcome.CANCELED  })
      return res.json({ transaction: BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({plain: true})) })
    }
    
    if (transaction.state === TransactionStatus.PAYED) {
      // cancel a Paid transaction
      const paymentDate = new Date(transaction.paymentDate);
      paymentDate.setHours(paymentDate.getHours() + 3)
      const nowDate = new Date();
      if (paymentDate > nowDate) {
        // payment has less than 3 hours delay
        const result = await transaction.update({ state : TransactionStatus.PAYED_BUYER_CANCEL_EARLY })
        return res.json({ transaction: BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({plain: true})) })
      }
      else {
        // add 24h to payment Day
        paymentDate.setHours(paymentDate.getHours() + 21)
        const delivery_time_minus_24 = new Date(transaction.deliveryDate)
        delivery_time_minus_24.setHours(delivery_time_minus_24.getHours() - 24)

        if ((nowDate < paymentDate) && (nowDate < delivery_time_minus_24)) {
          const result = await transaction.update({ state : TransactionStatus.PAYED_BUYER_CANCEL_MID })
          return res.json({ transaction: BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({plain: true})) })
        }
        else {
          const result = await transaction.update({ state : TransactionStatus.PAYED_BUYER_CANCEL_LATE })
          return res.json({ transaction: BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({plain: true})) })
        }
      }
    }
    const result = await transaction.update({ state : TransactionStatus.PAYED })
    return res.json({ transaction: BuyerVisibility.adaptTransactionWithSellerToBuyer(result.get({plain: true})) })
  }

  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    reason: Joi.string().required(),
    text: Joi.string().required()
  }))
  public static async addBuyerClaim(req: UserRequest, res: Response): Promise<Response<{ status: boolean }>> {
    if (!process.env.JWT_BUYER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_BUYER_KEY) as unknown as  IBuyer;

    const transaction_invitation = await Transaction.findOne({ where: {uuid: req.body.transactionUuid}, 
      raw: false}) as unknown as {BuyerId : number, id: number}
    
    if (!transaction_invitation){
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }

    if (transaction_invitation.BuyerId !== TokenSeller.id) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction can only be accessed by it\'s Buyer '});
    }
    
    const transaction = transaction_invitation as unknown as Transaction;
    const claim = await Claim.create({sender: 'From Buyer', reason: req.body.reason, text: req.body.text});
    await transaction.addClaim(claim)
    return res.json({ status: true })
  }

  /***
   * 
   * Methods for seller
   */
  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    date: Joi.date().min(new Date()).required(), // TO-DO : add 24h to it
    deliveryPrice : Joi.string().required()
  }))
  public static async acceptTransaction(req: UserRequest, res: Response): Promise<Response<{ invitations: ITransactionSellerSide }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;

    const transaction_invitation = await Transaction.findOne({ where: {uuid: req.body.transactionUuid}, 
      include:[{ model: Invitation, as:'Invitation'}, { model: Buyer, as: 'Buyer'}], nest: true, raw: false}) as 
        unknown as { Invitation: { SellerId: number }, state: TransactionStatus, deliveryPrice: number, deliveryType: DeliveryType};
    
    if (!transaction_invitation){
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }

    if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction can only be accessed by it\'s seller '});
    }

    if (transaction_invitation.state !== TransactionStatus.OPENED) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'The Transaction has been modified and can not be accepted'});
    }

    const price = (transaction_invitation.deliveryType === DeliveryType.BETWEEN_WILAYAS)? req.body.deliveryPrice : transaction_invitation.deliveryPrice;

    const transaction = transaction_invitation as unknown as Transaction;
    await transaction.update({ state: TransactionStatus.ACCEPTED, deliveryPrice: price, deliveryDate: req.body.date})

    return res.json({ transaction: SellerVisibility.AdaptSellerFullTransactionToSeller(transaction.get({ plain: true }))});
  }


  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
  }))
  public static async rejectTransaction(req: UserRequest, res: Response): Promise<Response<{ invitations: ITransactionSellerSide }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;

    const transaction_invitation = await Transaction.findOne({ where: {uuid: req.body.transactionUuid}, 
      include:[{ model: Invitation, as:'Invitation'}, { model: Buyer, as: 'Buyer'}], nest: true, raw: false}) as 
        unknown as { Invitation: { SellerId: number }, state: TransactionStatus};
    
    if (!transaction_invitation){
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }

    if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction can only be accessed by it\'s seller '});
    }

    if ((transaction_invitation.state === TransactionStatus.OPENED) || (transaction_invitation.state === TransactionStatus.ACCEPTED) ) {
      const transaction = transaction_invitation as unknown as Transaction;
      await transaction.update({ state: TransactionStatus.CANCELED, outcome: TransactionOutcome.CANCELED, delivery: req.body.delivery, date: req.body.date})

      return res.json({ transaction: SellerVisibility.AdaptSellerFullTransactionToSeller(transaction.get({ plain: true }))});
    }
    else {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Can not cancel the Transaction '});
    }

  }


  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    reason: Joi.string().required(),
    text: Joi.string().required()
  }))
  public static async addSellerClaim(req: UserRequest, res: Response): Promise<Response<{ status: boolean }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;

    const transaction_invitation = await Transaction.findOne({ where: {uuid: req.body.transactionUuid}, 
      include:[{ model:Invitation, as : 'Invitation'}], raw: false}) as 
        unknown as { Invitation: { SellerId: number }, state: TransactionStatus, id: number};
    
    if (!transaction_invitation){
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }

    if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction can only be accessed by it\'s seller '});
    }
    
    const transaction = transaction_invitation as unknown as Transaction;
    const claim = await Claim.create({sender: 'From Seller', reason: req.body.reason, text: req.body.text});
    await transaction.addClaim(claim)

    return res.json({ status: true })
  }


  /***
   * Public Invitation & transaction methods
   */

  @validation(Joi.object({
    InvitationUuid: Joi.string().required(),
  }))
  public static async getPublicInvitationInfo(req: UserRequest, res: Response): Promise<Response<{ invitation: IInvitationComplete }>> {
    const uuid = req.body.InvitationUuid;
    if (!uuid) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Invitation does not exist wrong request' });
    }

    const invitation = await Invitation.findOne({ where : { uuid: uuid }, 
      include : { model: Seller, as: 'Seller'}, nest: true, raw: true})
    if (!invitation) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Invitation does not exist' });
    }
    return res.json({ invitation : BuyerVisibility.adaptInvitationToBuyer(invitation) })
  }

  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    activationKey: Joi.string().required(),
  }))
  public static async canValidateTransaction(req: UserRequest, res: Response): Promise<Response<{ transaction: IAdminTransaction }>> {

    const transaction = await Transaction.findOne({
      where: { uuid: req.body.transactionUuid },
      include: [{ model: Buyer, as:'Buyer'} , { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: true
    });
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }
    if (transaction.state !== TransactionStatus.PAYED) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'This transaction is not payed' });
    }
    if (transaction.activationKey !== req.body.activationKey) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Wrong activation key' });
    }
    return res.json({ transaction : AdminVisibility.adaptTransactionWithSellerToPublic(transaction) })
  }


  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    activationKey: Joi.string().required(),
  }))
  public static async validateTransaction(req: UserRequest, res: Response): Promise<Response<{ transaction: IAdminTransaction }>> {

    const transaction = await Transaction.findOne({
      where: { uuid: req.body.transactionUuid },
      include: [ { model: Buyer, as:'Buyer'} , { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: false
    });
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }
    if (transaction.state !== TransactionStatus.PAYED) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'This transaction is not payed' });
    }
    if (transaction.activationKey !== req.body.activationKey) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Wrong activation key' });
    }
    await transaction.update({ state: TransactionStatus.FULFILLED })
    return res.json({ transaction : AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({plain: true})) })
  }
}