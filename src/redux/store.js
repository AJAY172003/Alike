// Redux store
import { configureStore } from '@reduxjs/toolkit';
import DataSlice from './DataSlice';

const store = configureStore({
  reducer: {
    data: DataSlice,
  },
});

export default store;