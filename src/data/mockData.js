export function flagUrl(code) {
  return `https://flagcdn.com/w80/${code}.png`;
}

export const TEAMS = [
  { id: 'bra', name: 'Brazil',       flagCode: 'br',     group: 'A' },
  { id: 'ger', name: 'Germany',      flagCode: 'de',     group: 'A' },
  { id: 'srb', name: 'Serbia',       flagCode: 'rs',     group: 'A' },
  { id: 'fra', name: 'France',       flagCode: 'fr',     group: 'B' },
  { id: 'por', name: 'Portugal',     flagCode: 'pt',     group: 'B' },
  { id: 'mar', name: 'Morocco',      flagCode: 'ma',     group: 'B' },
  { id: 'eng', name: 'England',      flagCode: 'gb-eng', group: 'C' },
  { id: 'ned', name: 'Netherlands',  flagCode: 'nl',     group: 'C' },
  { id: 'cro', name: 'Croatia',      flagCode: 'hr',     group: 'C' },
  { id: 'spa', name: 'Spain',        flagCode: 'es',     group: 'D' },
  { id: 'arg', name: 'Argentina',    flagCode: 'ar',     group: 'D' },
  { id: 'mex', name: 'Mexico',       flagCode: 'mx',     group: 'D' },
  { id: 'usa', name: 'USA',          flagCode: 'us',     group: 'E' },
  { id: 'jpn', name: 'Japan',        flagCode: 'jp',     group: 'E' },
  { id: 'pol', name: 'Poland',       flagCode: 'pl',     group: 'E' },
  { id: 'can', name: 'Canada',       flagCode: 'ca',     group: 'F' },
  { id: 'bel', name: 'Belgium',      flagCode: 'be',     group: 'F' },
  { id: 'kor', name: 'South Korea',  flagCode: 'kr',     group: 'F' },
  { id: 'ita', name: 'Italy',        flagCode: 'it',     group: 'G' },
  { id: 'uru', name: 'Uruguay',      flagCode: 'uy',     group: 'G' },
  { id: 'col', name: 'Colombia',     flagCode: 'co',     group: 'G' },
  { id: 'den', name: 'Denmark',      flagCode: 'dk',     group: 'H' },
  { id: 'ecu', name: 'Ecuador',      flagCode: 'ec',     group: 'H' },
  { id: 'sen', name: 'Senegal',      flagCode: 'sn',     group: 'H' },
];

export const GROUPS = {
  A: { teams: ['bra', 'ger', 'srb'] },
  B: { teams: ['fra', 'por', 'mar'] },
  C: { teams: ['eng', 'ned', 'cro'] },
  D: { teams: ['spa', 'arg', 'mex'] },
  E: { teams: ['usa', 'jpn', 'pol'] },
  F: { teams: ['can', 'bel', 'kor'] },
  G: { teams: ['ita', 'uru', 'col'] },
  H: { teams: ['den', 'ecu', 'sen'] },
};

