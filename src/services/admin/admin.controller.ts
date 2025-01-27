import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Buyer, Claim, History, Invitation, Seller, Transaction } from 'orms';
import { CANCELED_TO_BE_PAYED_LIST, FULFILLED_TO_BE_PAYED_LIST, IAdminFullTransaction, IAdminTransaction, IHistory, IInvitationTransaction, ITransactionNoSeller, TransactionOutcome, TransactionStatus, EntityStatus, ISellerBase } from 'models/types';
import 'dotenv/config';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { AdminVisibility, BuyerVisibility, SellerVisibility } from 'models/attributes.visibility';
import { Op, Sequelize } from 'sequelize';
import httpStatus from 'http-status';
import priceCalculator from 'models/pricing';


interface AdminRequest extends Request {
  admin: {
    id: number,
    name: string
  }
};

export class AdminController {

  public static async dummyMethod(req: AdminRequest, res: Response): Promise<Response<{answer : string }>> {
    console.log(req.admin)
    return res.json({ answer: "good from "+req.admin.name });
  }

  @validation(Joi.object({
    name: Joi.string().required(),
    privateKey: Joi.string().required()
  }))
  public static async generateAdminToken(req: AdminRequest, res: Response): Promise<Response<{adminToken : string }>> {
    const admin = {
      name: req.body.name,
      id: 0,
    }
    const adminToken = jwt.sign(admin, req.body.privateKey, {
      algorithm: 'RS256',
      issuer: 'application',
    });
    
    return res.json({ adminToken });
  }

  @validation(Joi.object({
  }))
  public static async getOngoingClaims(req: AdminRequest, res: Response): Promise<Response<{transactions : IAdminFullTransaction[] }>> {
    
    // TO-DO: filter out transactions with no claims in the query itself
    const transactions = await Transaction.findAll({
      include:[
        { model: Claim , required: true },
        //  { model: Claim, paranoid: true, required: false},
        { model: History, as: 'Histories', required: false},
        { model: Buyer, as:'Buyer'} ,
        { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }
        ],
        where: { outcome: TransactionOutcome.ONGOING, state : [TransactionStatus.FULFILLED, TransactionStatus.PAYED, TransactionStatus.ACCEPTED] },
        order: [['createdAt', 'DESC']]
        })

    const transaction_plain = _.map(transactions, (transaction) => {
      const v = transaction as unknown as IAdminFullTransaction
      if (v.Claims.length > 0)
      return transaction.get({plain: true})
    })
    //return res.json({})
    return res.json({ transactions: AdminVisibility.adaptTransactionsWithSellerToPublic(transaction_plain) });
  }


  @validation(Joi.object({
  }))
  public static async getOngoingPayedCanceled(req: AdminRequest, res: Response): Promise<Response<{transactions : IAdminFullTransaction[] }>> {
    
    const transactions = await Transaction.findAll({
      include:[
         { model: Claim , required: false },
        //  { model: Claim, paranoid: true, required: false},
        { model: History, as: 'Histories', required: false},
        { model: Buyer, as:'Buyer'} ,
        { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }
        ],
        where: { outcome: TransactionOutcome.ONGOING, state : CANCELED_TO_BE_PAYED_LIST },
        order: [['createdAt', 'DESC']]
        })

    const transaction_plain = _.map(transactions, (transaction) => {
      return transaction.get({plain: true})
    })
    return res.json({ transactions: AdminVisibility.adaptTransactionsWithSellerToPublic(transaction_plain) });
  }

