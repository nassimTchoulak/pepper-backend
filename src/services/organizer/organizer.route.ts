import express, { Router } from 'express';
import { OrganizerController } from 'services/organizer/organizer.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';
import { authorizeForSeller } from 'acls/acl';

class OrganizerRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/').get(authorizeForSeller,checkParametersAndCallRoute(OrganizerController.getOrganizer));
    this._router.route('/').put(authorizeForSeller,checkParametersAndCallRoute(OrganizerController.updateOrganizer));
    this._router.route('/login').put(checkParametersAndCallRoute(OrganizerController.subscribe));
    this._router.route('/login').post(checkParametersAndCallRoute(OrganizerController.login));
    this._router.route('/party').post(authorizeForSeller,checkParametersAndCallRoute(OrganizerController.createNewparty));
    this._router.route('/party').get(authorizeForSeller,checkParametersAndCallRoute(OrganizerController.getOrganizerParties));
    this._router.route('/party').delete(authorizeForSeller,checkParametersAndCallRoute(OrganizerController.deleteParty));
  }
}

export default new OrganizerRoutes().build();
