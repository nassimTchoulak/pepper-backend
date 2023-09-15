import express, { Router } from 'express';
import { InvitationController } from 'services/invitation/invitation.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForBuyer, authorizeForSeller } from 'acls/acl';

class PartyRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    
    // only process operations for buyer 
    this._router.route('/create').post(authorizeForBuyer, checkParametersAndCallRoute(InvitationController.createTransactionFromInvitation));

    this._router.route('/pay').post(authorizeForBuyer, checkParametersAndCallRoute(InvitationController.payTheTransaction));

    this._router.route('/cancel').post(authorizeForBuyer, checkParametersAndCallRoute(InvitationController.createTransactionFromInvitation));

    // only process operation for seller
    // Accept transaction and choose delivery date /time
    // else if automatic select in invitation the auto delay : 
    this._router.route('/accept').post(authorizeForSeller, checkParametersAndCallRoute(InvitationController.createTransactionFromInvitation));
    this._router.route('/refuse').post(authorizeForSeller, checkParametersAndCallRoute(InvitationController.createTransactionFromInvitation));
    
    // admin & management operations

    // public operations
    this._router.route('/:uuid').get( checkParametersAndCallRoute(InvitationController.getPublicInvitationInfo));
    // validate a transaction
    this._router.route('/fulfill').post(checkParametersAndCallRoute(InvitationController.createTransactionFromInvitation));
  }
}

export default new PartyRoutes().build();
