import { Buyer, Seller, Invitation } from 'orms';
import { syncDbModels } from 'orms/pepperDb';
import { fake, createFakeBuyerPassword } from 'helpers/fake';
import { SHA256 } from 'crypto-js';
import moment from "moment";
import request from 'supertest';
import { WILAYAS } from '../models/wilayas';
import app from '../index';
import httpStatus from 'http-status';
import { DeliveryType, IInvitation, ITransaction } from '../models/types'

const numberOfBuyersToAdd = 10;
const numberOfSellersToAdd = 8;
const numberOfInvitationToAdd = 20;

const numberFulfilledTransaction = 20;
const numberPayedTransaction = 30;

describe('## Init Data', () => {

  let sellers_tokens: string[] = []
  let buyers_tokens: string[] = []
  let invitations: {invitation : IInvitation, seller_token: string }[] = []
  // let fulfilled_transaction: {invitation : IInvitation, seller_token: string, buyer_token: string, transaction: ITransaction }[] = []
  const globalPassword = "test1256fd";

  beforeAll(async () => {
    await syncDbModels();
  });


  test('Add Data', async () => {

    for (let i=0; i < numberOfBuyersToAdd; i++) {
      const buyerInfo = {
        name: fake.first_name,
        firstName: fake.name,
        gender: (fake as unknown as any).gender,
        phoneNumber: (fake as unknown as any).phoneNumber,
        email: fake.email,
        password: globalPassword,
        address: fake.address,
        wilaya: WILAYAS[fake.integer(0,25)],
        birthDay: moment()
      };

      let tmp_token: string = (await request(app).put('/api/buyer/login').send({ ...buyerInfo, code: '123456' }).expect(httpStatus.OK)).body.token;
      buyers_tokens.push(tmp_token)
    }


    for (let i=0; i < numberOfSellersToAdd; i++) { 
      const sellerInfoTest = {
        name: fake.name,
        email: fake.email,
        firstName: fake.first_name,
        phoneNumber: fake.phone,
        password: globalPassword,
        businessName: fake.title,
        location: fake.address,
        wilaya: WILAYAS[fake.integer(0, 48)],
        description: fake.description,
        code: "123456"
      };
  
      let tmp_token: string = (await request(app).put('/api/seller/login').send({ ...sellerInfoTest }).expect(httpStatus.OK)).body.token
      sellers_tokens.push(tmp_token)
    }

    for (let i=0; i < numberOfInvitationToAdd; i++) { 
      const partyTest = {
        product: fake.word,
        date: moment(),
        price: fake.integer(200, 1000),
        description: fake.description,
        storeWilaya : WILAYAS[fake.integer(0, 48)],
        storeLocation: fake.address2,
        deliveryType: DeliveryType.LOCAL_WILAYA_ONLY,
        localDeliveryPrice: 400,
        autoAccept: false,
        deliveryDelayHours: 24,
      }
      const seller_token = sellers_tokens[fake.integer(0, sellers_tokens.length - 1)]
      const invitation: IInvitation = (await request(app).post(`/api/seller/invitation`).
      send({...partyTest}).
      set('Authorization', seller_token).
      expect(httpStatus.OK)).body.invitation;
      invitations.push({invitation: invitation, seller_token: seller_token})
    }

    // add fulfilled transactions
    for (let i=0; i < numberFulfilledTransaction; i++) { 
      const token_buyer = buyers_tokens[fake.integer(0, buyers_tokens.length - 1)]
      const full_invitation = invitations[fake.integer(0, invitations.length - 1)];
  
      const transaction: ITransaction = (await request(app).post(`/api/invitation/create`).
      send({
        InvitationUuid: full_invitation.invitation.uuid,
        deliveryWilaya: full_invitation.invitation.storeWilaya,
        deliveryPlace: 'Cheraga'
      }).
      set('Authorization', token_buyer).
      expect(httpStatus.OK)).body.transaction;
  
      (await request(app).post(`/api/invitation/accept`).
      send({transactionUuid: transaction.uuid, date: '2023-10-31', deliveryPrice: '909'}).
      set('Authorization', full_invitation.seller_token).
      expect(httpStatus.OK));
  
      (await request(app).post(`/api/invitation/pay`).
      send({transactionUuid: transaction.uuid}).
      set('Authorization', token_buyer).
      expect(httpStatus.OK));
  
      (await request(app).post(`/api/invitation/fulfill`).
      send({transactionUuid: transaction.uuid, activationKey: transaction.activationKey}).
      expect(httpStatus.OK));

      // may add a claim seller
      if (Math.random() < 0.25) {
        (await request(app).post(`/api/invitation/buyer_claim`).
        send({transactionUuid: transaction.uuid, reason: 'bad product', text: 'je suis rentré et le produit n avait une piece manquante'}).
        set('Authorization', token_buyer).
        expect(httpStatus.OK));
      }
      
      //fulfilled_transaction.push({...full_invitation , buyer_token: token_buyer, transaction: transaction});
    }

    // payed the transaction
    for (let i=0; i < numberPayedTransaction; i++) { 
      const token_buyer = buyers_tokens[fake.integer(0, buyers_tokens.length - 1)]
      const full_invitation = invitations[fake.integer(0, invitations.length - 1)];
  
      const transaction: ITransaction = (await request(app).post(`/api/invitation/create`).
      send({
        InvitationUuid: full_invitation.invitation.uuid,
        deliveryWilaya: full_invitation.invitation.storeWilaya,
        deliveryPlace: 'Cheraga'
      }).
      set('Authorization', token_buyer).
      expect(httpStatus.OK)).body.transaction;
  
      (await request(app).post(`/api/invitation/accept`).
      send({transactionUuid: transaction.uuid, date: '2023-10-31', deliveryPrice: '909'}).
      set('Authorization', full_invitation.seller_token).
      expect(httpStatus.OK));
  
      (await request(app).post(`/api/invitation/pay`).
      send({transactionUuid: transaction.uuid}).
      set('Authorization', token_buyer).
      expect(httpStatus.OK));
  
      // may add a claim buyer
      if (Math.random() < 0.25) {
        (await request(app).post(`/api/invitation/seller_claim`).
        send({transactionUuid: transaction.uuid, reason: 'produit livré et code ', text: 'le produit a été livré mais le code non reçu'}).
        set('Authorization', full_invitation.seller_token).
        expect(httpStatus.OK));
      }
      if (Math.random() < 0.25) {
        (await request(app).post(`/api/invitation/buyer_claim`).
        send({transactionUuid: transaction.uuid, reason: 'bad product', text: 'produit non conforme'}).
        set('Authorization', token_buyer).
        expect(httpStatus.OK));
      }
      if (Math.random() < 0.25) {
        (await request(app).post(`/api/invitation/cancel`).
        send({transactionUuid: transaction.uuid}).
        set('Authorization', token_buyer).
        expect(httpStatus.OK));
      }
      //fulfilled_transaction.push({...full_invitation , buyer_token: token_buyer, transaction: transaction});
    }
  });


});

