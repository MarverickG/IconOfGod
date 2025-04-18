import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import DropPage from './pages/DropPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/drop" element={<DropPage />} />
      </Routes>
    </Router>
  );
}

export default App;