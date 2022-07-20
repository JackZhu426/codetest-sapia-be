import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_KEY || 'secret';

// return generated JWT string ↓, containing username and expiry date in the payload
// HEADER + PAYLOAD + SIGNATURE
export const generateToken = (payload: any) => {
  return jwt.sign(payload, JWT_KEY, { expiresIn: '1h' });
};

// veryfy the JWT string and return the 1) decoded payload (if valid), 2) null (if invalid)
// export const verifyToken = (token: string) => {
//   try {
//     return jwt.verify(token, JWT_KEY);
//   } catch (err) {
//     return null;
//   }
// };
