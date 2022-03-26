import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { useAuthorize } from "./hooks/useAuthorize";
import { useAutoConnect } from "./hooks/useAutoConnect";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useAuthorize();
  useAutoConnect();
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="home" element={<Home />} />
        </Route>
        <Route path="login" element={<Login />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
