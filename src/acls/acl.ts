import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import 'dotenv/config';
import { IBuyer, ISeller } from 'models/types';

const authorizeForBuyer = async (req: any, res: any, next: any) => {
  let buyer;
  try {
    if (!process.env.JWT_BUYER_KEY) {
      throw 'JWT key not provided';
    }

    buyer = jwt.verify(req.headers.authorization, process.env.JWT_BUYER_KEY) as IBuyer;

    if (!buyer?.id) {
      throw 'Does not contain buyer';
    }
    req.user = buyer;
    next();
  } catch (e) {
    res.status(httpStatus.UNAUTHORIZED);
    res.json({
      message: `Invalid token: ${e}`,
    });
  }
}

const authorizeForSeller = async (req: any, res: any, next: any) => {
  let seller;
  try {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }

    seller = jwt.verify(req.headers.authorization, process.env.JWT_SELLER_KEY) as ISeller;

    if (!seller?.id) {
      throw 'Does not contain seller';
    }
    req.organizer = seller;
    next();
  } catch (e) {
    res.status(httpStatus.UNAUTHORIZED);
    res.json({
      message: `Invalid token: ${e}`,
    });
  }
}

const authorizeForAdmin = async (req: any, res: any, next: any) => {
  if (!process.env.RSA_PUBLIC) {
    throw 'public key';
  }
  const publicKey = process.env.RSA_PUBLIC.replace(/\\n/g, '\n');

  try {
    if (!process.env.JWT_SELLER_KEY) {
      throw 'JWT key not provided';
    }

    const decoded = jwt.verify(req.headers.authorization, publicKey, {
      algorithms: ['RS256'],
      issuer: 'application',
    }) as {name: string, id: number}

    req.admin = decoded;
    next();
  } catch (e) {
    res.status(httpStatus.UNAUTHORIZED);
    res.json({
      message: `Invalid token: ${e}`,
    });
  }
}

export { authorizeForBuyer as authorizeForBuyer, authorizeForSeller as authorizeForSeller, authorizeForAdmin };
