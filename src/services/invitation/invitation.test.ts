/* eslint-disable @typescript-eslint/no-unused-vars */
import request from 'supertest';
import app from 'index';
import httpStatus from 'http-status';
import { Buyer, Invitation, Seller } from 'orms';
import { createFakeBuyer, createFakeBuyerPassword, createFakeInvitationWithSeller, createFakeSeller, fake } from 'helpers/fake';
import { syncDbModels } from 'orms/pepperDb';
import 'dotenv/config';
import { DeliveryType, IInvitation, ITransaction, TransactionStatus } from 'models/types';
import { WILAYAS } from 'models/wilayas';
import moment from 'moment';
import { assert, error } from 'console';
 
describe('## Transaction', () => {
  let user: Buyer;
  let tokenOfUser1: string;
  let party1: Invitation;
  let party2: Invitation;

  // eslint-disable-next-line jest/no-commented-out-tests
  

  let sellerObject: Seller;
  let token_seller: string;
  let token_buyer: string;
  let buyerObjet: Buyer;
  let buyerObjet2: Buyer;
  const organizerPassword = fake.password;
  

  beforeAll(async () => {
    await syncDbModels();

    sellerObject  = await createFakeSeller(organizerPassword);
    buyerObjet  = await createFakeBuyerPassword(organizerPassword);
    buyerObjet2  = await createFakeBuyerPassword(organizerPassword);

    token_seller  = (await request(app).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword})).body.token;
    token_buyer = (await request(app).post('/api/buyer/login').send({ email: buyerObjet.email, phoneNumber:buyerObjet.phoneNumber, password: organizerPassword})).body.token
    assert(token_buyer !== undefined)
  });


  test('Should be able to create new invitation for seller', async() => {
  
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

    const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
    send({...partyTest}).
    set('Authorization', token_seller).
    expect(httpStatus.OK)).body.invitation;

    expect(invitation).toBeDefined();
    expect(invitation.product).toEqual(partyTest.product);
    expect(invitation.price).toEqual(partyTest.price);
    
  });


  test('Should be able to open transaction electronic type', async() => {
  
    const partyTest = {
      product: fake.name,
      date: moment(),
      price: fake.integer(200, 1000),
      description: fake.description,
      storeWilaya : WILAYAS[fake.integer(0, 48)],
      storeLocation: fake.address2,
      deliveryType: DeliveryType.NOT_NEEDED,
      localDeliveryPrice: 400,
      autoAccept: true,
      deliveryDelayHours: 24,
    }

    const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
    send({...partyTest}).
    set('Authorization', token_seller).
    expect(httpStatus.OK)).body.invitation;

    const transaction: ITransaction = (await request(app).post(`/api/invitation/create`).
    send({
      InvitationUuid: invitation.uuid,
      deliveryWilaya: WILAYAS[fake.integer(0, 48)],
      deliveryPlace: 'Cheraga'
    }).
    set('Authorization', token_buyer).
    expect(httpStatus.OK)).body.transaction;

    expect(transaction).toBeDefined()
    expect(transaction.state).toBe(TransactionStatus.ACCEPTED)
    expect(transaction.deliveryPrice).toBe(0)
    
  });


  test('Should be able to open transaction in same wilaya & accepted auto', async() => {
  
    const partyTest = {
      product: fake.name,
      date: moment(),
      price: fake.integer(200, 1000),
      description: fake.description,
      storeWilaya : '16- Alger',
      storeLocation: fake.address2,
      deliveryType: DeliveryType.BETWEEN_WILAYAS,
      localDeliveryPrice: 400,
      autoAccept: true,
      deliveryDelayHours: 24,
    }

    const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
    send({...partyTest}).
    set('Authorization', token_seller).
    expect(httpStatus.OK)).body.invitation;

    const transaction: ITransaction = (await request(app).post(`/api/invitation/create`).
    send({
      InvitationUuid: invitation.uuid,
      deliveryWilaya: '16- Alger',
      deliveryPlace: 'Cheraga'
    }).
    set('Authorization', token_buyer).
    expect(httpStatus.OK)).body.transaction;

    expect(transaction).toBeDefined()
    expect(transaction.state).toBe(TransactionStatus.ACCEPTED)
    expect(transaction.deliveryType).toBe(DeliveryType.LOCAL_WILAYA_ONLY)
    expect(transaction.deliveryPrice).toBe(partyTest.localDeliveryPrice)
    
  });


  test('Should be able to open transaction not auto accept when wilaya different', async() => {
  
    const partyTest = {
      product: fake.name,
      date: moment(),
      price: fake.integer(200, 1000),
      description: fake.description,
      storeWilaya : '16- Alger',
      storeLocation: fake.address2,
      deliveryType: DeliveryType.BETWEEN_WILAYAS,
      localDeliveryPrice: 400,
      autoAccept: true,
      deliveryDelayHours: 24,
    }

    const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
    send({...partyTest}).
    set('Authorization', token_seller).
    expect(httpStatus.OK)).body.invitation;

    const transaction: ITransaction = (await request(app).post(`/api/invitation/create`).
    send({
      InvitationUuid: invitation.uuid,
      deliveryWilaya: '17- Djelfa',
      deliveryPlace: 'Cheraga'
    }).
    set('Authorization', token_buyer).
    expect(httpStatus.OK)).body.transaction;

    expect(transaction).toBeDefined()
    expect(transaction.state).toBe(TransactionStatus.OPENED)
    
  });



  // eslint-disable-next-line jest/expect-expect
  test('Should NOT be able to open transaction different wilaya for local', async() => {
  
    const partyTest = {
      product: fake.name,
      date: moment(),
      price: fake.integer(200, 1000),
      description: fake.description,
      storeWilaya : '16- Alger',
      storeLocation: fake.address2,
      deliveryType: DeliveryType.LOCAL_WILAYA_ONLY,
      localDeliveryPrice: 400,
      autoAccept: true,
      deliveryDelayHours: 24,
    }

    const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
    send({...partyTest}).
    set('Authorization', token_seller).
    expect(httpStatus.OK)).body.invitation;

    (await request(app).post(`/api/invitation/create`).
    send({
      InvitationUuid: invitation.uuid,
      deliveryWilaya: '17- Djelfa',
      deliveryPlace: 'Cheraga'
    }).
    set('Authorization', token_buyer).
    expect(httpStatus.UNAUTHORIZED))

    
  });

});
