import _ from "lodash";
import { IInvitation, ISellerBase } from "models/types";
import { Seller } from "orms";
import { normalizeInvitations } from "services/buyer/buyer.helper";

export class SellerService{
  
  public static async getSellerInvitations(seller: Seller): Promise<IInvitation[]>{

    const invitations = await seller.getInvitations({ order: [ [ 'createdAt', 'DESC' ] ], raw: true});

    /*const partiesWithOrganizers = invitations.map((currentParty) => {
        return {...currentParty.get({ plain: true }) };
    })*/
    // TO-DO add clients maybe
    const normalizedParties = normalizeInvitations(invitations);
    return normalizedParties;
  }

  public static cleanSellerToSend(user: Seller | null): ISellerBase {
    return _.omit(user, ['createdAt', 'deletedAt', 'updatedAt', 'password', 'birthDay', 'emailCode']) as unknown as ISellerBase
  }
  

}