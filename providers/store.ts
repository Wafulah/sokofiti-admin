// store.ts
import { createStore } from 'redux';

// Define an initial state
const initialState = {
  name: '',
  phoneNo: '',
  productIds: [],
};

// Define a reducer to update the state
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_PAYMENT_DATA':
      return {
        ...state,
        name: action.payload.name,
        phoneNo: action.payload.phoneNo,
        productIds: action.payload.productIds,
      };
    default:
      return state;
  }
};

// Create the Redux store
const store = createStore(reducer);

export default store;
