import { Buyer, Invitation } from "orms";
import { IInvitation, IMatch, IParty } from 'models/types';
import _ from 'lodash';

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

const normalizeInvitations = (userParties: Invitation[]): IInvitation[] => {
  const normalizedInvitations = _.map(userParties, (party) => {
   return _.omit(party, ['createdAt', 'updatedAt', 'deletedAt']) as unknown as IInvitation;
  });
  return normalizedInvitations;
}

export { normalizeUserMatches, normalizeInvitations };
