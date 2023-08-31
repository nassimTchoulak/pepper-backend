import { Buyer, Invitation, Seller } from "orms";
import { Gender, IBuyer, ISeller, UserStatus } from 'models/types';
import casual from 'casual';
import moment from "moment";

casual.define('gender', () => casual.boolean ? Gender.MAN : Gender.WOMAN );
casual.define('phoneNumber', () => casual.numerify('06########') );
casual.define('product', () => ({ name: casual.word, price: casual.integer(3, 20) }) );
casual.define('match_status', () => [
  UserStatus.Pending,
  UserStatus.Accepted,
][casual.integer(0, 1)]);

const createFakeBuyer = async (overrideProps?: Partial<IBuyer>): Promise<Buyer> => {
  const buyer = await Buyer.create({
    name: casual.first_name,
    firstName: casual.name,
    gender: (casual as unknown as any).gender,
    phoneNumber: (casual as unknown as any).phoneNumber,
    email: casual.email,
    password: casual.password,
    address: casual.address,
    ...(overrideProps ? overrideProps : {})
  });

  return buyer.get({ plain: true });
}

const createFakeSeller = async (password = casual.password as any): Promise<Seller> => {
  const seller = await Seller.create({
    phoneNumber: (casual as unknown as any).phoneNumber,
    firstName: casual.name,
    businessName: casual.username,
    email: casual.email,
    name: casual.name,
    password: password,
    location: casual.address,
    description: casual.description
  });

  return seller.get({ plain: true });
}

const createFakeInvitationWithSeller = async (): Promise<Invitation> => {
  const seller = await Seller.create({
    phoneNumber: (casual as unknown as any).phoneNumber,
    firstName: casual.name,
    businessName: casual.username,
    email: casual.email,
    name: casual.name,
    password: casual.password,
    location: casual.address,
    description: casual.description
  });

  const invitation = await Invitation.create({
    product: casual.name,
    date: moment(),
    price: casual.integer(0, 100),
    instances: casual.integer(20, 40),
    description: casual.description,
    delivery: casual.address2,
  });
  
  await seller.addInvitation(invitation);
  const createdInvitation = await Invitation.findOne({ where: { id: invitation.id }, raw: false });
  if (!createdInvitation) {
    throw 'Fake invitation creation failed';
  }
  return createdInvitation;
}

const createFakeInvitation = async (organizerInfo: Seller | ISeller): Promise<Invitation> => {

  const seller = await Seller.findOne({ where: { id: organizerInfo.id }, raw: false });

  const party = await Invitation.create({
    product: casual.name,
    date: moment(),
    price: casual.integer(0, 100),
    instances: casual.integer(20, 40),
    description: casual.description,
    delivery: casual.address2,
  });
  await seller?.addInvitation(party);
  const createdInvitation = await Invitation.findOne({ where: { id: party.id }, raw: false });
  if (!createdInvitation) {
    throw 'Fake invitation creation failed';
  }
  return createdInvitation;
}

// TO-DO: add fake transactions

export { createFakeInvitationWithSeller , createFakeBuyer , createFakeSeller , createFakeInvitation , casual as fake };
