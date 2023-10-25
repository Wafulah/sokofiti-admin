import { NextApiResponse } from "next";
import { useOrderAndProductUpdater } from "./components/db-operations";

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
function MpesaCallbackHandler(callbackData: MpesaCallbackData) {
  const updateOrderAndProducts = useOrderAndProductUpdater();

  if (callbackData.stkCallback?.ResultCode === "0") {
    const orderId = callbackData.stkCallback.MerchantRequestID;
    const phoneNumber = callbackData.stkCallback.PhoneNumber;
    const transactionDate = callbackData.stkCallback.TransactionDate;

    updateOrderAndProducts()
      .then((dbUpdateResult: boolean) => {
        // Assuming dbUpdateResult is of type boolean
        if (dbUpdateResult) {
          return { ResponseCode: "0", ResponseDesc: "Transaction processed successfully" };
        } else {
          return { ResponseCode: "1", ResponseDesc: "Transaction processed, but database update failed" };
        }
      })
      .catch((error: Error) => {
        console.error("Error processing M-Pesa callback:", error);
        return { ResponseCode: "2", ResponseDesc: "Error processing the transaction" };
      });
  } else {
    return { ResponseCode: "1", ResponseDesc: "Transaction failed" };
  }
}

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const rawData = req.body as MpesaCallbackData | null;

      if (rawData && rawData.stkCallback?.ResultCode === "0") {
        const callbackData = rawData as MpesaCallbackData;

        const response = await MpesaCallbackHandler(callbackData);
        res.status(200).json(response);
      } else {
        // Handle cases where rawData is null or ResultCode is not "0"
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
    res.status(405).end();
  }
}
