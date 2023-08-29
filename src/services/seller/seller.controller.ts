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

interface SellerRequest extends Request {
  seller: Seller
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
      name: req.body.userName,
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
      return res.json({ message: 'Organizer could not be created!' });
    }

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }

    const token = jwt.sign(organizer, process.env.JWT_KEY);
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
      return res.json({ message: 'Organizer does not exist' });
    }

    // TO-DO : update policy for allowed logins (maybe pending or Accepted)
    const isAuthorized = seller.status === UserStatus.Accepted;

    if (!isAuthorized) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Organizer not validated yet' });
    }

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const token = jwt.sign(seller, process.env.JWT_KEY);
    return res.json({ token });
  }

  @validation(Joi.object({}))
  public static async getSeller(req: SellerRequest, res: Response): Promise<Response<{ seller: ISeller }>> {
    const seller = await Seller.findOne({ where: { id: req.seller.id }, raw: true });
    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Organizer does not exist' });
    }
    return res.json({ seller: _.omit(seller, ['createdAt', 'updatedAt', 'deletedAt','password']) });
  }


  @validation(Joi.object({
    name:  Joi.string().required(),
    firstName:  Joi.string().required(),
    password:  Joi.string().required(),
    businessName: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }))
  public static async updateSeller(req: SellerRequest, res: Response): Promise<Response<{ seller: ISeller }>> {
    await Seller.update({ ...req.body }, { where:  { id: req.seller.id }});
    const seller = await Seller.findOne({ where: { id: req.seller.id }, raw: true });
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
  public static async createNewInvitation(req: SellerRequest, res: Response): Promise<Response<{ parties: IInvitation[] }>> {
    const seller = await Seller.findOne({ where: { id: req.seller.id }});

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

    await seller.addInvitations(invitation);
    const normalizedParties = await SellerService.getSellerInvitations(seller)
    return res.json({ invitations: normalizedParties });
  }

  @validation(Joi.object({}))
  public static async getSellerInvitations(req: SellerRequest, res: Response): Promise<Response<{ parties: IInvitation[] }>> {
    const seller = await Seller.findOne({ where: { id: req.seller.id }});

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const invitations = await SellerService.getSellerInvitations(seller)
    return res.json({ parties: invitations });
  }

  @validation(Joi.object({
    invitationId: Joi.number().required(),
  }))
  public static async deleteInvitation(req: SellerRequest, res: Response): Promise<Response<{ parties: IInvitation[] }>> {
    const seller = await Seller.findOne({ where: { id: req.seller.id }});


    const invitation = await Invitation.findByPk(req.body.invitationId);
    
    const invitationSeller = await invitation?.getSeller();

    if ((invitationSeller != undefined) && (invitation != null) && (invitationSeller.id == req.seller.id)){
      await invitation.destroy();
    }

    if (!seller) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    const remainingInvitations = await SellerService.getSellerInvitations(seller)
    return res.json({ invitations: remainingInvitations });
  }

} 