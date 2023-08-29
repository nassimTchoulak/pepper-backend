import express from 'express';
import sellerRoutes from 'services/seller/seller.route';
import userRoutes from 'services/buyer/buyer.route';
import partyRoutes from 'services/invitation/invitation.route';
import proxyRoutes from 'services/proxy/proxy.route';
import AdminRoutes from 'services/admin/admin.route';

const routes = express.Router(); // eslint-disable-line new-cap
routes.use('/seller', sellerRoutes);
routes.use('/buyer', userRoutes);
routes.use('/invitation', partyRoutes);
routes.use('/proxy', proxyRoutes);
routes.use('/admin', AdminRoutes);

export default routes;