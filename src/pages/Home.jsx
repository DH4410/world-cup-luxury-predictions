import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS } from '../data/mockData';

function getTeam(id) {
  return TEAMS.find(t => t.id === id);
}

function formatKickoff(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' — ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ET';
}

export default function Home() {
  const { matches, leaderboard } = useApp();
  const featured = matches.find(m => m.featured);
  const upcoming = matches.filter(m => m.status === 'upcoming').slice(0, 3);
  const topThree = leaderboard.slice(0, 3);

  const home = featured ? getTeam(featured.homeTeam) : null;
  const away = featured ? getTeam(featured.awayTeam) : null;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal-900 min-h-[85vh] flex items-center">
        {/* Atmospheric background layer */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(ellipse at 70% 50%, #D4AF37 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, #D4AF37 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-transparent to-charcoal-900/80" />

        {/* Gold horizontal rule decoration */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="max-w-3xl">
            <p className="editorial-label text-gold-500 mb-6 tracking-widest">
              FIFA World Cup 2026 &mdash; Official Prediction Suite
            </p>
            <h1 className="editorial-heading text-5xl lg:text-7xl text-cream-50 mb-6 leading-none">
              The Art of the Game.<br />
              <em>The Precision<br />of Prediction.</em>
            </h1>
            <p className="font-sans text-sm text-cream-300 leading-relaxed max-w-xl mb-10 font-light">
              A refined forecasting experience for the discerning football mind.
              Submit your match predictions, earn points, challenge your circle, and rise through the ranks.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/predict" className="btn-gold">
                Submit Predictions <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
              <Link to="/rooms" className="btn-ghost border-cream-300 text-cream-300 hover:border-cream-50 hover:text-cream-50">
                Enter the Room <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30" />
      </section>

      {/* Issue date strip */}
      <div className="border-b border-cream-200 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex items-center justify-between">
          <p className="editorial-label text-charcoal-400">
            Vol. I &mdash; Issue No. 01 &mdash; Season 2026
          </p>
          <p className="editorial-label text-charcoal-400 hidden sm:block">
            USA · Canada · Mexico
          </p>
        </div>
      </div>

      {/* Featured Match */}
      {featured && home && away && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="flex items-center gap-4 mb-10">
            <span className="editorial-label text-charcoal-400">Featured Match</span>
            <div className="flex-1 h-px bg-cream-200" />
            <span className="gold-badge">Today's Fixture</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-0 border border-cream-200">
            {/* Match visual */}
            <div className="bg-charcoal-900 p-10 lg:p-16 flex flex-col justify-between min-h-64">
              <div>
                <p className="editorial-label text-gold-500 mb-6">{featured.stage}</p>
                <div className="flex items-center gap-6 lg:gap-10 mb-6">
                  <div className="text-center">
                    <div className="text-5xl mb-3">{home.flag}</div>
                    <p className="editorial-heading text-2xl text-cream-50">{home.name}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="editorial-heading text-4xl text-gold-500 tracking-widest">vs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl mb-3">{away.flag}</div>
                    <p className="editorial-heading text-2xl text-cream-50">{away.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-cream-300">
                  <MapPin size={12} strokeWidth={1.5} />
                  <span className="font-sans text-xs">{featured.stadium}, {featured.city}</span>
                </div>
                <div className="flex items-center gap-1.5 text-cream-300">
                  <Clock size={12} strokeWidth={1.5} />
                  <span className="font-sans text-xs">{formatKickoff(featured.kickoff)}</span>
                </div>
              </div>
            </div>

            {/* Match details */}
            <div className="p-10 lg:p-16 bg-white border-l border-cream-200 flex flex-col justify-between">
              <div>
                <p className="editorial-label text-charcoal-400 mb-3">Match Preview</p>
                <h2 className="editorial-heading text-3xl mb-4">
                  {home.name} face {away.name}<br />in the standout Group A tie.
                </h2>
                <p className="font-sans text-sm text-charcoal-600 leading-relaxed font-light">
                  A clash between two tournament favourites. Brazil arrive with the pace and flair of Vinicius Jr,
                  while France boast the generational talent of Mbappé. One of the group stage's unmissable encounters.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-cream-200 flex gap-3">
                <Link to={`/predict`} className="btn-primary flex-1 justify-center text-xs">
                  Predict This Match <ArrowRight size={12} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Fixtures */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="flex items-center gap-4 mb-10">
          <span className="editorial-label text-charcoal-400">Upcoming Fixtures</span>
          <div className="flex-1 h-px bg-cream-200" />
          <Link to="/predict" className="editorial-label text-charcoal-400 hover:text-charcoal-800 transition-colors no-underline flex items-center gap-1">
            View All <ArrowRight size={10} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-0 border border-cream-200">
          {upcoming.map((match, i) => {
            const h = getTeam(match.homeTeam);
            const a = getTeam(match.awayTeam);
            return (
              <div key={match.id} className={`p-8 bg-white card-hover ${i < upcoming.length - 1 ? 'border-r border-cream-200' : ''}`}>
                <p className="editorial-label text-charcoal-400 mb-4">{match.stage}</p>
                <div className="flex items-center justify-between mb-5">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{h?.flag}</div>
                    <p className="font-sans text-xs font-medium text-charcoal-800">{h?.name}</p>
                  </div>
                  <p className="editorial-heading text-xl text-charcoal-400">vs</p>
                  <div className="text-center">
                    <div className="text-3xl mb-2">{a?.flag}</div>
                    <p className="font-sans text-xs font-medium text-charcoal-800">{a?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-400">
                  <Clock size={10} strokeWidth={1.5} />
                  <span className="font-sans text-xs">{new Date(match.kickoff).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="bg-cream-100 border-t border-b border-cream-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-10">
            <span className="editorial-label text-charcoal-400">Global Leaderboard</span>
            <div className="flex-1 h-px bg-cream-300" />
            <Link to="/leaderboard" className="editorial-label text-charcoal-400 hover:text-charcoal-800 transition-colors no-underline flex items-center gap-1">
              Full Standings <ArrowRight size={10} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {topThree.map((u, i) => (
              <div key={u.id} className={`bg-white border p-8 relative ${i === 0 ? 'border-gold-500' : 'border-cream-200'}`}>
                {i === 0 && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-500" />
                )}
                <div className="flex items-start justify-between mb-6">
                  <span className={`editorial-heading text-4xl ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : 'rank-3'}`}>
                    {['I', 'II', 'III'][i]}
                  </span>
                  {i === 0 && <Star size={14} className="text-gold-500 mt-1" strokeWidth={1.5} fill="currentColor" />}
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-charcoal-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-cream-50 text-xs font-medium font-sans">{u.avatar}</span>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-charcoal-900">{u.name}</p>
                    <p className="font-sans text-xs text-charcoal-400">{u.country}</p>
                  </div>
                </div>
                <div className="border-t border-cream-200 pt-4">
                  <p className="editorial-heading text-3xl text-charcoal-900">{u.totalPoints}</p>
                  <p className="editorial-label text-charcoal-400 mt-1">Total Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring guide */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="flex items-center gap-4 mb-10">
          <span className="editorial-label text-charcoal-400">Scoring System</span>
          <div className="flex-1 h-px bg-cream-200" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-cream-200">
          {[
            { pts: '5', label: 'Exact Scoreline', desc: 'Predict the precise full-time score' },
            { pts: '2', label: 'Correct Outcome', desc: 'Win, draw, or loss — direction is right' },
            { pts: '2', label: 'Goalscorer', desc: 'First or anytime goalscorer named correctly' },
            { pts: '1', label: 'Assist / MOTM', desc: 'Assist maker or Man of the Match' },
          ].map((item, i) => (
            <div key={i} className={`p-8 bg-white ${i < 3 ? 'border-r border-cream-200' : ''}`}>
              <p className="editorial-heading text-5xl text-gold-500 mb-2">{item.pts}</p>
              <p className="editorial-label text-charcoal-400 mb-1">pts</p>
              <p className="font-sans text-sm font-medium text-charcoal-900 mt-3 mb-1">{item.label}</p>
              <p className="font-sans text-xs text-charcoal-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
