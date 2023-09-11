import express, { Router } from 'express';
import { InvitationController } from 'services/invitation/invitation.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForBuyer } from 'acls/acl';

class PartyRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/').get(authorizeForBuyer,checkParametersAndCallRoute(InvitationController.getPartiesThatUserCanGoTo));
    this._router.route('/create').post(authorizeForBuyer,checkParametersAndCallRoute(InvitationController.createTransactionFromInvitation));
    
  }
}

export default new PartyRoutes().build();
