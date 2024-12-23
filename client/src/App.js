import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home';
import Signup from './components/Authentication/signup'
import Login from './components/Authentication/login';
import Questions from './pages/Questions/Questions';
import Answers from './pages/Answers/Answers';
import ProfilePage from './components/Profile/Profile';
import ThemeProviderComponent from './context/ThemeProviderComponent';
import MarketPlace from './pages/MarketPlace/marketPlace';
import Auction from './components/MarketPlace/Auction';
import ViewProductDetails from './components/MarketPlace/ViewProductDetails';
import Checkout from './components/MarketPlace/checkout';
import MechanicProposals from './pages/Mechanic Proposals/MechanicProposals';
import Request from './components/Mechanic Proposals/Request';
import ProposalDetails from './components/Mechanic Proposals/ProposalDetails';
import ContactUs from './pages/Contact Us/ContactUs';
import ResetPassword from './components/Authentication/resestPassword';

function App() {
  return (
    <ThemeProviderComponent>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resetPassword/:token" element={<ResetPassword /> } />
        <Route path="/Questions" element={<Questions />} />
        <Route path="/Questions/:questionId" element={<Answers />} />
        <Route path="/Profile/:userId" element={<ProfilePage />} />
        <Route path="/Market Place" element={<MarketPlace />} />
        <Route path="/Market Place/Auction/:productId" element={<Auction />} />
        <Route path="/Market Place/Product/:productId" element={<ViewProductDetails />} />
        <Route path="/Market Place/Checkout/:productId" element={<Checkout />} />
        <Route path="/Mechanic Proposals" element={<MechanicProposals />} />
        <Route path="/Mechanic Proposals/Request" element={<Request />} />
        <Route path="/Mechanic Proposals/Proposal/:proposalId" element={<ProposalDetails />}  />
        <Route path="/Contact Us" element={<ContactUs />} />
      </Routes>
    </Router>
    </ThemeProviderComponent>
  );
}

export default App;
