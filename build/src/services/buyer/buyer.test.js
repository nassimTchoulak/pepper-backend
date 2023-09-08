"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const index_1 = (0, tslib_1.__importDefault)(require("index"));
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const orms_1 = require("orms");
const fake_1 = require("helpers/fake");
const pepperDb_1 = require("orms/pepperDb");
const jsonwebtoken_1 = (0, tslib_1.__importDefault)(require("jsonwebtoken"));
const types_1 = require("models/types");
require("dotenv/config");
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
describe('## User', () => {
    let user1;
    let user2;
    let user3;
    let user4;
    let user5;
    let user6;
    let user7;
    let invitation;
    let party2;
    let party3;
    beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield (0, pepperDb_1.syncDbModels)();
        user1 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.MAN });
        user2 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.MAN });
        user3 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.WOMAN });
        user4 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.WOMAN });
        user5 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.WOMAN });
        user6 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.MAN });
        user7 = yield (0, fake_1.createFakeBuyer)({ gender: types_1.Gender.MAN });
        invitation = yield (0, fake_1.createFakeInvitationWithSeller)();
        party2 = yield (0, fake_1.createFakeInvitationWithSeller)();
        party3 = yield (0, fake_1.createFakeInvitationWithSeller)();
    }));
    describe('# Login', () => {
        test('should NOT be able to login if phoneNumber is not provided', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default).post('/api/buyer/login').send({ randomField: 'random' }).expect(http_status_1.default.BAD_REQUEST);
        }));
        test('should NOT be able to login if phoneNumber / email / password does not exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default).post('/api/buyer/login').send({ email: "test", phoneNumber: '0000000000', password: '123456' }).expect(http_status_1.default.UNAUTHORIZED);
        }));
        test('should be able to see if buyer with phoneNumber does NOT exists if he actually does NOT exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const res = (yield (0, supertest_1.default)(index_1.default).get('/api/buyer/login').query({ email: 'test', phoneNumber: '00000010000' }));
            console.log(res);
            const { userExists } = (yield (0, supertest_1.default)(index_1.default).get('/api/buyer/login').send({ email: 'test', phoneNumber: '00000010000' }).expect(http_status_1.default.OK)).body;
            expect(userExists).toBe(false);
        }));
        test('should be able to see if buyer with phoneNumber exists if he actually does exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { userExists } = (yield (0, supertest_1.default)(index_1.default).get('/api/buyer/login').send({ phoneNumber: user1.phoneNumber, email: user1.email }).expect(http_status_1.default.OK)).body;
            expect(userExists).toBe(true);
        }));
        test('should be able to subscribe with phoneNumber', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const buyerInfo = {
                name: fake_1.fake.first_name,
                firstName: fake_1.fake.name,
                gender: fake_1.fake.gender,
                phoneNumber: fake_1.fake.phoneNumber,
                email: fake_1.fake.email,
                password: fake_1.fake.password,
                address: fake_1.fake.address,
                birthDay: (0, moment_1.default)()
            };
            const { token } = (yield (0, supertest_1.default)(index_1.default).put('/api/buyer/login').send(Object.assign(Object.assign({}, buyerInfo), { code: '123456' })).expect(http_status_1.default.OK)).body;
            const subscribedUser = yield orms_1.Buyer.findOne({ where: { phoneNumber: buyerInfo.phoneNumber } });
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const authentifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            expect(subscribedUser.id).toEqual(authentifiedUser.id);
        }));
        test('should be able to login if phoneNumber exists', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/buyer/login').send({ phoneNumber: user1.phoneNumber, password: user1.password, email: '' }).expect(http_status_1.default.OK)).body;
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const authentifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            expect(user1.id).toEqual(authentifiedUser.id);
        }));
        test('should not be able to validate wrong emailCode', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/buyer/login').send({ phoneNumber: user1.phoneNumber, password: user1.password, email: '' }).expect(http_status_1.default.OK)).body;
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            (yield (0, supertest_1.default)(index_1.default).patch(`/api/buyer/login`).
                send({ emailCode: 1234 }).
                set('Authorization', token).
                expect(http_status_1.default.UNAUTHORIZED));
        }));
        test('should be able to validate correct emailCode', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { token } = (yield (0, supertest_1.default)(index_1.default).post('/api/buyer/login').send({ phoneNumber: user1.phoneNumber, password: user1.password, email: '' }).expect(http_status_1.default.OK)).body;
            if (!process.env.JWT_KEY) {
                throw 'JWT key not provided';
            }
            const authentifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
            const buyerObject = yield orms_1.Buyer.findByPk(authentifiedUser.id);
            const result_request = (yield (0, supertest_1.default)(index_1.default).patch(`/api/buyer/login`).
                send({ emailCode: buyerObject === null || buyerObject === void 0 ? void 0 : buyerObject.emailCode }).
                set('Authorization', token).
                expect(http_status_1.default.OK)).body;
            const validated_user = jsonwebtoken_1.default.verify(result_request.token, process.env.JWT_KEY);
            expect(validated_user.status).toBe(types_1.UserStatus.Accepted);
            expect(validated_user.id).toBe(authentifiedUser.id);
        }));
    });
});
//# sourceMappingURL=buyer.test.js.map