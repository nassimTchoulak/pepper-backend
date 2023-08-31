"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const index_1 = (0, tslib_1.__importDefault)(require("index"));
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const fake_1 = require("helpers/fake");
const pepperDb_1 = require("orms/pepperDb");
const types_1 = require("models/types");
require("dotenv/config");
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
            yield (0, supertest_1.default)(index_1.default).post('/api/user/login').send({ randomField: 'random' }).expect(http_status_1.default.BAD_REQUEST);
        }));
        test('should NOT be able to login if phoneNumber does not exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default).post('/api/user/login').send({ phoneNumber: '0000000000', code: '123456' }).expect(http_status_1.default.UNAUTHORIZED);
        }));
        test('should be able to see if user with phoneNumber does NOT exists if he actually does NOT exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { userExists } = (yield (0, supertest_1.default)(index_1.default).get('/api/user/login').query({ phoneNumber: '0000000000' }).expect(http_status_1.default.OK)).body;
            expect(userExists).toBe(false);
        }));
        test('should be able to see if user with phoneNumber exists if he actually does exist', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
            const { userExists } = (yield (0, supertest_1.default)(index_1.default).get('/api/user/login').query({ phoneNumber: user1.phoneNumber }).expect(http_status_1.default.OK)).body;
            expect(userExists).toBe(true);
        }));
    });
});
//# sourceMappingURL=buyer.test.js.map