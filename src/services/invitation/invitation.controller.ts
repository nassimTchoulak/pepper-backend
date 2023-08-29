import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Buyer } from 'orms';
import httpStatus from 'http-status';
import { UserService } from 'services/buyer/buyer.service';
import 'dotenv/config';
import { IParty } from 'models/types';

interface UserRequest extends Request {
  user: Buyer
};

export class PartyController {
  // TODO: add pagination
  @validation(Joi.object({}))
  public static async getPartiesThatUserCanGoTo(req: UserRequest, res: Response): Promise<Response<{ parties: IParty[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id }});

    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    const normalizedParties = await UserService.getPartiesUserCanGoTo(user);
    return res.json({ parties: normalizedParties });
  }
}