export const PLAYERS = {
  bra: ['Vinicius Jr', 'Rodrygo', 'Endrick', 'Raphinha', 'Bruno Guimarães'],
  fra: ['Kylian Mbappé', 'Antoine Griezmann', 'Eduardo Camavinga', 'Aurélien Tchouaméni', 'Marcus Thuram'],
  arg: ['Lionel Messi', 'Julián Álvarez', 'Enzo Fernández', 'Paulo Dybala', 'Lautaro Martínez'],
  ger: ['Jamal Musiala', 'Florian Wirtz', 'Kai Havertz', 'Leroy Sané', 'Toni Kroos'],
  eng: ['Harry Kane', 'Jude Bellingham', 'Phil Foden', 'Bukayo Saka', 'Declan Rice'],
  spa: ['Pedri', 'Gavi', 'Lamine Yamal', 'Álvaro Morata', 'Rodri'],
  por: ['Cristiano Ronaldo', 'Bruno Fernandes', 'Rafael Leão', 'Bernardo Silva', 'Vitinha'],
  ned: ['Virgil van Dijk', 'Cody Gakpo', 'Frenkie de Jong', 'Xavi Simons', 'Tijjani Reijnders'],
  ita: ['Federico Chiesa', 'Nicolò Barella', 'Gianluca Scamacca', 'Sandro Tonali', 'Gianluigi Donnarumma'],
  bel: ['Kevin De Bruyne', 'Romelu Lukaku', 'Lois Openda', 'Amadou Onana', 'Dodi Lukebakio'],
  uru: ['Darwin Núñez', 'Federico Valverde', 'Manuel Ugarte', 'Ronald Araújo', 'Rodrigo Bentancur'],
  usa: ['Christian Pulisic', 'Gio Reyna', 'Weston McKennie', 'Ricardo Pepi', 'Tyler Adams'],
  srb: ['Dušan Vlahović', 'Aleksandar Mitrović', 'Sergej Milinković-Savić', 'Filip Kostić', 'Nemanja Gudelj'],
  mar: ['Achraf Hakimi', 'Hakim Ziyech', 'Youssef En-Nesyri', 'Sofyan Amrabat', 'Azzedine Ounahi'],
  cro: ['Luka Modrić', 'Mateo Kovačić', 'Ivan Perišić', 'Andrej Kramarić', 'Josip Stanišić'],
  mex: ['Hirving Lozano', 'Santiago Giménez', 'Edson Álvarez', 'Raúl Jiménez', 'Alexis Vega'],
  jpn: ['Kaoru Mitoma', 'Takumi Minamino', 'Daichi Kamada', 'Ritsu Doan', 'Junya Ito'],
  pol: ['Robert Lewandowski', 'Piotr Zieliński', 'Arkadiusz Milik', 'Matty Cash', 'Bartosz Bereszyński'],
  can: ['Alphonso Davies', 'Jonathan David', 'Tajon Buchanan', 'Cyle Larin', 'Stephen Eustáquio'],
  kor: ['Son Heung-min', 'Lee Kang-in', 'Hwang Hee-chan', 'Kim Min-jae', 'Hwang In-beom'],
  col: ['Luis Díaz', 'James Rodríguez', 'Jhon Durán', 'Richard Ríos', 'Wilmar Barrios'],
  den: ['Christian Eriksen', 'Rasmus Højlund', 'Pierre-Emile Højbjerg', 'Joakim Mæhle', 'Andreas Christensen'],
  ecu: ['Moisés Caicedo', 'Enner Valencia', 'Gonzalo Plata', 'Piero Hincapié', 'Ángel Mena'],
  sen: ['Sadio Mané', 'Kalidou Koulibaly', 'Idrissa Gueye', 'Ismaila Sarr', 'Bamba Dieng'],
};

