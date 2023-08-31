"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const index_1 = (0, tslib_1.__importDefault)(require("index"));
const http_status_1 = (0, tslib_1.__importDefault)(require("http-status"));
const pepperDb_1 = require("orms/pepperDb");
require("dotenv/config");
describe('## Party', () => {
    let user;
    let tokenOfUser1;
    let party1;
    let party2;
    beforeAll(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield (0, pepperDb_1.syncDbModels)();
    }));
    test('Basic Test 0', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.default).get(`/api/admin`).
            set('Authorization', 'wrongToken').
            expect(http_status_1.default.OK);
    }));
});
//# sourceMappingURL=invitation.test.js.map