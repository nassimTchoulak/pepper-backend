import express, { Router } from 'express';
import { UserController } from 'services/buyer/buyer.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForBuyer } from 'acls/acl';

class UserRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/').get(authorizeForBuyer,checkParametersAndCallRoute(UserController.getUser));
    this._router.route('/').put(authorizeForBuyer,checkParametersAndCallRoute(UserController.updateUser));
    this._router.route('/login').get(checkParametersAndCallRoute(UserController.createLoginVerificationAndCheckIfUserExisits));
    this._router.route('/login').put(checkParametersAndCallRoute(UserController.subscribe));
    this._router.route('/login').post(checkParametersAndCallRoute(UserController.login));
    this._router.route('/matches').get(authorizeForBuyer,checkParametersAndCallRoute(UserController.getMatches));
    this._router.route('/matches').post(authorizeForBuyer,checkParametersAndCallRoute(UserController.addMatch));
    this._router.route('/matches').delete(authorizeForBuyer,checkParametersAndCallRoute(UserController.deleteMatch));
    this._router.route('/parties').get(authorizeForBuyer,checkParametersAndCallRoute(UserController.getParties));
    this._router.route('/parties').post(authorizeForBuyer,checkParametersAndCallRoute(UserController.addParty));
    this._router.route('/parties').put(authorizeForBuyer,checkParametersAndCallRoute(UserController.attendParty));
    this._router.route('/parties').delete(authorizeForBuyer,checkParametersAndCallRoute(UserController.cancelParty));
  }
}

export default new UserRoutes().build();
