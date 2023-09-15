import { initDb, pepperDb } from 'orms/pepperDb';
import { initInvitation, associateInvitation } from 'orms/invitation.orm';
import { initTransaction } from './transaction.orm';
import { initBuyer, associateTransaction } from 'orms/buyer.orm';
import { initSeller, associateSeller } from 'orms/seller.orm';
import { initClaim, Claim, associateClaim } from './claim.orm';
import { associateHistory, initHistory, History } from './history.orm';
(async () => await initDb())();
initSeller(pepperDb);
initInvitation(pepperDb);
initBuyer(pepperDb);
initTransaction(pepperDb);
initClaim(pepperDb);
initHistory(pepperDb);

associateSeller();
associateInvitation();
associateTransaction();
associateClaim();
associateHistory();

export { Invitation as Invitation } from 'orms/invitation.orm';
export { Seller as Seller } from 'orms/seller.orm';
export { Buyer as Buyer } from 'orms/buyer.orm';
export { Claim as Claim } from 'orms/claim.orm';
export { History as History } from 'orms/history.orm'


