import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Rooms from './pages/Rooms';
import Leaderboard from './pages/Leaderboard';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F0F0EE' }}>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <Notification />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
