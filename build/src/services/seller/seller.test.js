"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const index_1 = (0, tslib_1.__importDefault)(require("index"));
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const orms_1 = require("orms");
const fake_1 = require("helpers/fake");
const pepperDb_1 = require("orms/pepperDb");
const types_1 = require("models/types");
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
const wilayas_1 = require("models/wilayas");
describe('## seller', () => {
    let sellerObject;
    const organizerPassword = fake_1.fake.password;
    beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield (0, pepperDb_1.syncDbModels)();
        sellerObject = yield (0, fake_1.createFakeSeller)(organizerPassword);
    }));
    describe('# Login seller', () => {
        test('should NOT be able to login if userName is not provided', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ randomField: 'random' }).expect(http_status_1.default.BAD_REQUEST);
        }));
        test('should NOT be able to login if organizer does not exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: 'test@gmail.com', password: '123456' }).expect(http_status_1.default.NOT_FOUND);
        }));
        test('should be able to subscribe with email and Password', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const sellerInfoTest = {
                name: fake_1.fake.name,
                email: fake_1.fake.email,
                firstName: fake_1.fake.first_name,
                phoneNumber: fake_1.fake.phone,
                password: fake_1.fake.password,
                businessName: fake_1.fake.title,
                location: fake_1.fake.address,
                wilaya: wilayas_1.WILAYAS[fake_1.fake.integer(0, 48)],
                description: fake_1.fake.description,
                code: "123456"
            };
            const { token } = (yield (0, supertest_1.default)(index_1.default).put('/api/seller/login').send(Object.assign({}, sellerInfoTest)).expect(http_status_1.default.OK)).body;
            const subscribedSeller = yield orms_1.Seller.findOne({
                where: { email: sellerInfoTest.email, password: sellerInfoTest.password },
                raw: true
            });
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const authentifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_SELLER_KEY);
            expect(subscribedSeller.id).toEqual(authentifiedUser.id);
        }));
        test('should be able to login with email and Password', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword })).body;
            if (!process.env.JWT_SELLER_KEY) {
                throw 'JWT key not provided';
            }
            const authentifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_SELLER_KEY);
            expect(sellerObject.id).toEqual(authentifiedUser.id);
        }));
        test('should not able to subscribe with same email twice', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const sellerInfo2 = {
                name: fake_1.fake.name,
                email: fake_1.fake.email,
                firstName: fake_1.fake.first_name,
                phoneNumber: fake_1.fake.phone,
                password: fake_1.fake.password,
                businessName: fake_1.fake.title,
                location: fake_1.fake.address,
                wilaya: wilayas_1.WILAYAS[fake_1.fake.integer(0, 48)],
                description: fake_1.fake.description,
                code: "123456"
            };
            yield (0, supertest_1.default)(index_1.default).put('/api/seller/login').send(Object.assign({}, sellerInfo2)).expect(http_status_1.default.OK);
            yield (0, supertest_1.default)(index_1.default).put('/api/seller/login').send(Object.assign({}, sellerInfo2)).expect(http_status_1.default.UNAUTHORIZED);
        }));
        test('should be able to query info with the right token', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword }).expect(http_status_1.default.OK)).body;
            const seller_1 = (yield (0, supertest_1.default)(index_1.default).get(`/api/seller/`).
                set('Authorization', token).
                expect(http_status_1.default.OK)).body.seller;
            expect(seller_1.email).toEqual(sellerObject.email);
        }));
        test('should NOT be able to query info with the wrong token', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default).get(`/api/seller/`).
                set('Authorization', 'wrongToken').
                expect(http_status_1.default.UNAUTHORIZED);
        }));
    });
    describe('# Update Seller', () => {
        test('should be able to update seller', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const newInfo = {
                firstName: fake_1.fake.first_name,
                location: fake_1.fake.address,
                description: fake_1.fake.description,
                name: fake_1.fake.name,
                businessName: fake_1.fake.name,
            };
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword }).expect(http_status_1.default.OK)).body;
            const { seller } = (yield (0, supertest_1.default)(index_1.default).put(`/api/seller/`).
                send(newInfo).
                set('Authorization', token).
                expect(http_status_1.default.OK)).body;
            expect({
                firstName: seller.firstName,
                location: seller.location,
                description: seller.description,
            }).toEqual({
                firstName: newInfo.firstName,
                location: newInfo.location,
                description: newInfo.description,
            });
        }));
    });
    describe('# seller invitation', () => {
        test('Should be able to get seller own invitations', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const sellerTest = yield (0, fake_1.createFakeSeller)(organizerPassword);
            const p1 = yield (0, fake_1.createFakeInvitation)(sellerTest);
            const p2 = yield (0, fake_1.createFakeInvitation)(sellerTest);
            const result_req = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').
                send({ email: sellerTest.email, password: organizerPassword }).expect(http_status_1.default.OK));
            const testToken = result_req.body.token;
            const parties = (yield (0, supertest_1.default)(index_1.default).get(`/api/seller/invitation`).
                set('Authorization', testToken).
                expect(http_status_1.default.OK)).body.invitations;
            expect(parties.length).toEqual(2);
            expect(parties[0].uuid).toEqual(p2.uuid);
            expect(parties[1].uuid).toEqual(p1.uuid);
        }));
        test('Should be able to create new invitation for organizer', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
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
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword })).body;
            const invitation = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
                send(Object.assign({}, partyTest)).
                set('Authorization', token).
                expect(http_status_1.default.OK)).body.invitation;
            expect(invitation).toBeDefined();
            expect(invitation.product).toEqual(partyTest.product);
            expect(invitation.price).toEqual(partyTest.price);
        }));
        test('Should be able to create delete invitation for seller', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
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
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/seller/login').send({ email: sellerObject.email, password: organizerPassword })).body;
            const request_val = (yield (0, supertest_1.default)(index_1.default).post(`/api/seller/invitation`).
                send(Object.assign({}, partyTest)).
                set('Authorization', token).
                expect(http_status_1.default.OK));
            const invitation = request_val.body.invitation;
            expect(invitation.active).toBe(types_1.EntityStatus.Pending);
            const req_reuslt = (yield (0, supertest_1.default)(index_1.default).delete(`/api/seller/invitation`).
                send({ uuid: invitation.uuid }).
                set('Authorization', token));
            const delete_invitation = req_reuslt.body.invitation;
            expect(delete_invitation.active).toEqual(types_1.EntityStatus.Rejected);
        }));
    });
});
//# sourceMappingURL=seller.test.js.map