import { useOrderAndProductUpdater } from "./components/db-operations";
import { NextApiResponse, Request } from "next";

// Define a type for the M-Pesa callback data
type MpesaCallbackData = {
  stkCallback: {
    ResultCode: string;
    MerchantRequestID: string;
    PhoneNumber: string;
    TransactionDate: string;
  };
};

// Create a functional component that uses the hook
async function MpesaCallbackHandler(
  callbackData: MpesaCallbackData,
  res: NextApiResponse
) {
  const updateOrderAndProducts = useOrderAndProductUpdater();

  if (callbackData.stkCallback?.ResultCode === "0") {
    const orderId = callbackData.stkCallback.MerchantRequestID;
    const phoneNumber = callbackData.stkCallback.PhoneNumber;
    const transactionDate = callbackData.stkCallback.TransactionDate;

    try {
      const dbUpdateResult = await updateOrderAndProducts();

      if (dbUpdateResult) {
        res.json({
          ResponseCode: "0",
          ResponseDesc: "Transaction processed successfully",
        });
      } else {
        res.json({
          ResponseCode: "1",
          ResponseDesc: "Transaction processed, but database update failed",
        });
      }
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      res.json({
        ResponseCode: "2",
        ResponseDesc: "Error processing the transaction",
      });
    }
  } else {
    res.json({
      ResponseCode: "1",
      ResponseDesc: "Transaction failed",
    });
  }
}

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const rawData = req.body as MpesaCallbackData | null;

      if (rawData && rawData.stkCallback?.ResultCode === "0") {
        const callbackData = rawData as MpesaCallbackData;

        // Rest of your code remains the same
        await MpesaCallbackHandler(callbackData, res);
      } else {
        // Handle cases where rawData is null or ResultCode is not "0"
        res.json({
          ResponseCode: "1",
          ResponseDesc: "Transaction failed",
        });
      }
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      res.json({
        ResponseCode: "2",
        ResponseDesc: "Error processing the transaction",
      });
    }
  } else {
    res.statusCode = 405;
    res.end();
  }
}
