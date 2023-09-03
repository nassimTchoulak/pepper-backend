import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Seller, Invitation } from 'orms';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { ISeller, IInvitation, UserStatus } from 'models/types';
import 'dotenv/config';
import _ from 'lodash';
import { SellerService } from 'services/seller/seller.service';
import { Op } from 'sequelize';

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
    description: Joi.string().required(),
  }))
  
  public static async subscribe(req: Request, res: Response): Promise<Response<{ token: string }>> {

    // TO-DO : Add other tests such as phoneNumber and location
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
      location: req.body.location,
      description: req.body.description,
      email: req.body.email
    });

    const organizer = await Seller.findOne({ 
      where: { email: req.body.email }, 
      attributes: { exclude: ['password','createdAt','updatedAt','deletedAt'] },
      raw: true,
    });
    
    if (organizer === null) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller could not be created!' });
    }

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }

    const token = jwt.sign(organizer, process.env.JWT_KEY, { expiresIn: '1000s'});
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

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const token = jwt.sign(seller, process.env.JWT_KEY, { expiresIn: '1000s'});
    return res.json({ token });
  }

  @validation(Joi.object({}))
  public static async getSeller(req: SellerRequest, res: Response): Promise<Response<{ seller: ISeller }>> {

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }
    return res.json({ seller: _.omit(seller, ['createdAt', 'updatedAt', 'deletedAt','password']) });
  }


  @validation(Joi.object({
    name:  Joi.string().required(),
    firstName:  Joi.string().required(),
    password:  Joi.string().optional(),
    businessName: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }))
  public static async updateSeller(req: SellerRequest, res: Response): Promise<Response<{ seller: ISeller }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as  ISeller;
    await Seller.update({ ...req.body }, { where:  { id: TokenSeller.id }});
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }, raw: true });
    return res.json({ seller: _.omit(seller, ['createdAt', 'updatedAt', 'deletedAt','password']) });
  }


  
  @validation(Joi.object({
    product: Joi.string().required(),
    date: Joi.date().required(),
    price: Joi.number().required(),
    instances: Joi.number().required(),
    description: Joi.string().required(),
    delivery: Joi.string().required(),
  }))
  public static async createNewInvitation(req: SellerRequest, res: Response): Promise<Response<{ invitation: IInvitation }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }, raw: false});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const invitation = await Invitation.create({
      product: req.body.product,
      date: req.body.date,
      price: req.body.price,
      instances: req.body.instances,
      delivery: req.body.delivery,
      description: req.body.description,
    });

    await seller.addInvitation(invitation);
    return res.json({ invitation: invitation });
  }

  @validation(Joi.object({}))
  public static async getSellerInvitations(req: SellerRequest, res: Response): Promise<Response<{ invitations: IInvitation[] }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as  ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const invitations = await SellerService.getSellerInvitations(seller);


    return res.json({ invitations: invitations });
  }

  @validation(Joi.object({
    id: Joi.number().required(),
  }))
  public static async deleteInvitation(req: SellerRequest, res: Response): Promise<Response<{ invitation: IInvitation }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const TokenSeller = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as ISeller;
    const seller = await Seller.findOne({ where: { id: TokenSeller.id }});
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'seller does not exist' });
    }

    const invitation = await Invitation.findByPk(req.body.id);
    
    const invitationSeller = await invitation?.getSeller();

    if ((invitationSeller != null) && (invitation != null) && (invitationSeller.id == seller.id)){
      const result = await invitation.update({active : false});
      
      return res.json({ invitation: result.get({plain: true}) });
    }
    else
    {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'No matching invitation found' });
    }

  }

} 