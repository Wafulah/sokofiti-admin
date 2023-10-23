import { NextApiRequest, NextApiResponse } from "next";
import { updateOrderAndProducts } from "./components/db-operations";

async function handler (req: Request, res: NextApiResponse) {
  console.log("intro");
  if (req.method === "POST") {
    console.log("post");
    try {
      const data = await req.text(); // Parse the incoming data
      const callbackData = JSON.parse(data);

      // Process the M-Pesa callback data here
      if (callbackData?.stkCallback?.ResultCode === 0) {
        // Transaction was successful, update your database
        console.log("success");
        const orderId = callbackData?.stkCallback?.MerchantRequestID;
        const phoneNumber = callbackData?.stkCallback?.PhoneNumber;
        const transactionDate = callbackData?.stkCallback?.TransactionDate;

        // Use the database update function
        const dbUpdateResult = await updateOrderAndProducts(
          orderId,
          phoneNumber,
          transactionDate
        );

        if (dbUpdateResult) {
          // Respond to M-Pesa with a success acknowledgment
          res.status(200).json({
            ResponseCode: "0",
            ResponseDesc: "Transaction processed successfully",
          });
        } else {
          // Database update failed
          // Respond to M-Pesa with an error acknowledgment
          res.status(200).json({
            ResponseCode: "1",
            ResponseDesc: "Transaction processed, but database update failed",
          });
        }
      } else {
        // Transaction was not successful
        // Handle failed transactions if needed
        console.log("failed");
        // Respond to M-Pesa with a rejection acknowledgment
        res.status(200).json({
          ResponseCode: "1",
          ResponseDesc: "Transaction failed",
        });
      }
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      res.status(500).json({
        ResponseCode: "2",
        ResponseDesc: "Error processing the transaction",
      });
    }
  } else {
    // Return a 405 Method Not Allowed response for non-POST requests
    res.status(405).end();
  }
};

export default handler;