  @validation(Joi.object({
  }))
  public static async getOngoingPayedFulfilled(req: AdminRequest, res: Response): Promise<Response<{transactions : IAdminFullTransaction[] }>> {
    
    
    const new_date = new Date()
    // TO-DO remake to 12hours
    // new_date.setHours(new_date.getHours() - 12)
    new_date.setMinutes(new_date.getMinutes() - 2)

    const transactions = await Transaction.findAll({
      include:[
         { model: Claim , required: false },
        //  { model: Claim, paranoid: true, required: false},
        { model: History, as: 'Histories', required: false},
        { model: Buyer, as:'Buyer'} ,
        { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }
        ],
        where: { outcome: TransactionOutcome.ONGOING, state : FULFILLED_TO_BE_PAYED_LIST,
        updatedAt: {
          [Op.lt]: new_date
        } },
        order: [['createdAt', 'DESC']]
        })

    const transaction_plain = _.map(transactions, (transaction) => {
      return transaction.get({plain: true})
    })
    return res.json({ transactions: AdminVisibility.adaptTransactionsWithSellerToPublic(transaction_plain) });
   
  }


  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    decision: Joi.string().valid(
      TransactionStatus.PAYED_GHOSTED,
      TransactionStatus.PAYED_BUYER_CANCEL_LATE,
      TransactionStatus.PAYED_SELLER_CANCEL,
      TransactionStatus.PAYED_REIMBURSED,
      TransactionStatus.PAYED_COMPLEX_CANCEL,
      TransactionStatus.FULFILLED_CONTINUE,
      TransactionStatus.FULFILLED_HOLD,
      TransactionStatus.FULFILLED
    ).required(),
    reason: Joi.string().required()
  }))
  public static async decideOnTransaction(req: AdminRequest, res: Response): Promise<Response<{transaction : IAdminTransaction }>> {
    const transaction = await Transaction.findOne({
      where: { uuid: req.body.transactionUuid },
      include: [{ model: Buyer, as:'Buyer'} , { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: false
    });
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }
    await History.create({ actionType: 'decision modify state',
       action: `${transaction.uuid} modified state from ${transaction.state} to ${req.body.decision} `, reason: req.body.reason,
       admin: req.admin.name, TransactionId: transaction.id})
    await transaction.update({ state: req.body.decision})
    return res.json({ transaction : AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({plain : true})) })
  }



  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
  }))
  public static async closeTransaction(req: AdminRequest, res: Response): Promise<Response<{transaction : IAdminTransaction }>> {

    const transaction = await Transaction.findOne({
      where: { uuid: req.body.transactionUuid },
      include: [{ model: Buyer, as:'Buyer'} , { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: false
    });
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }
    if (transaction.outcome !== TransactionOutcome.ONGOING) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction already closed' });
    }
    
    const state = transaction?.state
    let outcome;
    if (CANCELED_TO_BE_PAYED_LIST.indexOf(state) !== -1) {
      outcome = TransactionOutcome.CLOSED_FAILED
    }
    else {
      if (FULFILLED_TO_BE_PAYED_LIST.indexOf(state) != -1) {
        outcome = TransactionOutcome.CLOSED_SUCCESS
      }
      else {
        res.status(httpStatus.UNAUTHORIZED);
        return res.json({ message: 'Transaction can not be closed' });
      }
    }
    const priceInterface = priceCalculator(transaction as unknown as ITransactionNoSeller)

    await History.create({ actionType: 'closing & accounting',
       action: `${transaction.uuid}`,
       reason: `${JSON.stringify(priceInterface)}`,
       admin: req.admin.name, TransactionId: transaction.id})

    await transaction.update({ outcome: outcome  })
    return res.json({ transaction : AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({plain : true})) })
  }


  @validation(Joi.object({
    sellerEmail: Joi.string().required() 
  }))
  public static async getSellerHistory(req: AdminRequest, res: Response): Promise<Response<{ transactions : IInvitationTransaction[] }>> {
    const seller = await Seller.findOne({ where: {email : req.body.sellerEmail }}) as unknown as { id : number }
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
        return res.json({ message: 'Seller not found' });
    }
    const invitations = await Invitation.findAll({
      include: [
          // { model: Transaction, as: 'InvitationTransactions'},
          { model: Transaction, as: 'InvitationTransactions', required: false}
      ],
      where: {
        SellerId: seller.id
      }, raw: true,
      order: [['createdAt', 'DESC']]
    });
    return res.json({ invitations: SellerVisibility.AdaptListOfInvitationTransactionToSeller(invitations) });
  }

  @validation(Joi.object({
    BuyerEmail: Joi.string().required() 
  }))
  public static async getBuyerHistory(req: AdminRequest, res: Response): Promise<Response<{ transactions : ITransactionNoSeller[] }>> {
    const buyer = await Buyer.findOne({ where: {email : req.body.BuyerEmail }}) as unknown as { id : number }
    if (!buyer) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Seller not found' });
    }

    const transactions = await Transaction.findAll({ where: {BuyerId: buyer.id}, 
      include: [{model: Invitation, as:'Invitation'} ], raw: true, nest: true, order: [['createdAt', 'DESC']]})
    return res.json({transactions: BuyerVisibility.adaptListOfTransactionNoSellerToBuyer(transactions)})
  }

  @validation(Joi.object({
  }))
  public static async getActionsHistory(req: AdminRequest, res: Response): Promise<Response<{ history : IHistory[] }>> {
    const actions = await History.findAll({ order: [['createdAt', 'DESC']], raw: true, nest: true})
    return res.json({history : actions })
  }



  @validation(Joi.object({
    transactionUuid: Joi.string().required()
  }))
  public static async getTransactionDetail(req: AdminRequest, res: Response): Promise<Response<{transaction : IAdminFullTransaction }>> {
    
    const transaction = await Transaction.findOne({
      include:[
        // { model: Claim, as:'Claims' },
        { model: Claim, as:'Claims', required: false },
        //  { model: Claim, paranoid: true, required: false},
        // { model: History, as: 'Histories' },
        { model: History, as: 'Histories', required: false},
        { model: Buyer, as:'Buyer'} ,
        { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }
        ],
        where: { uuid: req.body.transactionUuid},
        order: [['createdAt', 'DESC']],
        raw: false, nest: true
        })
    
      if (!transaction) {
        res.status(httpStatus.NOT_FOUND);
        return res.json({ message: 'transaction not found' });
      }

    return res.json({ transactions: AdminVisibility.adaptTransactionWithSellerToPublic(transaction.get({plain : true})) });
  }


  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required()
  }))
  public static async addNoteToTransaction(req: AdminRequest, res: Response): Promise<Response<{transaction : IAdminFullTransaction }>> {
    
    const transaction = await Transaction.findOne({
        where: { uuid: req.body.transactionUuid},
        raw: false, nest: true
    })
    
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'transaction not found' });
    }
    const history = await History.create({ action: req.body.title, actionType: 'Note', reason: req.body.text, admin: req.admin.name})
    if (!history) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'not could not be added' });
    }
    await transaction.addHistory(history)

    const transaction_ = await Transaction.findOne({
      include:[
        // { model: Claim, as:'Claims' },
        { model: Claim, as:'Claims', required: false },
        //  { model: Claim, paranoid: true, required: false},
        // { model: History, as: 'Histories' },
        { model: History, as: 'Histories', required: false},
        { model: Buyer, as:'Buyer'} ,
        { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }
        ],
        where: { uuid: req.body.transactionUuid},
        order: [['createdAt', 'DESC']],
        raw: false, nest: true
        })
    
      if (!transaction_) {
        res.status(httpStatus.NOT_FOUND);
        return res.json({ message: 'transaction not found' });
      }

    return res.json({ transactions: AdminVisibility.adaptTransactionWithSellerToPublic(transaction_.get({plain : true})) });
  }


  
  @validation(Joi.object({
    transactionUuid: Joi.string().required(),
  }))
  public static async getClosingInfoPrice(req: AdminRequest, res: Response): Promise<Response<{info : {
            commission_money: number;
            buyer_money: number;
            seller_money: number;
            payed_money: number;
} }>> {

    const transaction = await Transaction.findOne({
      where: { uuid: req.body.transactionUuid },
      include: [{ model: Buyer, as:'Buyer'} , { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: false
    });
    if (!transaction) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }
    if (transaction.outcome !== TransactionOutcome.ONGOING) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction already closed' });
    }
    
    const state = transaction?.state
    let outcome;
    if (CANCELED_TO_BE_PAYED_LIST.indexOf(state) !== -1) {
      outcome = TransactionOutcome.CLOSED_FAILED
    }
    else {
      if (FULFILLED_TO_BE_PAYED_LIST.indexOf(state) != -1) {
        outcome = TransactionOutcome.CLOSED_SUCCESS
      }
      else {
        res.status(httpStatus.UNAUTHORIZED);
        return res.json({ message: 'Transaction can not be closed' });
      }
    }
    const priceInterface = priceCalculator(transaction as unknown as ITransactionNoSeller)
    return res.json({ info: priceInterface })
    
  }


  @validation(Joi.object({
    uuid: Joi.string().required(),
  }))
  public static async approveInvitation(req: AdminRequest, res: Response): Promise<Response<{ invitation: IAdminFullTransaction }>> {

    const invitation = await Invitation.findOne({ where: { uuid: req.body.uuid}});
    
    if (!invitation) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'No matching invitation found' });
    }
    
    await invitation.update({active : EntityStatus.Accepted});
    return res.json({ invitation: SellerVisibility.AdaptSimpleInvitationToSeller(invitation) });
  }

  @validation(Joi.object({
    uuid: Joi.string().required(),
  }))
  public static async rejectInvitation(req: AdminRequest, res: Response): Promise<Response<{ invitation: IAdminFullTransaction }>> {

    const invitation = await Invitation.findOne({ where: { uuid: req.body.uuid}});
    
    if (!invitation) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'No matching invitation found' });
    }
    
    await invitation.update({active : EntityStatus.Rejected});
    return res.json({ invitation: SellerVisibility.AdaptSimpleInvitationToSeller(invitation) });
  }

  @validation(Joi.object({
    sellerId: Joi.string().required(),
  }))
  public static async rejectSeller(req: AdminRequest, res: Response): Promise<Response<{ seller: ISellerBase }>> {

    await Seller.update({ status: EntityStatus.Rejected }, { where:  { id: req.body.sellerId }});
    const seller = await Seller.findOne({ where: { id: req.body.sellerId }, raw: true });
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }
    return res.json({ seller: SellerVisibility.AdaptSellerForSeller(seller) });
  }


} 
