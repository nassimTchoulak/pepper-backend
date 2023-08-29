import { initDb, pepperDb } from 'orms/pepperDb';
import { initInvitation, associateInvitation } from 'orms/invitation.orm';
import { initTransaction } from './transaction.orm';
import { initBuyer, associateUser } from 'orms/buyer.orm';
import { initSeller, associateSeller } from 'orms/seller.orm';
(async () => await initDb())();
initSeller(pepperDb);
initInvitation(pepperDb);
initBuyer(pepperDb);
initTransaction(pepperDb);

associateSeller();
associateInvitation();
associateUser();
export { Invitation as Invitation } from 'orms/invitation.orm';
export { Seller as Seller } from 'orms/seller.orm';
export { Buyer as Buyer } from 'orms/buyer.orm';


