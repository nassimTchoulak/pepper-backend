import { IParty } from "models/types";
import { Seller } from "orms";
import { normalizeOrganizerParties } from "services/user/user.helper";

export class OrganizerService{
  
  public static async getOrganizerParties(organizer: Seller): Promise<IParty[]>{

    const parties = await organizer.getInvitations({ order: [ [ 'createdAt', 'DESC' ] ] });

    const partiesWithOrganizers = parties.map((currentParty) => {
        return { ...organizer.get({ plain: true }), ...currentParty.get({ plain: true }) };
    })
    // reused since it produce IParty
    const normalizedParties = normalizeOrganizerParties(partiesWithOrganizers);
    return normalizedParties;
  }

}