// pages/api/client-api/geolocation.ts

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Import the client-side function
    import("@/utils/geolocationUtil").then(async ({ getPosition }) => {
      try {
        const position = await getPosition();

        if (position) {
          const { latitude, longitude } = position.coords;
          res.status(200).json({ latitude, longitude });
        } else {
          res.status(500).json({ error: "Unable to obtain geolocation data." });
        }
      } catch (error) {
        console.error("Error obtaining geolocation data:", error);
        res
          .status(500)
          .json({
            error: "An error occurred while obtaining geolocation data.",
          });
      }
    });
  } else {
    res.status(405).end(); // Method not allowed
  }
}
