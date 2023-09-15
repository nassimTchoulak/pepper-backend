import express, { Router } from 'express';
import { BuyerController } from 'services/buyer/buyer.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForBuyer } from 'acls/acl';

class UserRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/').get(authorizeForBuyer,checkParametersAndCallRoute(BuyerController.getBuyer));
    this._router.route('/').put(authorizeForBuyer,checkParametersAndCallRoute(BuyerController.updateBuyer));
    /**
     * The process to authentication is performed in 3 steps:
     * 0- get request to be sure that phone and email are not taken
     * 1- subscribe with valid phone code to validate subscription -> tmp_token with status==pending
     * 2- validate the email using tmp_token -> real_token
     * 
     * if login is done:
     * sign and return the token since token contains status
     */
    this._router.route('/login').get(checkParametersAndCallRoute(BuyerController.createLoginVerificationAndCheckIfUserExisits));
    this._router.route('/login').put(checkParametersAndCallRoute(BuyerController.subscribe));
    this._router.route('/login').patch(authorizeForBuyer ,checkParametersAndCallRoute(BuyerController.validateEmail));
    this._router.route('/login').post(checkParametersAndCallRoute(BuyerController.login));


    /**
     * Invitations and transaction routes
     */
    this._router.route('/transactions').get(authorizeForBuyer ,checkParametersAndCallRoute(BuyerController.getAllTransactions));
    this._router.route('/transaction').get(authorizeForBuyer ,checkParametersAndCallRoute(BuyerController.getTransactionsDetail));
  }
}

export default new UserRoutes().build();
