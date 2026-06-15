import { createContext, useContext, useState } from 'react';
import { MATCHES, GLOBAL_LEADERBOARD, ROOMS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user] = useState({ id: 'u7', name: 'You', avatar: 'ME', totalPoints: 37 });
  const [predictions, setPredictions] = useState({});
  const [leaderboard, setLeaderboard] = useState(GLOBAL_LEADERBOARD);
  const [rooms, setRooms] = useState(ROOMS);
  const [matches] = useState(MATCHES);
  const [notification, setNotification] = useState(null);

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }

  function login() {
    setIsLoggedIn(true);
    showNotification('Welcome back. Your predictions await.', 'success');
  }

  function logout() {
    setIsLoggedIn(false);
    showNotification('You have signed out.', 'info');
  }

  function savePrediction(matchId, predData) {
    setPredictions(prev => ({ ...prev, [matchId]: predData }));

    // Award points simulation
    const match = matches.find(m => m.id === matchId);
    if (match?.status === 'completed' && match.result) {
      let pts = 0;
      if (predData.homeScore === match.result.homeScore && predData.awayScore === match.result.awayScore) pts += 5;
      else if (
        (predData.homeScore > predData.awayScore && match.result.homeScore > match.result.awayScore) ||
        (predData.homeScore < predData.awayScore && match.result.homeScore < match.result.awayScore) ||
        (predData.homeScore === predData.awayScore && match.result.homeScore === match.result.awayScore)
      ) pts += 2;
      if (predData.scorer === match.result.scorer) pts += 2;
      if (predData.assister === match.result.assister) pts += 1;
      if (predData.motm === match.result.motm) pts += 1;

      if (pts > 0) {
        setLeaderboard(prev =>
          prev.map(u => u.isCurrentUser ? { ...u, totalPoints: u.totalPoints + pts } : u)
            .sort((a, b) => b.totalPoints - a.totalPoints)
        );
        showNotification(`Prediction submitted! You earned ${pts} points.`, 'gold');
      } else {
        showNotification('Prediction locked in. Good luck!', 'success');
      }
    } else {
      showNotification('Prediction locked in. Good luck!', 'success');
    }
  }

  function createRoom(name) {
    const code = name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newRoom = {
      id: 'r' + Date.now(),
      name,
      code,
      members: [{ id: 'u7', name: 'You', avatar: 'ME', totalPoints: 37, isCurrentUser: true }],
      activity: [{ id: 'a0', text: `You created ${name}.`, time: 'Just now' }],
      upcomingMatch: 'm1',
      predictions: { u7: null },
    };
    setRooms(prev => [...prev, newRoom]);
    showNotification(`Room "${name}" created. Share code: ${code}`, 'gold');
    return newRoom;
  }

  function joinRoom(code) {
    const found = rooms.find(r => r.code === code.trim().toUpperCase());
    if (found) {
      showNotification(`Joined "${found.name}" successfully.`, 'gold');
      return found;
    }
    showNotification('Room not found. Please check your code.', 'error');
    return null;
  }

  return (
    <AppContext.Provider value={{
      isLoggedIn, user, login, logout,
      predictions, savePrediction,
      leaderboard, matches, rooms,
      createRoom, joinRoom,
      notification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
