import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.method);

  try {
    res.status(200).json({ message: "Server up" });
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }

  res.status(500);
}
