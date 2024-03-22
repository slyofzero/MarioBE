import { getDocumentById, updateDocumentById } from "@/firebase";
import { cors } from "@/lib/cors";
import type { NextApiRequest, NextApiResponse } from "next";

const collectionName = "users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await cors(req, res);
    if (req.method === "PUT") {
      const userId = req.query.userId as string;
      console.log(userId);
      const { score } = req.body;

      if (typeof score !== "number") {
        return res.status(400).json({ error: "Invalid score field" });
      }

      const user = await getDocumentById({
        collectionName,
        id: userId,
      });

      if (!user) {
        return res.status(404).json({ error: "No user found" });
      }

      const newScore = user?.score + score;
      const updatedUser = await updateDocumentById({
        id: userId,
        updates: { score: newScore },
        collectionName,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Score updated successfully",
        score: newScore,
        userId,
      });
    }
  } catch (e) {
    const error = e as Error;
    res.status(500).json({ error: error.message });
  }

  res.status(500);
}
