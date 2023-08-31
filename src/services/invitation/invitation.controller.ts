import { Request, Response } from 'express';
import Joi from 'joi';
import { validation } from 'helpers/helpers';
import { Buyer } from 'orms';
import httpStatus from 'http-status';
// import { UserService } from 'services/buyer/buyer.service';
import 'dotenv/config';
import { IInvitation } from 'models/types';

interface UserRequest extends Request {
  user: Buyer
};

export class InvitationController {
  // TODO: add pagination
  @validation(Joi.object({}))
  public static async getPartiesThatUserCanGoTo(req: UserRequest, res: Response): Promise<Response<{ parties: IInvitation[] }>> {
    const user = await Buyer.findOne({ where: { id: req.user.id }});
    user?.addInvitation()

    if (!user) {
      res.status(httpStatus.NOT_FOUND);
      return res.json({ message: 'User does not exist' });
    }
    // const normalizedParties = await UserService.getPartiesUserCanGoTo(user);
    return res.json({ parties: [] });
  }
}