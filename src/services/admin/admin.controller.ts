import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Buyer, Claim, History, Invitation, Seller, Transaction } from 'orms';
import { CANCELED_TO_BE_PAYED_LIST, FULFILLED_TO_BE_PAYED_LIST, IAdminFullTransaction, TransactionOutcome, TransactionStatus, UserStatus } from 'models/types';
import 'dotenv/config';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { AdminVisibility } from 'models/attributes.visibility';
import { Op, Sequelize } from 'sequelize';


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
        { model: History, as: 'Histories'},
        { model: Buyer, as:'Buyer'} ,
        { model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }
        ],
        where: { outcome: TransactionOutcome.ONGOING },
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
  public static async getOngoingPayedCanceled(req: AdminRequest, res: Response): Promise<Response<{adminToken : string }>> {
    
    const transactions = await Transaction.findAll({
      include:[
         { model: Claim , required: true },
        //  { model: Claim, paranoid: true, required: false},
        { model: History, as: 'Histories'},
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
  public static async getOngoingPayedFulfilled(req: AdminRequest, res: Response): Promise<Response<{adminToken : string }>> {
    
    
    const new_date = new Date()
    // TO-DO remake to 12hours
    // new_date.setHours(new_date.getHours() - 12)
    new_date.setMinutes(new_date.getMinutes() - 2)

    const transactions = await Transaction.findAll({
      include:[
         { model: Claim , required: true },
        //  { model: Claim, paranoid: true, required: false},
        { model: History, as: 'Histories'},
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

} 
