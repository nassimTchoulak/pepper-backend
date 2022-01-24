import express, { Router } from 'express';
import { OrganizerController } from 'services/organizer/organizer.controller';
import { checkParametersAndCallRoute } from 'helpers/helpers';

class OrganizerRoutes {
  public _router: Router = express.Router();

  public build() {
    this._assignRoute();
    return this._router;
  }

  private _assignRoute() {
    this._router.route('/login').post(checkParametersAndCallRoute(OrganizerController.login));
  }
}

export default new OrganizerRoutes().build();