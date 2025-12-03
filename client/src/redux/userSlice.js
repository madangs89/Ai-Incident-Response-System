import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  keys: [],
  selectedKey: "",
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedKey: (state, action) => {
      state.selectedKey = action.payload;
    },
    setKeys: (state, action) => {
      state.keys = action.payload;
    },
    pushKey: (state, action) => {
      state.keys.push(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setSelectedKey, setKeys, setError  ,pushKey} = userSlice.actions;

export const userReducer = userSlice.reducer;
