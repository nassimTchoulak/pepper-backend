import { Request, Response } from 'express';
import Joi from 'joi';
import { randomHash, transactionUUid, validation } from 'helpers/helpers';
import { Buyer, Invitation, Seller } from 'orms';
import httpStatus from 'http-status';
// import { UserService } from 'services/buyer/buyer.service';
import 'dotenv/config';
import { IBuyer, IFullPlusSeller, IFullTransaction, IInvitation, ISellerBase, ITransaction, TransactionStatus } from 'models/types';
import { HasManyAddAssociationsMixinOptions, where } from 'sequelize';
import { Transaction } from 'orms/transaction.orm';
import jwt from 'jsonwebtoken';
import { SellerService } from 'services/seller/seller.service';
import { includes } from 'lodash';

interface UserRequest extends Request {
  user: Buyer
};

export class InvitationController {
  /**
   * Transaction life line is as follow:
   * 1- creation by Buyer from Invitation "Opened"
   * 2- approval from Seller [set delivery time approx] (TO-DO: Auto Bypass with additional fields in Invitation) "Accepted"
   * 3- Payment by Buyer "Payed"
   * 4- validation (Public) "Done"
   */

  @validation(Joi.object({
    InvitationUuid: Joi.string().required(),
    delivery: Joi.string().required(),
  }))
  public static async createTransactionFromInvitation(req: UserRequest, res: Response): Promise<Response<{ transaction: IFullPlusSeller }>> {
    const invitation = await Invitation.findOne({where: { uuid: req.body.InvitationUuid }})
    if (!invitation) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'invitation does not exist' });
    }

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer_token = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;
    const buyer = await Buyer.findOne({ where: {id: buyer_token.id}, raw: false});
    if (!buyer) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'buyer does not exist' });
    }

    const transactionInfo = {
      InvitationId: invitation.id,
      BuyerId: buyer.id,
      delivery: req.body.delivery,
      uuid: transactionUUid()
    }
    //instead of await invitation.addTransaction(buyer, { through : transactionInfo })
    await Transaction.create(transactionInfo)
    
    const transaction = await Transaction.findOne({
      where: { uuid: transactionInfo.uuid },
      include: [{ model: Invitation, as: 'Invitation', include: [{ model: Seller, as : 'Seller'}] }], nest: true, raw: true
    }) as unknown as IFullTransaction;  // .then((res)=>console.log(res)).catch((err)=>console.log(err))

    //const seller = await Seller.findOne({ where: {id: transaction?.Invitation.SellerId}, raw: true}); 

    return res.json({transaction : {... transaction //, Seller : SellerService.cleanSellerToSend(seller)
    }});
  }

    /**
   * 
   * @param transactionUuid the uuid of the transaction created
   * @param res 
   * @returns 
   */
  @validation(Joi.object({
    transactionUuid: Joi.string().required()
  }))
  public static async payTheTransaction(req: UserRequest, res: Response): Promise<Response<{ invitation: IFullPlusSeller }>> {
    const uuid = req.body.uuid;
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer_token = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;

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
    const result = await transaction.update({ state : TransactionStatus.PAYED})
    return res.json({ transaction: result.get({plain: true}) })
  }

  @validation(Joi.object({}))
  public static async getPublicInvitationInfo(req: UserRequest, res: Response): Promise<Response<{ invitation: IFullPlusSeller }>> {
    const uuid = req.params.uuid;
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
    return res.json({ invitation })
  }
}