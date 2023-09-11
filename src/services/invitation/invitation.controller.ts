import { Request, Response } from 'express';
import Joi from 'joi';
import { randomHash, transactionUUid, validation } from 'helpers/helpers';
import { Buyer, Invitation, Seller } from 'orms';
import httpStatus from 'http-status';
// import { UserService } from 'services/buyer/buyer.service';
import 'dotenv/config';
import { IBuyer, IFullPlusSeller, IFullTransaction, IInvitation, ISellerBase, ITransaction } from 'models/types';
import { HasManyAddAssociationsMixinOptions, where } from 'sequelize';
import { Transaction } from 'orms/transaction.orm';
import jwt from 'jsonwebtoken';
import { SellerService } from 'services/seller/seller.service';
import { includes } from 'lodash';

interface UserRequest extends Request {
  user: Buyer
};

export class InvitationController {
  // TODO: add pagination
  @validation(Joi.object({}))
  public static async getPartiesThatUserCanGoTo(req: UserRequest, res: Response): Promise<Response<{ parties: IInvitation[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id }});
    // user?.addInvitation()

    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    // const normalizedParties = await UserService.getPartiesUserCanGoTo(user);
    return res.json({ parties: [] });
  }

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
    
    // return res.json({})
  }
}