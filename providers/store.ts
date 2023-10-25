import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define your payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    name: '',
    phoneNo: '',
    productIds: [] as string[],
  },
  reducers: {
    updatePaymentData: (state, action: PayloadAction<{ name: string, phoneNo: string, productIds: string[] }>) => {
      const { name, phoneNo, productIds } = action.payload;
      state.name = name;
      state.phoneNo = phoneNo;
      state.productIds = productIds;
    },
  },
});

// Export actions and reducer from the slice
export const { updatePaymentData } = paymentSlice.actions;
export const paymentReducer = paymentSlice.reducer;

// Create the Redux store
const store = configureStore({
  reducer: {
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
