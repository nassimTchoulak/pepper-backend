import express, { Router } from 'express';
import { AdminController } from 'services/admin/admin.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForAdmin } from 'acls/acl';

class AdminRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.dummyMethod));
    this._router.route('/').put(checkParametersAndCallRoute(AdminController.generateAdminToken));
    
    // include fulfilled transactions
    // view the claims that requires a decision FuLfilledHold + payed only
    this._router.route('/ongoing_claims').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getOngoingClaims));

    // path to use by accountant to pay up operations
    this._router.route('/ongoing_payed_canceled').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getOngoingPayedCanceled));
    // await 12h to send the money in case
    // fulfilled continue and fulfilled with updatedAt 2h ago at least
    this._router.route('/ongoing_fulfilled').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getOngoingPayedFulfilled));

    // decisions to be made
    this._router.route('/decide').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.decideOnTransaction));

    // accountant closing the transaction
    this._router.route('/close').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.closeTransaction));

    // more detail to make decision
    this._router.route('/seller_history').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getSellerHistory));
    this._router.route('/buyer_history').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getBuyerHistory));
    this._router.route('/transaction').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getTransactionDetail));

    // dash board of logs Closings, decisions
    this._router.route('/actions').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getActionsHistory));
  }
}

export default new AdminRoutes().build();
