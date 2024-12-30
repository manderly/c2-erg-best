import { createSlice } from "@reduxjs/toolkit";

export const ergDataSlice = createSlice({
  name: "ergData",
  initialState: {
    hasRowErg: false,
    hasBikeErg: false,
    hasSkiErg: false,
    isDoneLoadingCSVData: false,
    viewingYear: "2024",
  },
  reducers: {
    setHasRowErg: (state) => {
      state.hasRowErg = true;
    },
    setHasBikeErg: (state) => {
      state.hasBikeErg = true;
    },
    setHasSkiErg: (state) => {
      state.hasSkiErg = true;
    },
    setIsDoneLoadingCSVData: (state, action) => {
      state.isDoneLoadingCSVData = action.payload;
    },
    setViewingYear: (state, action) => {
      state.viewingYear = action.payload;
    },
  },
});

export const {
  setHasRowErg,
  setHasBikeErg,
  setHasSkiErg,
  setIsDoneLoadingCSVData,
  setViewingYear,
} = ergDataSlice.actions;

export default ergDataSlice.reducer;
