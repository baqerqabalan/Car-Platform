import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./components/Sidebar";
import Login from "./pages/Login";
import { isAuthenticated } from "./helpers/authHelper";
import ViewPackages from "./components/MechanicProposals/ViewPackages";
import Answers from "./components/Questions/Answers";
import Notifications from './components/Dashboard/MessagesList';
import Badges from "./components/Dashboard/Widgets/UserView/Badges/Badges";
import BadgesList from "./components/Dashboard/Widgets/UserView/Badges/ViewBadges/BadgesList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/sales" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/mechanic-proposals" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/view-packages" element={isLoggedIn ? <ViewPackages /> : <Login />} />
        <Route path="/questions" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/answers/:questionId" element={isLoggedIn ? <Answers/> : <Login />}/>
        <Route path="/advertisements" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/messages" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/notifications" element={isLoggedIn ? <Notifications /> : <Login />} />
        <Route path="/badges" element={isLoggedIn ? <Badges/> : <Login />}/>
        <Route path="/badges/manage-badges" element={isLoggedIn ? <BadgesList /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;