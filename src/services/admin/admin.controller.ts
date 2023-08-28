import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Seller } from 'orms';
import { UserStatus } from 'models/types';
import 'dotenv/config';
import _ from 'lodash';

export class AdminController {

  @validation(Joi.object({
    id: Joi.number().required(),
    status: Joi.string().valid(UserStatus.Pending, UserStatus.Accepted, UserStatus.Rejected).required(),
  }))
  public static async updateStatus(req: Request, res: Response): Promise<Response<{ token: string }>> {
    await Seller.update({ status: req.body.status }, { where:  { id: req.body.id }});
    const organizer = await Seller.findOne({ where: { id: req.body.id }, raw: true });
    return res.json({ organizer: _.omit(organizer, ['createdAt', 'updatedAt', 'deletedAt','password']) });
  }
} 