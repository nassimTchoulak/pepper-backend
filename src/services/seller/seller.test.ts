/* eslint-disable jest/no-commented-out-tests */
import request from 'supertest';
import app from 'index';
import httpStatus from 'http-status';
import { Seller } from 'orms';
import { createFakeSeller, createFakeInvitation, fake } from 'helpers/fake';
import { syncDbModels } from 'orms/pepperDb';
import { ISeller, IInvitation, DeliveryType, EntityStatus } from 'models/types';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { WILAYAS } from 'models/wilayas';

describe('## seller', () => {

  let sellerObject: Seller;
  const organizerPassword = fake.password;
  

  beforeAll(async () => {
    await syncDbModels();

    sellerObject  = await createFakeSeller(organizerPassword);

  });

   describe('# Login seller', () => {
    test('should NOT be able to login if userName is not provided', async () => {
      await request(app).post('/api/seller/login').send({ randomField: 'random' }).expect(httpStatus.BAD_REQUEST);
    });
  
    test('should NOT be able to login if organizer does not exist', async () => {
      await request(app).post('/api/seller/login').send({ email: 'test@gmail.com', password: '123456' }).expect(httpStatus.NOT_FOUND);
    });

    test('should be able to subscribe with email and Password', async () => {
      
      const sellerInfoTest = {
        name: fake.name,
        email: fake.email,
        firstName: fake.first_name,
        phoneNumber: fake.phone,
        password: fake.password,
        businessName: fake.title,
        location: fake.address,
        wilaya: WILAYAS[fake.integer(0, 48)],
        description: fake.description,
        code: "123456"
      };

      const { token } = (await request(app).put('/api/seller/login').send({ ...sellerInfoTest }).expect(httpStatus.OK)).body;
      const subscribedSeller = await Seller.findOne({ 
        where: { email: sellerInfoTest.email, password: sellerInfoTest.password },
        raw: true
      }) as Seller;
      
      if (!process.env.JWT_SELLER_KEY) {
        throw 'JWT key not provided';
      }

      const authentifiedUser = jwt.verify(token, process.env.JWT_SELLER_KEY) as ISeller;
      expect(subscribedSeller.id).toEqual(authentifiedUser.id); 
    });
    
    test('should be able to login with email and Password', async () => {
      const { token } = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword})).body;

      if (!process.env.JWT_SELLER_KEY) {
        throw 'JWT key not provided';
      }
      const authentifiedUser = jwt.verify(token, process.env.JWT_SELLER_KEY) as ISeller;
  
      expect(sellerObject.id).toEqual(authentifiedUser.id);
    });


    test('should not able to subscribe with same email twice', async () => {
      
      const sellerInfo2 = {
        name: fake.name,
        email: fake.email,
        firstName: fake.first_name,
        phoneNumber: fake.phone,
        password: fake.password,
        businessName: fake.title,
        location: fake.address,
        wilaya: WILAYAS[fake.integer(0, 48)],
        description: fake.description,
        code: "123456"
      };

      await request(app).put('/api/seller/login').send({ ...sellerInfo2 }).expect(httpStatus.OK);
      await request(app).put('/api/seller/login').send({ ...sellerInfo2 }).expect(httpStatus.UNAUTHORIZED);
      
    });

    test('should be able to query info with the right token', async () => {
      const { token } = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword}).expect(httpStatus.OK)).body;

      const  seller_1  = (await request(app).get(`/api/seller/`).
        set('Authorization', token).
        expect(httpStatus.OK)).body.seller;
      
      expect(seller_1.email).toEqual(sellerObject.email);
    });

    test('should NOT be able to query info with the wrong token', async () => {
      await request(app).get(`/api/seller/`).
        set('Authorization', 'wrongToken').
        expect(httpStatus.UNAUTHORIZED);
    });


  });

  describe('# Update Seller', () => {

    test('should be able to update seller', async () => {
      const newInfo = { 
        firstName: fake.first_name,
        location: fake.address,
        description: fake.description,
        name: fake.name,
        businessName: fake.name,
        // password: fake.password
      }
      const { token } = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword}).expect(httpStatus.OK)).body;
      const { seller } = (await request(app).put(`/api/seller/`).
        send(newInfo).
        set('Authorization', token).
        expect(httpStatus.OK)).body;
      expect({
        firstName: seller.firstName, 
        location: seller.location,
        description: seller.description,
      }
      ).toEqual({
        firstName: newInfo.firstName, 
        location: newInfo.location,
        description: newInfo.description,
      });
    });
  });

  
  describe('# seller invitation', () => {

    /*
    beforeAll( async() => {
      const { sellerToken } = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword}).expect(httpStatus.OK)).body;
    })
    */

    test('Should be able to get seller own invitations', async() => {

      const sellerTest = await createFakeSeller(organizerPassword)
  
      const p1 = await createFakeInvitation(sellerTest)
      const p2 = await createFakeInvitation(sellerTest)
  
      const result_req = (await request(app).post('/api/seller/login').
      send({ email: sellerTest.email, password: organizerPassword}).expect(httpStatus.OK));

      const testToken = result_req.body.token;
  
      const  parties  = (await request(app).get(`/api/seller/invitation`).
          set('Authorization', testToken).
          expect(httpStatus.OK)).body.invitations;
  
      expect(parties.length).toEqual(2);
      expect(parties[0].uuid).toEqual(p2.uuid);
      expect(parties[1].uuid).toEqual(p1.uuid);
      
    });
  
    test('Should be able to create new invitation for organizer', async() => {
  
      const partyTest = {
        product: fake.name,
        date: moment(),
        price: fake.integer(200, 1000),
        description: fake.description,
        storeWilaya : WILAYAS[fake.integer(0, 48)],
        storeLocation: fake.address2,
        deliveryType: DeliveryType.LOCAL_WILAYA_ONLY,
        localDeliveryPrice: 400,
        autoAccept: true,
        deliveryDelayHours: 24,
      }

      const { token } = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword})).body;

      const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
      send({...partyTest}).
      set('Authorization', token).
      expect(httpStatus.OK)).body.invitation;
  
      expect(invitation).toBeDefined();
      expect(invitation.product).toEqual(partyTest.product);
      expect(invitation.price).toEqual(partyTest.price);
      
    });

    
    test('Should be able to create delete invitation for seller', async() => {
  
      const partyTest = {
        product: fake.name,
        date: moment(),
        price: fake.integer(200, 1000),
        description: fake.description,
        storeWilaya : WILAYAS[fake.integer(0, 48)],
        storeLocation: fake.address2,
        deliveryType: DeliveryType.LOCAL_WILAYA_ONLY,
        localDeliveryPrice: 400,
        autoAccept: true,
        deliveryDelayHours: 24,
      }

      const { token } = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword})).body;

      const request_val = (await request(app).post(`/api/seller/invitation`).
      send({...partyTest}).
      set('Authorization', token).
      expect(httpStatus.OK));
      
      // console.log(request_val);
      
      const invitation: IInvitation = request_val.body.invitation;
  
      expect(invitation.active).toBe(EntityStatus.Pending);

      
      const req_reuslt = (await request(app).delete(`/api/seller/invitation`).
      send({ uuid: invitation.uuid}).
      set('Authorization', token));

      // console.log("@@z@", req_reuslt);

      const delete_invitation = req_reuslt.body.invitation;

      expect(delete_invitation.active).toEqual(EntityStatus.Rejected);
      
    });
    

  }) 
});