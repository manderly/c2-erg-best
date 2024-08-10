import { createSlice } from '@reduxjs/toolkit';

export const ergDataSlice = createSlice({
    name: 'ergData',
    initialState: {
        hasRowErg: false,
        hasBikeErg: false,
        hasSkiErg: false,
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
        }
    },
});

export const { setHasRowErg, setHasBikeErg, setHasSkiErg } = ergDataSlice.actions

export default ergDataSlice.reducer;