import { useState, useEffect } from "react";

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
  const [response, setResponse] = useState<{ ResponseCode: string; ResponseDesc: string } | undefined>(undefined);

  useEffect(() => {
    const processCallback = async () => {
      if (callbackData.stkCallback?.ResultCode === "0") {
        try {
          const dbUpdateResult: boolean = await updateOrderAndProducts();
          if (dbUpdateResult) {
            setResponse({ ResponseCode: "0", ResponseDesc: "Transaction processed successfully" });
          } else {
            setResponse({ ResponseCode: "1", ResponseDesc: "Transaction processed, but database update failed" });
          }
        } catch (error) {
          console.error("Error processing M-Pesa callback:", error);
          setResponse({ ResponseCode: "2", ResponseDesc: "Error processing the transaction" });
        }
      } else {
        setResponse({ ResponseCode: "1", ResponseDesc: "Transaction failed" });
      }
    };

    processCallback();
  }, [callbackData, updateOrderAndProducts]);

  return response;
}



export async function POST(req: Request, res: NextApiResponse): Promise<{ ResponseCode: string; ResponseDesc: string } | undefined> {
  if (req.method === "POST") {
    try {
      const rawData = req.body as MpesaCallbackData | null;

      if (rawData && rawData.stkCallback?.ResultCode === "0") {
        const callbackData = rawData as MpesaCallbackData;

        const response = await MpesaCallbackHandler(callbackData);
        return response;
      } else {
        // Handle cases where rawData is null or ResultCode is not "0"
        return { ResponseCode: "1", ResponseDesc: "Transaction failed" };
      }
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      return { ResponseCode: "2", ResponseDesc: "Error processing the transaction" };
    }
  } else {
    // Handle all requests other than POST requests
    return { ResponseCode: "1", ResponseDesc: "Method Not Allowed" };
  }
}



