"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tslib_1 = require("tslib");
const orms_1 = require("orms");
const user_helper_1 = require("services/user/user.helper");
const types_1 = require("models/types");
const sequelize_1 = require("sequelize");
const lodash_1 = (0, tslib_1.__importDefault)(require("lodash"));
class UserService {
    static getUserParties(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const parties = yield user.getParties({ attributes: { exclude: ['createdAt', 'deletedAt', 'updatedAt'] } });
            const matches = yield user.getMatches({ raw: true });
            const partiesWithOrganizersAndAttendees = yield Promise.all(yield parties.map((currentParty) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const organizer = yield currentParty.getOrganizer({
                    attributes: { exclude: ['status', 'createdAt', 'deletedAt', 'updatedAt'] }
                });
                const attendeesForThisParty = yield currentParty.getUsers({
                    attributes: { exclude: ['createdAt', 'deletedAt', 'updatedAt'] },
                    raw: true,
                });
                const attendeesFilteredByUserMatches = lodash_1.default.filter(attendeesForThisParty, (attendee) => !lodash_1.default.map(matches, (match) => match.id).includes(attendee.id));
                const attendees = lodash_1.default.map(attendeesFilteredByUserMatches, (attendee) => lodash_1.default.omitBy(attendee, (_value, key) => key.includes('UserParty')));
                const plainParty = currentParty.get({ plain: true });
                const userPartyStatus = plainParty['UserParty'].status;
                const outputParty = Object.assign(Object.assign(Object.assign({ status: userPartyStatus }, organizer.get({ plain: true })), lodash_1.default.omit(plainParty, 'UserParty')), { attendees });
                return outputParty;
            })));
            return partiesWithOrganizersAndAttendees;
        });
    }
    static getPartiesUserCanGoTo(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const userParties = yield user.getParties();
            const acceptedOrganizers = yield orms_1.Organizer.findAll({ where: { status: types_1.OrganizerStatus.Accepted } });
            const parties = yield orms_1.Party.findAll({ where: {
                    id: {
                        [sequelize_1.Op.notIn]: userParties.map((userParty) => userParty.id),
                    },
                    OrganizerId: {
                        [sequelize_1.Op.in]: acceptedOrganizers.map((organizer) => organizer.id),
                    }
                }
            });
            const partiesWithOrganizers = yield Promise.all(yield parties.map((currentParty) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const organizer = yield currentParty.getOrganizer();
                return Object.assign(Object.assign({}, organizer.get({ plain: true })), currentParty.get({ plain: true }));
            })));
            const normalizedParties = (0, user_helper_1.normalizeOrganizerParties)(partiesWithOrganizers);
            return normalizedParties;
        });
    }
    static getUserMatches(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const matches = yield user.getMatches({ raw: true });
            const normalizedMatches = (0, user_helper_1.normalizeUserMatches)(matches);
            return normalizedMatches;
        });
    }
    static updateUserMatchStatus(user, match) {
        var _a;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const matchUserStatus = (_a = (yield orms_1.UserMatch.findOne({ where: { [sequelize_1.Op.and]: [{ UserId: match.id }, { MatchId: user.id }] } }))) === null || _a === void 0 ? void 0 : _a.status;
            if (matchUserStatus === types_1.MatchStatus.WAITING) {
                yield orms_1.UserMatch.update({ status: types_1.MatchStatus.ACCEPTED }, { where: { [sequelize_1.Op.and]: [{ UserId: user.id }, { MatchId: match.id }] } });
                yield orms_1.UserMatch.update({ status: types_1.MatchStatus.ACCEPTED }, { where: { [sequelize_1.Op.and]: [{ UserId: match.id }, { MatchId: user.id }] } });
                return null;
            }
        });
    }
    static addParty(user, party) {
        var _a, _b, _c, _d;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const firstWaitingAttendeeId = (_a = (yield orms_1.UserParty.findAll({
                attributes: { exclude: ['createdAt', 'deletedAt', 'updatedAt'] },
                where: {
                    status: types_1.UserPartyStatus.WAITING,
                    PartyId: party.id,
                    UserId: { [sequelize_1.Op.not]: user.id },
                },
                order: [
                    ['createdAt', 'ASC'],
                ],
                limit: 1,
                raw: true,
                plain: true,
            }))) === null || _a === void 0 ? void 0 : _a.UserId;
            const lastAcceptedAttendeeId = (_b = (yield orms_1.UserParty.findAll({
                attributes: { exclude: ['createdAt', 'deletedAt', 'updatedAt'] },
                where: {
                    status: types_1.UserPartyStatus.ACCEPTED,
                    PartyId: party.id,
                    UserId: { [sequelize_1.Op.not]: user.id },
                },
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit: 1,
                raw: true,
                plain: true,
            }))) === null || _b === void 0 ? void 0 : _b.UserId;
            yield user.addParty(party);
            const acceptUser = () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                if (firstWaitingAttendeeId) {
                    yield orms_1.UserParty.update({ status: types_1.UserPartyStatus.ACCEPTED }, { where: {
                            [sequelize_1.Op.and]: [
                                { UserId: firstWaitingAttendeeId },
                                { PartyId: party.id },
                            ],
                        },
                    });
                }
                yield orms_1.UserParty.update({ status: types_1.UserPartyStatus.ACCEPTED }, { where: {
                        [sequelize_1.Op.and]: [
                            { UserId: user.id },
                            { PartyId: party.id },
                        ],
                    },
                });
            });
            if (!lastAcceptedAttendeeId) {
                yield acceptUser();
                return;
            }
            const lastAcceptedAttendeeGender = (_c = (yield orms_1.User.findOne({
                attributes: ['gender'],
                where: { id: lastAcceptedAttendeeId },
                raw: true,
            }))) === null || _c === void 0 ? void 0 : _c.gender;
            const firstWaitingAttendeeGender = firstWaitingAttendeeId ? (_d = (yield orms_1.User.findOne({
                attributes: ['gender'],
                where: { id: firstWaitingAttendeeId },
                raw: true,
            }))) === null || _d === void 0 ? void 0 : _d.gender : null;
            if (user.gender !== lastAcceptedAttendeeGender || user.gender !== firstWaitingAttendeeGender) {
                yield acceptUser();
            }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map