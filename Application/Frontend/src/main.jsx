import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Force login page first on fresh app boot or page reload
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
localStorage.removeItem("activeBranch");
localStorage.removeItem("activeBranchName");
localStorage.removeItem("activeSection");

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
