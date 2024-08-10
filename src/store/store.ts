import { configureStore } from '@reduxjs/toolkit';
import ergDataReducer from "./ergDataSlice.ts";

export const store = configureStore({
    reducer: {
        ergData: ergDataReducer, // Add more reducers as needed
    },
});

// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>