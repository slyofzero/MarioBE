import { CollectionQuery, addDocument, getDocument } from "@/firebase";
import type { NextApiRequest, NextApiResponse } from "next";
import { nanoid } from "nanoid";
import { cors } from "@/lib/cors";

const collectionName = "users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await cors(req, res);

    const prefix = req.query.prefix as string | undefined;
    const { difficulty, score } = req.query;

    if (req.method === "POST") {
      const { name, difficulty } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const userId = nanoid(10);
      const userDoc = { userId, name, score: score || 0, difficulty };

      Object.keys(userDoc).forEach((key) => {
        // @ts-ignore
        if (userDoc[key] === undefined) {
          // @ts-ignore
          delete userDoc[key];
        }
      });

      await addDocument({
        data: userDoc,
        collectionName,
        id: userId,
        prefix,
      });

      console.log(`New user ${userId}`);

      res.status(201).json({ message: "User added successfully", userId });
    } else if (req.method === "GET") {
      const queries: CollectionQuery[] = [];
      if (difficulty) {
        queries.push(["difficulty", "==", difficulty]);
      }

      const topUsers = await getDocument({
        collectionName,
        queries,
        prefix,
      });

      topUsers.sort((a, b) => b.score - a.score);
      res.json(topUsers.slice(0, 10));
    } else {
      res.status(400).json({ message: "Bad Request" });
    }
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }

  res.status(500);
}
