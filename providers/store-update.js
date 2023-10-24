// component-where-you-update-store.js
import { paymentDataStore } from './store';

// Function to update the payment data
export function updatePaymentData(StoreData) {
  paymentDataStore.name = StoreData.name;
  paymentDataStore.phoneNo = StoreData.phoneNo;
  paymentDataStore.productIds = StoreData.productIds;
}

// You can call this function to update the store
