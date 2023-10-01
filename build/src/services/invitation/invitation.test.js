"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const index_1 = (0, tslib_1.__importDefault)(require("index"));
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const fake_1 = require("helpers/fake");
const pepperDb_1 = require("orms/pepperDb");
require("dotenv/config");
const types_1 = require("models/types");
const wilayas_1 = require("models/wilayas");
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
const console_1 = require("console");
describe('## Transaction', () => {
    let user;
    let tokenOfUser1;
    let party1;
    let party2;
    let sellerObject;
    let token_seller;
    let token_buyer;
    let buyerObjet;
    let buyerObjet2;
    const organizerPassword = fake_1.fake.password;
    beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield (0, pepperDb_1.syncDbModels)();
        sellerObject = yield (0, fake_1.createFakeSeller)(organizerPassword);
        buyerObjet = yield (0, fake_1.createFakeBuyerPassword)(organizerPassword);
        buyerObjet2 = yield (0, fake_1.createFakeBuyerPassword)(organizerPassword);
        token_seller = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword })).body.token;
        token_buyer = (yield (0, supertest_1.default)(index_1.default).post('/api/buyer/login').send({ email: buyerObjet.email, phoneNumber: buyerObjet.phoneNumber, password: organizerPassword })).body.token;
        (0, console_1.assert)(token_buyer !== undefined);
    }));
    test('Should be able to create new invitation for seller', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const partyTest = {
            product: fake_1.fake.name,
            date: (0, moment_1.default)(),
            price: fake_1.fake.integer(200, 1000),
            description: fake_1.fake.description,
            storeWilaya: wilayas_1.WILAYAS[fake_1.fake.integer(0, 48)],
            storeLocation: fake_1.fake.address2,
            deliveryType: types_1.DeliveryType.LOCAL_WILAYA_ONLY,
            localDeliveryPrice: 400,
            autoAccept: true,
            deliveryDelayHours: 24,
        };
        const invitation = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
            send(Object.assign({}, partyTest)).
            set('Authorization', token_seller).
            expect(http_status_1.default.OK)).body.invitation;
        expect(invitation).toBeDefined();
        expect(invitation.product).toEqual(partyTest.product);
        expect(invitation.price).toEqual(partyTest.price);
    }));
    test('Should be able to open transaction electronic type', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const partyTest = {
            product: fake_1.fake.name,
            date: (0, moment_1.default)(),
            price: fake_1.fake.integer(200, 1000),
            description: fake_1.fake.description,
            storeWilaya: wilayas_1.WILAYAS[fake_1.fake.integer(0, 48)],
            storeLocation: fake_1.fake.address2,
            deliveryType: types_1.DeliveryType.NOT_NEEDED,
            localDeliveryPrice: 400,
            autoAccept: true,
            deliveryDelayHours: 24,
        };
        const invitation = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
            send(Object.assign({}, partyTest)).
            set('Authorization', token_seller).
            expect(http_status_1.default.OK)).body.invitation;
        const transaction = (yield (0, supertest_1.default)(index_1.default).post(`/api/invitation/create`).
            send({
            InvitationUuid: invitation.uuid,
            deliveryWilaya: wilayas_1.WILAYAS[fake_1.fake.integer(0, 48)],
            deliveryPlace: 'Cheraga'
        }).
            set('Authorization', token_buyer).
            expect(http_status_1.default.OK)).body.transaction;
        expect(transaction).toBeDefined();
        expect(transaction.state).toBe(types_1.TransactionStatus.ACCEPTED);
        expect(transaction.deliveryPrice).toBe(0);
    }));
    test('Should be able to open transaction in same wilaya & accepted auto', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const partyTest = {
            product: fake_1.fake.name,
            date: (0, moment_1.default)(),
            price: fake_1.fake.integer(200, 1000),
            description: fake_1.fake.description,
            storeWilaya: '16- Alger',
            storeLocation: fake_1.fake.address2,
            deliveryType: types_1.DeliveryType.BETWEEN_WILAYAS,
            localDeliveryPrice: 400,
            autoAccept: true,
            deliveryDelayHours: 24,
        };
        const invitation = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
            send(Object.assign({}, partyTest)).
            set('Authorization', token_seller).
            expect(http_status_1.default.OK)).body.invitation;
        const transaction = (yield (0, supertest_1.default)(index_1.default).post(`/api/invitation/create`).
            send({
            InvitationUuid: invitation.uuid,
            deliveryWilaya: '16- Alger',
            deliveryPlace: 'Cheraga'
        }).
            set('Authorization', token_buyer).
            expect(http_status_1.default.OK)).body.transaction;
        expect(transaction).toBeDefined();
        expect(transaction.state).toBe(types_1.TransactionStatus.ACCEPTED);
        expect(transaction.deliveryType).toBe(types_1.DeliveryType.LOCAL_WILAYA_ONLY);
        expect(transaction.deliveryPrice).toBe(partyTest.localDeliveryPrice);
    }));
    test('Should be able to open transaction not auto accept when wilaya different', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const partyTest = {
            product: fake_1.fake.name,
            date: (0, moment_1.default)(),
            price: fake_1.fake.integer(200, 1000),
            description: fake_1.fake.description,
            storeWilaya: '16- Alger',
            storeLocation: fake_1.fake.address2,
            deliveryType: types_1.DeliveryType.BETWEEN_WILAYAS,
            localDeliveryPrice: 400,
            autoAccept: true,
            deliveryDelayHours: 24,
        };
        const invitation = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
            send(Object.assign({}, partyTest)).
            set('Authorization', token_seller).
            expect(http_status_1.default.OK)).body.invitation;
        const transaction = (yield (0, supertest_1.default)(index_1.default).post(`/api/invitation/create`).
            send({
            InvitationUuid: invitation.uuid,
            deliveryWilaya: '17- Djelfa',
            deliveryPlace: 'Cheraga'
        }).
            set('Authorization', token_buyer).
            expect(http_status_1.default.OK)).body.transaction;
        expect(transaction).toBeDefined();
        expect(transaction.state).toBe(types_1.TransactionStatus.OPENED);
    }));
    test('Should NOT be able to open transaction different wilaya for local', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const partyTest = {
            product: fake_1.fake.name,
            date: (0, moment_1.default)(),
            price: fake_1.fake.integer(200, 1000),
            description: fake_1.fake.description,
            storeWilaya: '16- Alger',
            storeLocation: fake_1.fake.address2,
            deliveryType: types_1.DeliveryType.LOCAL_WILAYA_ONLY,
            localDeliveryPrice: 400,
            autoAccept: true,
            deliveryDelayHours: 24,
        };
        const invitation = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
            send(Object.assign({}, partyTest)).
            set('Authorization', token_seller).
            expect(http_status_1.default.OK)).body.invitation;
        (yield (0, supertest_1.default)(index_1.default).post(`/api/invitation/create`).
            send({
            InvitationUuid: invitation.uuid,
            deliveryWilaya: '17- Djelfa',
            deliveryPlace: 'Cheraga'
        }).
            set('Authorization', token_buyer).
            expect(http_status_1.default.UNAUTHORIZED));
    }));
});
//# sourceMappingURL=invitation.test.js.map