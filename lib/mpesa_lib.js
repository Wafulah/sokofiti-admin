async function getAccessToken() {
  const consumerKey = "2naihe8WSrt613PtTfeodf8EUG0ZAC3A"; // Replace with your actual consumer key
  const consumerSecret = "NoKBCueAlDdGw9by"; // Replace with your actual consumer secret

  // Encode the consumer key and secret
  const base64Credentials = btoa(`${consumerKey}:${consumerSecret}`);

  const headers = new Headers();
  headers.append("Authorization", `Basic ${base64Credentials}`);

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json();

  return data.access_token;
}

function MpesaPay(phoneNumber, amount) {
  return new Promise(async (resolve, reject) => {
    // Your authentication and request setup
    const accessToken = await getAccessToken();

    // Step 2: Build and send the STK push request
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${accessToken}`);

    const currentDatetime = new Date();
    const year = currentDatetime.getFullYear();
    const month = (currentDatetime.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
    const day = currentDatetime.getDate().toString().padStart(2, "0");
    const hours = currentDatetime.getHours().toString().padStart(2, "0");
    const minutes = currentDatetime.getMinutes().toString().padStart(2, "0");
    const seconds = currentDatetime.getSeconds().toString().padStart(2, "0");

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const businessShortCode = "174379"; // Replace with your business short code
    const passKey =
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; // Replace with your passkey

    // Construct the password by concatenating BusinessShortCode, PassKey, and Timestamp
    const password = `${businessShortCode}${passKey}${timestamp}`;

    // You can then encode the password as a Base64 string
    const base64Password = btoa(password);
    const requestPayload = {
      BusinessShortCode: businessShortCode, // Replace with your business shortcode
      Password: base64Password,
      Timestamp: timestamp, // Generate timestamp in the required format
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: businessShortCode, // PartyB can be the same as BusinessShortCode
      PhoneNumber: phoneNumber,
      CallBackURL: "https://sokofiti-admin.vercel.app/api/mpesa-webhook", // Replace with your callback URL
      AccountReference: "Sokofiti", // Replace with your account reference
      TransactionDesc: "Tomatoes", // Replace with your transaction description
    };

    // Sending the STK push request
    fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload), // Corrected: stringifying the payload
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("STK Push Result: ", result);

        // Resolve the promise when the STK push is successful
        resolve(result);
      })
      .catch((error) => {
        console.error("STK Push Error: ", error);

        // Reject the promise if there's an error
        reject(error);
      });
  });
}

export default MpesaPay;
