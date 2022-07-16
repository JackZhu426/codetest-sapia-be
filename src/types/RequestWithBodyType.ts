import { Request } from 'express';

export interface RequestWithBodyType extends Request {
  body: {
    [key: string]: string;
  };
}
