import { initDb, pepperDb } from 'orms/pepperDb';
import { initInvitation, associateInvitation } from 'orms/invitation.orm';
import { initTransaction, Transaction } from './transaction.orm';
import { initBuyer, associateTransaction } from 'orms/buyer.orm';
import { initSeller, associateSeller } from 'orms/seller.orm';
import { initClaim, Claim, associateClaim } from './claim.orm';
import { associateHistory, initHistory, History } from './history.orm';
import { associateDeliveryOffice, initDeliveryOffice, DeliveryOffice } from './deliveryOffice.orm';
(async () => await initDb())();
initSeller(pepperDb);
initInvitation(pepperDb);
initBuyer(pepperDb);
initTransaction(pepperDb);
initClaim(pepperDb);
initHistory(pepperDb);
initDeliveryOffice(pepperDb);

associateSeller();
associateInvitation();
associateTransaction();
associateClaim();
associateHistory();
associateDeliveryOffice();

export { Invitation as Invitation } from 'orms/invitation.orm';
export { Seller as Seller } from 'orms/seller.orm';
export { Buyer as Buyer } from 'orms/buyer.orm';
export { Claim as Claim } from 'orms/claim.orm';
export { History as History } from 'orms/history.orm';
export { Transaction as Transaction } from 'orms/transaction.orm';
export { DeliveryOffice as DeliveryOffice } from 'orms/deliveryOffice.orm'


