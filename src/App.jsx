import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import Home from './pages/Home';
import Predict from './pages/Predict';
import AllPredictions from './pages/AllPredictions';
import Insights from './pages/Insights';
import Groups from './pages/Groups';
import Schedule from './pages/Schedule';
import Rooms from './pages/Rooms';
import Leaderboard from './pages/Leaderboard';
import TrophyIntro from './components/TrophyIntro';

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
        <TrophyIntro />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/predictions" element={<AllPredictions />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
