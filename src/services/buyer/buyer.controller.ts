import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Buyer, Invitation, Seller } from 'orms';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { Gender, IBuyer, IBuyerBase, IInvitation, ITransaction, ITransactionNoSeller, ITransactionWithSeller, UserStatus } from 'models/types';
import _, { includes } from 'lodash';
import 'dotenv/config';
import AuthHelper from 'helpers/auth';
import { Op, where } from 'sequelize';
import { sendEmailVerificationCodeBuyer } from 'services/mailer/mailer';
import { Transaction } from 'orms/transaction.orm';
import { BuyerVisibility } from 'models/attributes.visibility';

interface UserRequest extends Request {
  user: Buyer
};

export class BuyerController {
  @validation(Joi.object({
    phoneNumber: Joi.string().required(),
    email: Joi.string().required(),
  }))
  public static async createLoginVerificationAndCheckIfUserExisits(req: Request, res: Response): Promise<Response<{ userExists: boolean }>> {
    const user = await Buyer.findOne({ where: {[Op.or]: [
      { phoneNumber: req.body.phoneNumber },
      { email: req.body.email }
    ]} , raw: true})
    // FIX: fix type
    await AuthHelper.createVerification(req.query.phoneNumber as string);
    return res.json({ userExists: !!user });
  }

