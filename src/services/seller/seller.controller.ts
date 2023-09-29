import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Seller, Invitation, Buyer } from 'orms';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { ISeller, IInvitation, UserStatus, IInvitationTransaction, ISellerBase, ITransactionSellerSide, DeliveryType } from 'models/types';
import 'dotenv/config';
import _, { includes } from 'lodash';
import { SellerService } from 'services/seller/seller.service';
import { Op } from 'sequelize';
import { sendEmailVerificationCodeSeller } from 'services/mailer/mailer';
import AuthHelper from 'helpers/auth';
import { Transaction } from 'orms/transaction.orm';
import { SellerVisibility } from 'models/attributes.visibility';
import { WILAYAS } from 'models/wilayas';

// useful when parsing the entire ISeller to be modified
interface SellerRequest extends Request {
  seller: ISeller
};

export class SellerController {

  @validation(Joi.object({
    name:  Joi.string().required(),
    firstName:  Joi.string().required(),
    password:  Joi.string().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().required(),
    businessName: Joi.string().required(),
    location: Joi.string().required(),
    wilaya: Joi.string().valid(...WILAYAS).required(),
    description: Joi.string().required(),
    code: Joi.string().required()
  }))
  
  public static async subscribe(req: Request, res: Response): Promise<Response<{ token: string }>> {

    // TO-DO : Add other tests such as phoneNumber and location
    const isVerified = await AuthHelper.checkVerification(req.body.phoneNumber, req.body.code);

    if (!isVerified) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Verification code not valid' });
    }
    const organizerTest = await Seller.findOne({ where: {[Op.or]: [
      { phoneNumber: req.body.phoneNumber },
      { email: req.body.email }
    ]} , raw: true})

