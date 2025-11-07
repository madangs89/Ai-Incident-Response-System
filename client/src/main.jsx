import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { store } from "./redux/store/store.js";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          containerStyle={{ zIndex: 9999999999999 }}
          toastOptions={{
            success: {
              style: {
                background: "white",
                color: "black",
              },
            },
            error: {
              style: {
                background: "white",
                color: "red",
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
);
