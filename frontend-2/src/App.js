import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import MapView from "./pages/MapView/MapView";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

//Need AppContent instead of putting everything in App because useLocation needs to be context from <Router>
function AppContent() {

  return (
    <div className="app">
      <div className="mainContent">
        <Routes>
          <Route path="/" element={<MapView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
