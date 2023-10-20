function MpesaPay(phoneNumber, amount) {
  return new Promise((resolve, reject) => {
    // Your authentication and request setup
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer BfFGNpn3vDzkmjxaEpQdMM4mqgRy");

    const requestPayload = {
      BusinessShortCode: 174379, // Replace with your business shortcode
      Password:
        "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMxMDIwMTQ0MjQ5", // Replace with your password
      Timestamp: new Date().toISOString().replace(/[-:.]/g, "").slice(0, -1), // Generate timestamp in the required format
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: 174379, // PartyB can be the same as BusinessShortCode
      PhoneNumber: phoneNumber,
      CallBackURL: "https://mydomain.com/path", // Replace with your callback URL
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
