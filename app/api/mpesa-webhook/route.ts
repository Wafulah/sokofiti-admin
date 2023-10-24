import { NextApiResponse, NextApiRequest } from "next";
import { useOrderAndProductUpdater } from "./components/db-operations";

// Define a type for the M-Pesa callback data
type MpesaCallbackData = {
  stkCallback: {
    ResultCode: number;
    MerchantRequestID: string;
    PhoneNumber: string;
    TransactionDate: string;
  };
};

// Create a functional component that uses the hook
function MpesaCallbackHandler(
  callbackData: MpesaCallbackData,
  res: NextApiResponse
) {
  const updateOrderAndProducts = useOrderAndProductUpdater();

  if (callbackData.stkCallback?.ResultCode === 0) {
    const orderId = callbackData.stkCallback.MerchantRequestID;
    const phoneNumber = callbackData.stkCallback.PhoneNumber;
    const transactionDate = callbackData.stkCallback.TransactionDate;

    updateOrderAndProducts()
      .then((dbUpdateResult: boolean) => {
        // Assuming dbUpdateResult is of type boolean
        if (dbUpdateResult) {
          res.status(200).json({
            ResponseCode: "0",
            ResponseDesc: "Transaction processed successfully",
          });
        } else {
          res.status(200).json({
            ResponseCode: "1",
            ResponseDesc: "Transaction processed, but database update failed",
          });
        }
      })
      .catch((error: Error) => {
        console.error("Error processing M-Pesa callback:", error);
        res.status(500).json({
          ResponseCode: "2",
          ResponseDesc: "Error processing the transaction",
        });
      });
  } else {
    res.status(200).json({
      ResponseCode: "1",
      ResponseDesc: "Transaction failed",
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const callbackData = req.body as MpesaCallbackData;
      MpesaCallbackHandler(callbackData, res);
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      res.status(500).json({
        ResponseCode: "2",
        ResponseDesc: "Error processing the transaction",
      });
    }
  } else {
    res.status(405).end();
  }
}