    if (organizerTest !== null) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'phoneNumber or email already exists' });
    }

    // TO-DO: set status to be pending and validate user later through web App
    // TO-DO: add SHA-256
    await Seller.create({
      name: req.body.name,
      firstName: req.body.firstName,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      businessName: req.body.businessName,
      wilaya: req.body.wilaya,
      location: req.body.location,
      description: req.body.description,
      email: req.body.email
    });

    const seller = await Seller.findOne({ 
      where: { email: req.body.email }, 
      attributes: { exclude: ['password','createdAt','updatedAt','deletedAt'] },
      raw: true,
    });
    
    if (seller === null) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller could not be created!' });
    }

    sendEmailVerificationCodeSeller(seller.email, seller.emailCode, seller.firstName);

    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }

    const token = jwt.sign(seller, process.env.JWT_SELLER_KEY, { expiresIn: '24h'});
    return res.json({ token });
  }

  @validation(Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }))
  public static async login(req: Request, res: Response): Promise<Response<{ token: string }>> {
    const seller = await Seller.findOne({ where: { email: req.body.email, password: req.body.password }, raw: true});
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }

    // TO-DO : update policy for allowed logins (maybe pending or Accepted)
    const isAuthorized = seller.status !== UserStatus.Rejected;

    if (!isAuthorized) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'seller removed' });
    }

    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const token = jwt.sign(seller, process.env.JWT_SELLER_KEY, { expiresIn: '24h'});
    return res.json({ token });
  }

  @validation(Joi.object({}))
  public static async getSeller(req: SellerRequest, res: Response): Promise<Response<{ seller: ISellerBase }>> {

    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISellerBase;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }
    return res.json({ seller: SellerVisibility.AdaptSellerForSeller(seller) });
  }


  @validation(Joi.object({
    name:  Joi.string().optional(),
    firstName:  Joi.string().optional(),
    password:  Joi.string().optional(),
    businessName: Joi.string().optional(),
    location: Joi.string().optional(),
    wilaya: Joi.string().valid(...WILAYAS).optional(),
    description: Joi.string().optional(),
  }))
  public static async updateSeller(req: SellerRequest, res: Response): Promise<Response<{ seller: ISellerBase }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;
    await Seller.update({ ...req.body }, { where:  { id: TokenSeller.id }});
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }
    return res.json({ seller: SellerVisibility.AdaptSellerForSeller(seller) });
  }

  @validation(Joi.object({
    emailCode: Joi.number().required()
  }))
  public static async validateSellerEmail(req: SellerRequest, res: Response): Promise<Response<{ token: string }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;
    const user = await Seller.findOne({ where: { email: TokenSeller.email}, raw: false });
    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    if (user.emailCode !== parseInt(req.body.emailCode)) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'wrong code' });
    }
    // update the user
    user.update({status: UserStatus.Accepted})
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const user_data = user.get({plain: true});
    const token = jwt.sign(user_data, process.env.JWT_SELLER_KEY);
    return res.json({ token });
  }

  
  @validation(Joi.object({
    product: Joi.string().required(),
    date: Joi.date().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    storeWilaya : Joi.string().valid(...WILAYAS).required(),
    storeLocation: Joi.string().required(),
    deliveryType: Joi.string().valid(...Object.values(DeliveryType)).required(),
    localDeliveryPrice: Joi.number().required(),
  }))
  public static async createNewInvitation(req: SellerRequest, res: Response): Promise<Response<{ invitation: IInvitation }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }, raw: false});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const invitation = await Invitation.create({
      product: req.body.product,
      date: req.body.date,
      price: req.body.price,
      description: req.body.description,
      storeWilaya : req.body.storeWilaya,
      storeLocation: req.body.storeLocation,
      deliveryType: req.body.deliveryType,
      localDeliveryPrice: req.body.localDeliveryPrice,
    });

    await seller.addInvitation(invitation);
    return res.json({ invitation: SellerVisibility.AdaptSimpleInvitationToSeller(invitation) });
  }

  @validation(Joi.object({}))
  public static async getSellerInvitations(req: SellerRequest, res: Response): Promise<Response<{ invitations: IInvitationTransaction[] }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    /*
    const invitations = await Invitation.findAll({ where: {SellerId: TokenSeller.id }, 
      include: [{ model: Transaction, as: 'ITransaction', required: true }], nest: true, raw: true, paranoid: true})
      */
      const invitations = await Invitation.findAll({
        include: [
            { model: Transaction, as: 'InvitationTransactions'},
            { model: Transaction, as: 'InvitationTransactions', paranoid: true, required: false}
        ],
        where: {
          SellerId: TokenSeller.id
        }
    });

    return res.json({ invitations: SellerVisibility.AdaptListOfInvitationTransactionToSeller(invitations) });
  }

  @validation(Joi.object({
    uuid: Joi.string().required()
  }))
  public static async getSellerOneInvitation(req: SellerRequest, res: Response): Promise<Response<{ invitation: IInvitationTransaction }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const invitation = await Invitation.findOne({
        include: [
            { model: Transaction, as: 'InvitationTransactions'},
            { model: Transaction, as: 'InvitationTransactions', paranoid: true, required: false}
        ],
        where: {
          uuid: req.body.uuid,
          SellerId: TokenSeller.id
        }
    });

    if (!invitation){
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Invitation not found for Seller' });
    }

    return res.json({ invitation:SellerVisibility.AdaptInvitationTransactionToSeller(invitation) });
  }

  @validation(Joi.object({
    uuid: Joi.string().required()
  }))
  public static async getSellerOneTransaction(req: SellerRequest, res: Response): Promise<Response<{ invitations: ITransactionSellerSide }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const transaction_invitation = await Transaction.findOne({ where: {uuid: req.body.uuid}, 
      include:[{ model: Invitation, as:'Invitation'}, { model: Buyer, as: 'Buyer'}], nest: true, raw: true}) as unknown as { Invitation: { SellerId: number }};
    
    if (!transaction_invitation){
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Transaction not found' });
    }

    if (transaction_invitation.Invitation.SellerId !== TokenSeller.id) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Transaction can only be accessed by it\'s seller '});
    }

    const casted_transaction = transaction_invitation as unknown as ITransactionSellerSide;

    return res.json({ transaction: SellerVisibility.AdaptSellerFullTransactionToSeller(casted_transaction)});
  }

  @validation(Joi.object({
    uuid: Joi.string().required(),
  }))
  public static async deleteInvitation(req: SellerRequest, res: Response): Promise<Response<{ invitation: IInvitation }>> {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_SELLER_KEY) as unknown as ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }});
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }

    const invitation = await Invitation.findOne({ where: { uuid: req.body.uuid}});
    
    const invitationSeller = await invitation?.getSeller();

    if ((invitationSeller != null) && (invitation != null) && (invitationSeller.id == seller.id)){
      const result = await invitation.update({active : false});
      
      return res.json({ invitation: SellerVisibility.AdaptSimpleInvitationToSeller(result) });
    }
    else
    {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'No matching invitation found' });
    }

  }

} 