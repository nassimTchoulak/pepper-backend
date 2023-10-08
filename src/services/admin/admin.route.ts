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
    // add a note to a transaction
    this._router.route('/note').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.addNoteToTransaction));

    // get the money that should be given to each party
    this._router.route('/get_closing_info').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getClosingInfoPrice));
    // accountant closing the transaction
    this._router.route('/close').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.closeTransaction));

    // more detail to make decision
    this._router.route('/seller_history').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getSellerHistory));
    this._router.route('/buyer_history').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getBuyerHistory));
    this._router.route('/transaction').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getTransactionDetail));

    // dash board of logs Closings, decisions
    this._router.route('/actions').get(authorizeForAdmin, checkParametersAndCallRoute(AdminController.getActionsHistory));

    // manage sellers & invitation
    this._router.route('/validate_invitation').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.approveInvitation));
    this._router.route('/block_invitation').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.rejectInvitation));
    // seller delete
    this._router.route('/delete_seller').post(authorizeForAdmin, checkParametersAndCallRoute(AdminController.rejectSeller));

  }
}

export default new AdminRoutes().build();
