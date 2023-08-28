import { Buyer, Seller, Invitation } from 'orms';
import { syncDbModels } from 'orms/pepperDb';
import { fake, createFakeBuyer } from 'helpers/fake';
import { SHA256 } from 'crypto-js';
import moment from "moment";

const numberOfBuyersToAdd = 50;
const numberOfSellersToAdd = 3;

describe('## Init Data', () => {
  let buyers: Buyer[];
  let sellers: Seller[];

  beforeAll(async () => {
    await syncDbModels();
  });

  test('Add Buyers', async () => {
    const fakeUsersData = await Promise.all([...Array(numberOfBuyersToAdd).keys()].map(async () => createFakeBuyer()));
    buyers = await Buyer.findAll();
    expect(fakeUsersData).toBeTruthy();
  });

  test('Add sellers', async () => {
    const fakeSellersData = [...Array(numberOfSellersToAdd).keys()].map(() => ({
      phoneNumber: (fake as unknown as any).phoneNumber,
      firstName: fake.name,
      businessName: fake.username,
      email: fake.email,
      name: fake.name,
      password: SHA256(fake.password),
      location: fake.address,
      description: fake.description
    }));

    sellers = await Promise.all(
      fakeSellersData.map(async (organizerData) => {
        const createdUser = await Seller.create(organizerData);
        return createdUser;
      })
    );
    expect(sellers).toBeTruthy();
  });

  test('Add invitation to seller', async () => {
    const maxNumberOfParties = 5;
    const minNumberOfParties = 0;
    await Promise.all(
      sellers.map(async (seller_) => {
        const numberOfParties = fake.integer(minNumberOfParties, maxNumberOfParties);
        for await (let i of [...Array(numberOfParties).keys()]) {
         const invitation = await Invitation.create({
            product: fake.name,
            date: moment(),
            price: fake.integer(0, 100),
            instances: fake.integer(20, 40),
            description: fake.description,
            delivery: fake.address2,
          });
          await seller_.addInvitation(invitation);
        }
      })
    );
  });

  //TO-DO:  add transaction to users

});