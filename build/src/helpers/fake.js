"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fake = exports.createFakeInvitation = exports.createFakeSeller = exports.createFakeBuyer = exports.createFakeInvitationWithSeller = void 0;
const tslib_1 = require("tslib");
const orms_1 = require("orms");
const types_1 = require("models/types");
const casual_1 = (0, tslib_1.__importDefault)(require("casual"));
exports.fake = casual_1.default;
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
casual_1.default.define('gender', () => casual_1.default.boolean ? types_1.Gender.MAN : types_1.Gender.WOMAN);
casual_1.default.define('phoneNumber', () => casual_1.default.numerify('06########'));
casual_1.default.define('product', () => ({ name: casual_1.default.word, price: casual_1.default.integer(3, 20) }));
casual_1.default.define('match_status', () => [
    types_1.UserStatus.Pending,
    types_1.UserStatus.Accepted,
][casual_1.default.integer(0, 1)]);
const createFakeBuyer = (overrideProps) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const buyer = yield orms_1.Buyer.create(Object.assign({ name: casual_1.default.first_name, firstName: casual_1.default.name, gender: casual_1.default.gender, phoneNumber: casual_1.default.phoneNumber, email: casual_1.default.email, password: casual_1.default.password, address: casual_1.default.address }, (overrideProps ? overrideProps : {})));
    return buyer.get({ plain: true });
});
exports.createFakeBuyer = createFakeBuyer;
const createFakeSeller = (password = casual_1.default.password) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const seller = yield orms_1.Seller.create({
        phoneNumber: casual_1.default.phoneNumber,
        firstName: casual_1.default.name,
        businessName: casual_1.default.username,
        email: casual_1.default.email,
        name: casual_1.default.name,
        password: casual_1.default.password,
        location: casual_1.default.address,
        description: casual_1.default.description
    });
    return seller.get({ plain: true });
});
exports.createFakeSeller = createFakeSeller;
const createFakeInvitationWithSeller = () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const seller = yield orms_1.Seller.create({
        phoneNumber: casual_1.default.phoneNumber,
        firstName: casual_1.default.name,
        businessName: casual_1.default.username,
        email: casual_1.default.email,
        name: casual_1.default.name,
        password: casual_1.default.password,
        location: casual_1.default.address,
        description: casual_1.default.description
    });
    const invitation = yield orms_1.Invitation.create({
        product: casual_1.default.name,
        date: (0, moment_1.default)(),
        price: casual_1.default.integer(0, 100),
        instances: casual_1.default.integer(20, 40),
        description: casual_1.default.description,
        delivery: casual_1.default.address2,
    });
    yield seller.addInvitations(invitation);
    const createdInvitation = yield orms_1.Invitation.findOne({ where: { id: invitation.id }, raw: false });
    if (!createdInvitation) {
        throw 'Fake invitation creation failed';
    }
    return createdInvitation;
});
exports.createFakeInvitationWithSeller = createFakeInvitationWithSeller;
const createFakeInvitation = (organizerInfo) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const seller = yield orms_1.Seller.findOne({ where: { id: organizerInfo.id }, raw: false });
    const party = yield orms_1.Invitation.create({
        product: casual_1.default.name,
        date: (0, moment_1.default)(),
        price: casual_1.default.integer(0, 100),
        instances: casual_1.default.integer(20, 40),
        description: casual_1.default.description,
        delivery: casual_1.default.address2,
    });
    yield (seller === null || seller === void 0 ? void 0 : seller.addInvitations(party));
    const createdInvitation = yield orms_1.Invitation.findOne({ where: { id: party.id }, raw: false });
    if (!createdInvitation) {
        throw 'Fake invitation creation failed';
    }
    return createdInvitation;
});
exports.createFakeInvitation = createFakeInvitation;
//# sourceMappingURL=fake.js.map