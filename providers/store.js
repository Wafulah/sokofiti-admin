"use client"
// store.js
import { proxy } from 'valtio';

export const paymentDataStore = proxy({
  name: '',
  phoneNo: '',
  productIds: [],
});
