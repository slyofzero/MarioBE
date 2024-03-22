import { addDocument, getDocument } from "@/firebase";
import type { NextApiRequest, NextApiResponse } from "next";
import { nanoid } from "nanoid";

const collectionName = "users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const userId = nanoid(10);
      const score = 0;

      await addDocument({
        data: { userId, name, score },
        collectionName,
        id: userId,
      });

      console.log(`New user ${userId}`);

      res.status(201).json({ message: "User added successfully", userId });
    } else if (req.method === "GET") {
      const topUsers = await getDocument({
        collectionName,
      });

      topUsers.sort((a, b) => b.score - a.score);
      res.json(topUsers.slice(0, 10));
    }
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }

  res.status(500);
}
