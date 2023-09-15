import express, { Router } from 'express';
import { SellerController } from 'services/seller/seller.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForSeller } from 'acls/acl';

class SellerRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/').get(authorizeForSeller,checkParametersAndCallRoute(SellerController.getSeller));
    this._router.route('/').put(authorizeForSeller,checkParametersAndCallRoute(SellerController.updateSeller));
    this._router.route('/login').put(checkParametersAndCallRoute(SellerController.subscribe));
    this._router.route('/login').patch(authorizeForSeller, checkParametersAndCallRoute(SellerController.validateSellerEmail));
    this._router.route('/login').post(checkParametersAndCallRoute(SellerController.login));

    this._router.route('/invitation').post(authorizeForSeller,checkParametersAndCallRoute(SellerController.createNewInvitation));
    this._router.route('/invitation').get(authorizeForSeller,checkParametersAndCallRoute(SellerController.getSellerInvitations));
    this._router.route('/invitation').delete(authorizeForSeller,checkParametersAndCallRoute(SellerController.deleteInvitation));

    this._router.route('/invitation/detail').get(authorizeForSeller,checkParametersAndCallRoute(SellerController.getSellerOneInvitation));
    this._router.route('/invitation/transaction').get(authorizeForSeller,checkParametersAndCallRoute(SellerController.getSellerOneTransaction));
  }
}

export default new SellerRoutes().build();
