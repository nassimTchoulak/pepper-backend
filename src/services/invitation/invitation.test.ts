/* eslint-disable @typescript-eslint/no-unused-vars */
import request from 'supertest';
import app from 'index';
import httpStatus from 'http-status';
import { Buyer, Invitation } from 'orms';
import { createFakeBuyer, createFakeInvitationWithSeller } from 'helpers/fake';
import { syncDbModels } from 'orms/pepperDb';
import 'dotenv/config';
import { } from 'models/types';
 
describe('## Party', () => {
  let user: Buyer;
  let tokenOfUser1: string;
  let party1: Invitation;
  let party2: Invitation;

  // eslint-disable-next-line jest/no-commented-out-tests
  

  beforeAll(async () => {
    await syncDbModels();
    /*
    user = await createFakeBuyer();
    party1 = await createFakeInvitationWithSeller();
    party2 = await createFakeInvitationWithSeller();
    await (await Buyer.findOne({ where: { id: user.id }}))?.addParty(party1);
    const { token } = (await request(app).post('/api/user/login').send({ phoneNumber: user.phoneNumber, code: '123456' }).expect(httpStatus.OK)).body;
    tokenOfUser1 = token*/

  });

  /*
  test('Should be able to get party that the user is not going to', async() => {
    const partiesUserCanGoTo = (await request(app).get(`/api/party`).
    set('Authorization', tokenOfUser1).
    expect(httpStatus.OK)).body.parties;

    expect(partiesUserCanGoTo.map((p: IParty) => p.id )).toEqual([party2.id]);
  });
  */
  test('Basic Test 0', async() => {
    await request(app).get(`/api/admin`).
        set('Authorization', 'wrongToken').
        expect(httpStatus.OK);
  });

});