// Group A
const M_A1 = { id: 'mA1', homeTeam: 'bra', awayTeam: 'srb', stage: 'Group A', stadium: 'MetLife Stadium',   city: 'New York',      kickoff: '2026-06-18T17:00:00', status: 'completed', featured: false, result: { homeScore: 2, awayScore: 0, scorer: 'Vinicius Jr',    assister: 'Rodrygo',           motm: 'Vinicius Jr' } };
const M_A2 = { id: 'mA2', homeTeam: 'ger', awayTeam: 'srb', stage: 'Group A', stadium: 'Rose Bowl',          city: 'Los Angeles',   kickoff: '2026-06-22T17:00:00', status: 'completed', featured: false, result: { homeScore: 3, awayScore: 1, scorer: 'Kai Havertz',    assister: 'Jamal Musiala',     motm: 'Jamal Musiala' } };
const M_A3 = { id: 'mA3', homeTeam: 'bra', awayTeam: 'ger', stage: 'Group A', stadium: 'MetLife Stadium',   city: 'New York',      kickoff: '2026-06-26T20:00:00', status: 'upcoming',  featured: true,  result: null };
// Group B
const M_B1 = { id: 'mB1', homeTeam: 'fra', awayTeam: 'mar', stage: 'Group B', stadium: 'AT&T Stadium',       city: 'Dallas',        kickoff: '2026-06-18T20:00:00', status: 'completed', featured: false, result: { homeScore: 1, awayScore: 0, scorer: 'Kylian Mbappé',  assister: 'Antoine Griezmann', motm: 'Kylian Mbappé' } };
const M_B2 = { id: 'mB2', homeTeam: 'por', awayTeam: 'mar', stage: 'Group B', stadium: 'Levi\'s Stadium',    city: 'San Francisco', kickoff: '2026-06-22T20:00:00', status: 'completed', featured: false, result: { homeScore: 2, awayScore: 1, scorer: 'Cristiano Ronaldo', assister: 'Bruno Fernandes', motm: 'Cristiano Ronaldo' } };
const M_B3 = { id: 'mB3', homeTeam: 'fra', awayTeam: 'por', stage: 'Group B', stadium: 'Hard Rock Stadium',  city: 'Miami',         kickoff: '2026-06-27T20:00:00', status: 'upcoming',  featured: false, result: null };
// Group C
const M_C1 = { id: 'mC1', homeTeam: 'eng', awayTeam: 'cro', stage: 'Group C', stadium: 'Gillette Stadium',   city: 'Boston',        kickoff: '2026-06-19T14:00:00', status: 'completed', featured: false, result: { homeScore: 2, awayScore: 0, scorer: 'Harry Kane',     assister: 'Jude Bellingham',   motm: 'Jude Bellingham' } };
const M_C2 = { id: 'mC2', homeTeam: 'ned', awayTeam: 'cro', stage: 'Group C', stadium: 'Arrowhead Stadium',  city: 'Kansas City',   kickoff: '2026-06-23T17:00:00', status: 'completed', featured: false, result: { homeScore: 1, awayScore: 1, scorer: 'Cody Gakpo',     assister: 'Xavi Simons',       motm: 'Luka Modrić' } };
const M_C3 = { id: 'mC3', homeTeam: 'eng', awayTeam: 'ned', stage: 'Group C', stadium: 'Gillette Stadium',   city: 'Boston',        kickoff: '2026-06-28T17:00:00', status: 'upcoming',  featured: false, result: null };
// Group D
const M_D1 = { id: 'mD1', homeTeam: 'spa', awayTeam: 'mex', stage: 'Group D', stadium: 'Estadio Azteca',     city: 'Mexico City',   kickoff: '2026-06-19T17:00:00', status: 'completed', featured: false, result: { homeScore: 1, awayScore: 0, scorer: 'Lamine Yamal',   assister: 'Pedri',             motm: 'Lamine Yamal' } };
const M_D2 = { id: 'mD2', homeTeam: 'arg', awayTeam: 'mex', stage: 'Group D', stadium: 'Estadio Azteca',     city: 'Mexico City',   kickoff: '2026-06-23T20:00:00', status: 'completed', featured: false, result: { homeScore: 2, awayScore: 0, scorer: 'Lionel Messi',   assister: 'Julián Álvarez',    motm: 'Lionel Messi' } };
const M_D3 = { id: 'mD3', homeTeam: 'spa', awayTeam: 'arg', stage: 'Group D', stadium: 'SoFi Stadium',        city: 'Los Angeles',   kickoff: '2026-06-28T20:00:00', status: 'upcoming',  featured: false, result: null };
// Group E
const M_E1 = { id: 'mE1', homeTeam: 'usa', awayTeam: 'pol', stage: 'Group E', stadium: 'SoFi Stadium',        city: 'Los Angeles',   kickoff: '2026-06-20T14:00:00', status: 'upcoming',  featured: false, result: null };
const M_E2 = { id: 'mE2', homeTeam: 'jpn', awayTeam: 'pol', stage: 'Group E', stadium: 'Rose Bowl',            city: 'Los Angeles',   kickoff: '2026-06-24T14:00:00', status: 'upcoming',  featured: false, result: null };
const M_E3 = { id: 'mE3', homeTeam: 'usa', awayTeam: 'jpn', stage: 'Group E', stadium: 'MetLife Stadium',      city: 'New York',      kickoff: '2026-06-29T17:00:00', status: 'upcoming',  featured: false, result: null };
// Group F
const M_F1 = { id: 'mF1', homeTeam: 'can', awayTeam: 'kor', stage: 'Group F', stadium: 'BC Place',             city: 'Vancouver',     kickoff: '2026-06-20T17:00:00', status: 'upcoming',  featured: false, result: null };
const M_F2 = { id: 'mF2', homeTeam: 'bel', awayTeam: 'kor', stage: 'Group F', stadium: 'BC Place',             city: 'Vancouver',     kickoff: '2026-06-24T17:00:00', status: 'upcoming',  featured: false, result: null };
const M_F3 = { id: 'mF3', homeTeam: 'can', awayTeam: 'bel', stage: 'Group F', stadium: 'BMO Field',             city: 'Toronto',       kickoff: '2026-06-29T20:00:00', status: 'upcoming',  featured: false, result: null };
// Group G
const M_G1 = { id: 'mG1', homeTeam: 'ita', awayTeam: 'col', stage: 'Group G', stadium: 'AT&T Stadium',          city: 'Dallas',        kickoff: '2026-06-21T14:00:00', status: 'upcoming',  featured: false, result: null };
const M_G2 = { id: 'mG2', homeTeam: 'uru', awayTeam: 'col', stage: 'Group G', stadium: 'Hard Rock Stadium',     city: 'Miami',         kickoff: '2026-06-25T14:00:00', status: 'upcoming',  featured: false, result: null };
const M_G3 = { id: 'mG3', homeTeam: 'ita', awayTeam: 'uru', stage: 'Group G', stadium: 'AT&T Stadium',          city: 'Dallas',        kickoff: '2026-06-30T17:00:00', status: 'upcoming',  featured: false, result: null };
// Group H
const M_H1 = { id: 'mH1', homeTeam: 'den', awayTeam: 'sen', stage: 'Group H', stadium: 'Arrowhead Stadium',     city: 'Kansas City',   kickoff: '2026-06-21T17:00:00', status: 'upcoming',  featured: false, result: null };
const M_H2 = { id: 'mH2', homeTeam: 'ecu', awayTeam: 'sen', stage: 'Group H', stadium: 'Gillette Stadium',      city: 'Boston',        kickoff: '2026-06-25T17:00:00', status: 'upcoming',  featured: false, result: null };
const M_H3 = { id: 'mH3', homeTeam: 'den', awayTeam: 'ecu', stage: 'Group H', stadium: 'Arrowhead Stadium',     city: 'Kansas City',   kickoff: '2026-06-30T20:00:00', status: 'upcoming',  featured: false, result: null };

