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
    const { difficulty } = req.query;

    if (req.method === "POST") {
      const { name, difficulty, score } = req.body;
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
      const topUsers = await getDocument({
        collectionName,
        prefix,
      });

      if (prefix === "snake") {
        const topScores: { [key: number]: any[] } = {
          0: [], // Easy scores
          1: [], // Medium scores
          2: [], // Hard scores
        };

        topUsers.forEach((user) => {
          const { id, name, score, difficulty } = user;
          const difficultyCode =
            difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
          topScores[difficultyCode].push([id, { score, userName: name }]);
        });

        Object.keys(topScores).forEach((difficulty) => {
          topScores[Number(difficulty)].sort((a, b) => b[1].score - a[1].score);
          topScores[Number(difficulty)] = topScores[Number(difficulty)].slice(0, 10); // prettier-ignore
        });

        return res.json(topScores);
      } else {
        topUsers.sort((a, b) => b.score - a.score);
        return res.json(topUsers.slice(0, 10));
      }
    } else {
      res.status(400).json({ message: "Bad Request" });
    }
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }

  res.status(500);
}
