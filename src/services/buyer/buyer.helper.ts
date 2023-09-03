import { Invitation } from "orms";
import { IInvitation } from 'models/types';
import _ from 'lodash';

/*
const normalizeUserMatches = (userMatches: Buyer[]): IMatch[] => {
  return userMatches.map((match: Buyer): IMatch => ({
    id: match.id,
    name: match.name,
    gender: match.gender,
    phoneNumber: match.phoneNumber,
    address: match.address,
    description: match.description,
    job: match.job,
    imgs: match.imgs,
    interests: match.interests,
    facebook: match.facebook,
    instagram: match.instagram,
    snapchat: match.snapchat,
    status: (match as unknown as any)['UserMatch.status'],
  }))
}
*/

const normalizeInvitations = (userParties: Invitation[]): IInvitation[] => {
  let normalizedInvitations = _.map(userParties, (invitation) => {
    return _.omit(invitation, ['updatedAt', 'deletedAt']) as unknown as IInvitation;
  });
  normalizedInvitations = _.filter(normalizedInvitations, (o:IInvitation) => { return o.id != undefined; });
  return normalizedInvitations;
}

export { normalizeInvitations };