  @validation(Joi.object({
    phoneNumber: Joi.string().required(),
    email: Joi.string().required(),
    code: Joi.string().required(),
    name: Joi.string().required(),
    firstName: Joi.string().required(),
    password: Joi.string().required(),
    birthDay: Joi.date().required(),
    gender: Joi.string().valid(...Object.values(Gender)).required(),
    address: Joi.string().optional(),
    description: Joi.string().optional(),
  }))
  public static async subscribe(req: Request, res: Response): Promise<Response<{ token: string }>> {
    const isVerified = await AuthHelper.checkVerification(req.body.phoneNumber, req.body.code);
    const buyerTest = await Buyer.findOne({ where: {[Op.or]: [
      { phoneNumber: req.body.phoneNumber },
      { email: req.body.email }
    ]} , raw: true})

    if (buyerTest !== null) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'phoneNumber or email already exists' });
    }

    if (!isVerified) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'Verification code not valid' });
    }

    await Buyer.create({
      email: req.body.email,
      name: req.body.name,
      firstName: req.body.firstName,
      password: req.body.password,
      birthDay: req.body.birthDay,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      description: req.body.description,
    });

    const user = await Buyer.findOne({ where: { phoneNumber: req.body.phoneNumber }, raw: true});
    
    if (!user) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      return res.json({ message: 'User could not be created!' });
    }

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }

    // TO-DO send email here
    sendEmailVerificationCodeBuyer(user.email, user.emailCode, user.firstName);

    const token = jwt.sign(user, process.env.JWT_KEY, {expiresIn: "24h"});
    return res.json({ token });
  }

  @validation(Joi.object({
    email: Joi.string().required().allow(''),
    phoneNumber: Joi.string().required().allow(''),
    password: Joi.string().required(),
  }))
  public static async login(req: Request, res: Response): Promise<Response<{ token: string }>> {
    const user = await Buyer.findOne({ where: {[Op.or]: [
      { phoneNumber: req.body.phoneNumber },
      { email: req.body.email }
    ]} , raw: true})

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }

    if (user === null) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'User does not exist' });
    }

    if (user.status !== UserStatus.Accepted) {
      // send tmp token
      const token = jwt.sign(user, process.env.JWT_KEY, {expiresIn:"24h"});
      return res.json({ token });
    }

    const token = jwt.sign(user, process.env.JWT_KEY, {expiresIn:"24h"});
    return res.json({ token });
  }

  @validation(Joi.object({
    emailCode: Joi.number().required()
  }))
  public static async validateEmail(req: UserRequest, res: Response): Promise<Response<{ token: string }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;

    // nothing to activate
    if (buyer.status != UserStatus.Pending)
    {
      return res.json({ token: req.headers.authorization || "" });
    }
    const user = await Buyer.findOne({ where: { email: buyer.email}, raw: false });
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
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const user_data = user.get({plain: true});
    const token = jwt.sign(user_data, process.env.JWT_KEY);
    return res.json({ token });
  }

  @validation(Joi.object({}))
  public static async getBuyer(req: UserRequest, res: Response): Promise<Response<{ user: IBuyerBase }>> {

    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;
    const user = await Buyer.findOne({ where: { email: buyer.email }, raw: true });
    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    // TO-DO: omit password
    return res.json({ user: BuyerVisibility.adaptBuyerToBuyer(user) });
  }

  @validation(Joi.object({
    address: Joi.string().optional(),
    description: Joi.string().optional(),
    name: Joi.string().optional(),
    firstName: Joi.string().optional(),
    birthday: Joi.date().optional(),
    password: Joi.string().optional(),
  }))
  public static async updateBuyer(req: UserRequest, res: Response): Promise<Response<{ user: IBuyer }>> {
    // use token
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;
    await Buyer.update({ ...req.body }, { where:  { email: buyer.email }});
    const user = await Buyer.findOne({ where: { id: buyer.id }, raw: true });
    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    return res.json({ user: BuyerVisibility.adaptBuyerToBuyer(user) });
  }



  /***
   * Transaction Getter for Buyer
   */
  @validation(Joi.object({}))
  public static async getAllTransactions(req: UserRequest, res: Response): Promise<Response<{ transactions: ITransactionNoSeller[] }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;

    const transactions = await Transaction.findAll({ where: {BuyerId: buyer.id}, 
      include: [{model: Invitation, as:'Invitation'} ], raw: true, nest: true})

    return res.json({transactions: BuyerVisibility.adaptListOfTransactionNoSellerToBuyer(transactions)})
  }

  @validation(Joi.object({
    uuid: Joi.string().required()
  }))
  public static async getTransactionDetail(req: UserRequest, res: Response): Promise<Response<{ transaction: ITransactionWithSeller }>> {
    if (!process.env.JWT_KEY) {
      throw 'JWT key not provided';
    }
    const buyer = jwt.verify(req.headers.authorization || "", process.env.JWT_KEY) as unknown as IBuyer;

    const transaction = await Transaction.findOne({ where :{uuid: req.body.uuid, BuyerId: buyer.id}, 
      include: [{model: Invitation, as:'Invitation', include:[{model: Seller, as: 'Seller'}]}], raw: true, nest: true })
    
    if (transaction === null) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'transaction does not exist for user' });
    }
    return res.json({transaction : BuyerVisibility.adaptTransactionWithSellerToBuyer(transaction)})
  }
  /*
  @validation(Joi.object({}))
  public static async getMatches(req: UserRequest, res: Response): Promise<Response<{ matches: Buyer[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id }});

    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }

    const normalizedMatches = await BuyerService.getUserMatches(user);
    return res.json({ matches: normalizedMatches });
  }

  // TODO: test adding match removing it and add it again
  @validation(Joi.object({
    matchId: Joi.number().required(),
  }))
  public static async addMatch(req: UserRequest, res: Response): Promise<Response<{ matches: Buyer[] }>> {
    const match = await Buyer.findOne({ where: { id: req.body.matchId } });
    const user = await Buyer.findOne({ where: { id: req.user.id }});
    if (!match || !user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Match or User does not exist' });
    }
    await user.addMatch(match);
    await BuyerService.updateUserMatchStatus(user, match);
    const normalizedMatches = await BuyerService.getUserMatches(user);
    return res.json({ matches: normalizedMatches });
  }

  // TODO: Test this route
  @validation(Joi.object({
    matchId: Joi.number().required(),
  }))
  public static async deleteMatch(req: UserRequest, res: Response): Promise<Response<{ matches: Buyer[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id } });
    const match = await Buyer.findOne({ where: { id: req.body.matchId } });

    if (!user || !match) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User or Match does not exist' });
    }

    user.removeMatch(match);
    match.removeMatch(user);

    const normalizedMatches = await BuyerService.getUserMatches(user);
    return res.json({ matches: normalizedMatches });
  }

  @validation(Joi.object({}))
  public static async getParties(req: UserRequest, res: Response): Promise<Response<{ parties: IParty[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id }});

    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    const normalizedParties = await BuyerService.getUserParties(user);
    return res.json({ parties: normalizedParties });
  }

  // TODO: add pagination
  @validation(Joi.object({}))
  public static async getPartiesThatUserCanGoTo(req: UserRequest, res: Response): Promise<Response<{ parties: IParty[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id }});

    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    const normalizedParties = await BuyerService.getPartiesUserCanGoTo(user);
    return res.json({ parties: normalizedParties });
  }

  @validation(Joi.object({
    partyId: Joi.number().required(),
  }))
  public static async addParty(req: UserRequest, res: Response): Promise<Response<{ parties: IParty[] }>> {
    const party = await Invitation.findOne({ where: { id: req.body.partyId } });
    const user = await Buyer.findOne({ where: { id: req.user.id }});

    if (!party || !user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Party or User does not exist' });
    }
    await BuyerService.addParty(user, party);
    const normalizedParties = await BuyerService.getUserParties(user);
    return res.json({ parties: normalizedParties });
  }

  @validation(Joi.object({
    organizerId: Joi.number().required(),
  }))
  public static async attendParty(req: UserRequest, res: Response): Promise<Response<{ parties: IParty[] }>> {
    const organizer = await Seller.findOne({ where: { id: req.body.organizerId } });

    // get today's party
    const organizerParties = await organizer?.getInvitations({ where:
      {
        // is today
        date: {
          [Op.gte]: moment().startOf('day').toDate(),
          [Op.lte]: moment().endOf('day').toDate(),
        },
      },
    });

    if (!organizerParties) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Party does not exist' });
    }
    const user = await Buyer.findOne({ where: { id: req.user.id }});
    const party = organizerParties[0];
    if (!party || !user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Party or User does not exist' });
    }

    const hasUserBeenAcceptedToAttend = await UserParty.findOne(
      { where: { 
        [Op.and]: [
          { UserId: user.id },
          { PartyId: party.id },
          { status: TransactionStatus.ACCEPTED },
        ],
        },
      },
    );
    if (!hasUserBeenAcceptedToAttend) {
      res.status(httpStatus.UNAUTHORIZED);
      return res.json({ message: 'User has not been accepted to attend the party' });
    }
    // TODO: test this logic
    await UserParty.update(
      { status: TransactionStatus.ATTENDED },
      { where: { 
        [Op.and]: [
          { UserId: user.id },
          { PartyId: party.id },
        ],
        },
      },
    );
    const normalizedParties = await BuyerService.getUserParties(user);
    return res.json({ parties: normalizedParties });
  }

  @validation(Joi.object({
    partyId: Joi.number().required(),
  }))
  public static async cancelParty(req: UserRequest, res: Response): Promise<Response<{ parties: IParty[] }>> {
    const party = await Invitation.findOne({ where: { id: req.body.partyId } });
    const user = await Buyer.findOne({ where: { id: req.user.id }});

    if (!party || !user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'Party or User does not exist' });
    }

    await user.removeParty(party);
    const normalizedParties = await BuyerService.getUserParties(user);
    return res.json({ parties: normalizedParties });
  }
  */
}