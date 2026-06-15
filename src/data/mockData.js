// flagcdn.com ISO codes for flag images
export const TEAMS = [
  { id: 'bra', name: 'Brazil',      flagCode: 'br', group: 'A' },
  { id: 'fra', name: 'France',      flagCode: 'fr', group: 'A' },
  { id: 'arg', name: 'Argentina',   flagCode: 'ar', group: 'B' },
  { id: 'ger', name: 'Germany',     flagCode: 'de', group: 'B' },
  { id: 'eng', name: 'England',     flagCode: 'gb-eng', group: 'C' },
  { id: 'spa', name: 'Spain',       flagCode: 'es', group: 'C' },
  { id: 'por', name: 'Portugal',    flagCode: 'pt', group: 'D' },
  { id: 'ned', name: 'Netherlands', flagCode: 'nl', group: 'D' },
  { id: 'ita', name: 'Italy',       flagCode: 'it', group: 'E' },
  { id: 'bel', name: 'Belgium',     flagCode: 'be', group: 'E' },
  { id: 'uru', name: 'Uruguay',     flagCode: 'uy', group: 'F' },
  { id: 'usa', name: 'USA',         flagCode: 'us', group: 'F' },
];

export function flagUrl(code) {
  return `https://flagcdn.com/w80/${code}.png`;
}

export const PLAYERS = {
  bra: ['Vinicius Jr', 'Rodrygo', 'Endrick', 'Raphinha', 'Lucas Paquetá'],
  fra: ['Kylian Mbappé', 'Antoine Griezmann', 'Ousmane Dembélé', 'Marcus Thuram', 'Aurélien Tchouaméni'],
  arg: ['Lionel Messi', 'Julián Álvarez', 'Rodrigo De Paul', 'Paulo Dybala', 'Lautaro Martínez'],
  ger: ['Florian Wirtz', 'Leroy Sané', 'Kai Havertz', 'Jamal Musiala', 'Toni Kroos'],
  eng: ['Harry Kane', 'Jude Bellingham', 'Phil Foden', 'Bukayo Saka', 'Marcus Rashford'],
  spa: ['Pedri', 'Gavi', 'Lamine Yamal', 'Álvaro Morata', 'Rodri'],
  por: ['Cristiano Ronaldo', 'Bruno Fernandes', 'Rafael Leão', 'Bernardo Silva', 'Vitinha'],
  ned: ['Virgil van Dijk', 'Cody Gakpo', 'Memphis Depay', 'Frenkie de Jong', 'Xavi Simons'],
  ita: ['Federico Chiesa', 'Nicolò Barella', 'Sandro Tonali', 'Gianluca Scamacca', 'Lorenzo Pellegrini'],
  bel: ['Kevin De Bruyne', 'Romelu Lukaku', 'Alexis Saelemaekers', 'Dodi Lukebakio', 'Amadou Onana'],
  uru: ['Darwin Núñez', 'Federico Valverde', 'Rodrigo Bentancur', 'Luis Suárez', 'Ronald Araújo'],
  usa: ['Christian Pulisic', 'Weston McKennie', 'Brenden Aaronson', 'Josh Sargent', 'Gio Reyna'],
};

export const MATCHES = [
  {
    id: 'm1',
    homeTeam: 'bra', awayTeam: 'fra',
    stage: 'Group A', stadium: 'MetLife Stadium', city: 'New York',
    kickoff: '2026-06-20T20:00:00', status: 'upcoming', featured: true, result: null,
  },
  {
    id: 'm2',
    homeTeam: 'arg', awayTeam: 'ger',
    stage: 'Group B', stadium: 'SoFi Stadium', city: 'Los Angeles',
    kickoff: '2026-06-21T18:00:00', status: 'upcoming', featured: false, result: null,
  },
  {
    id: 'm3',
    homeTeam: 'eng', awayTeam: 'spa',
    stage: 'Group C', stadium: 'AT&T Stadium', city: 'Dallas',
    kickoff: '2026-06-22T20:00:00', status: 'completed', featured: false,
    result: { homeScore: 2, awayScore: 1, scorer: 'Harry Kane', assister: 'Jude Bellingham', motm: 'Jude Bellingham' },
  },
  {
    id: 'm4',
    homeTeam: 'por', awayTeam: 'ned',
    stage: 'Group D', stadium: "Levi's Stadium", city: 'San Francisco',
    kickoff: '2026-06-23T20:00:00', status: 'completed', featured: false,
    result: { homeScore: 1, awayScore: 1, scorer: 'Cristiano Ronaldo', assister: 'Bruno Fernandes', motm: 'Virgil van Dijk' },
  },
  {
    id: 'm5',
    homeTeam: 'ita', awayTeam: 'bel',
    stage: 'Group E', stadium: 'Arrowhead Stadium', city: 'Kansas City',
    kickoff: '2026-06-24T20:00:00', status: 'upcoming', featured: false, result: null,
  },
  {
    id: 'm6',
    homeTeam: 'uru', awayTeam: 'usa',
    stage: 'Group F', stadium: 'Gillette Stadium', city: 'Boston',
    kickoff: '2026-06-25T20:00:00', status: 'upcoming', featured: false, result: null,
  },
];
