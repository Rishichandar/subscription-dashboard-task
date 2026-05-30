import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue("Session expired");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        localStorage.setItem("accessToken", a.payload.accessToken);
        localStorage.setItem("refreshToken", a.payload.refreshToken);
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // Login
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        localStorage.setItem("accessToken", a.payload.accessToken);
        localStorage.setItem("refreshToken", a.payload.refreshToken);
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // Fetch me
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload;
        s.initialized = true;
      })
      .addCase(fetchMe.rejected, (s) => {
        s.user = null;
        s.accessToken = null;
        s.refreshToken = null;
        s.initialized = true;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      // Logout
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null;
        s.accessToken = null;
        s.refreshToken = null;
      });
  },
});

export const { setTokens, clearAuth } = authSlice.actions;
export default authSlice.reducer;
