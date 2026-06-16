import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Insights from './pages/Insights';
import About from './pages/About';
import Rewards from './pages/Rewards';
import Groups from './pages/Groups';
import Schedule from './pages/Schedule';
import Rooms from './pages/Rooms';
import Leaderboard from './pages/Leaderboard';
import Dev from './pages/Dev';
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
            <Route path="/insights" element={<Insights />} />
            <Route path="/about" element={<About />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/dev" element={<Dev />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
