import { proxy } from 'valtio';

export const paymentDataStore = proxy({
  name: '',
  phoneNo: '',
  productIds: [],
});

// Function to update the payment data
export function updatePaymentData(data) {
  paymentDataStore.name = data.name;
  paymentDataStore.phoneNo = data.phoneNo;
  paymentDataStore.productIds = data.productIds;
}