export const MATCHES = [
  M_A1, M_A2, M_A3,
  M_B1, M_B2, M_B3,
  M_C1, M_C2, M_C3,
  M_D1, M_D2, M_D3,
  M_E1, M_E2, M_E3,
  M_F1, M_F2, M_F3,
  M_G1, M_G2, M_G3,
  M_H1, M_H2, M_H3,
];

// Simple mock group standings (W D L GF GA)
export const STANDINGS = {
  A: [
    { team: 'bra', w: 1, d: 0, l: 0, gf: 2, ga: 0, pts: 3 },
    { team: 'ger', w: 1, d: 0, l: 0, gf: 3, ga: 1, pts: 3 },
    { team: 'srb', w: 0, d: 0, l: 2, gf: 1, ga: 5, pts: 0 },
  ],
  B: [
    { team: 'por', w: 1, d: 0, l: 0, gf: 2, ga: 1, pts: 3 },
    { team: 'fra', w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3 },
    { team: 'mar', w: 0, d: 0, l: 2, gf: 1, ga: 3, pts: 0 },
  ],
  C: [
    { team: 'eng', w: 1, d: 0, l: 0, gf: 2, ga: 0, pts: 3 },
    { team: 'ned', w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
    { team: 'cro', w: 0, d: 1, l: 1, gf: 1, ga: 3, pts: 1 },
  ],
  D: [
    { team: 'spa', w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3 },
    { team: 'arg', w: 1, d: 0, l: 0, gf: 2, ga: 0, pts: 3 },
    { team: 'mex', w: 0, d: 0, l: 2, gf: 0, ga: 3, pts: 0 },
  ],
  E: [
    { team: 'usa', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'jpn', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'pol', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  ],
  F: [
    { team: 'can', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'bel', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'kor', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  ],
  G: [
    { team: 'ita', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'uru', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'col', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  ],
  H: [
    { team: 'den', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'ecu', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
    { team: 'sen', w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  ],
};
