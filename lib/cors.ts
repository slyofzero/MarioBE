import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

export function initMiddleware(
  middleware: (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (result?: any) => void
  ) => void
) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise<void>((resolve, reject) => {
      middleware(req, res, (result?: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

export const cors = initMiddleware(
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ["GET", "POST", "OPTIONS", "PUT"],
    // Allow requests from any origin
    origin: "*",
  })
);
