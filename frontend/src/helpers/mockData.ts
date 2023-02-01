export interface Punishment {
  date: string;
  reason: string;
  author: string;
}

export interface Person {
  name: string;
  numOfBeers: number;
  numOfWine: number;
  punishments: Punishment[];
}

export const leaderboardData: Person[] = [
  {
    name: "smoothbrain",
    numOfBeers: 4,
    numOfWine: 14,
    punishments: [
      {
        date: "2023-01-01",
        reason: "Bla bla bla",
        author: "B-Rage",
      },
      {
        date: "2023-01-02",
        reason: "Forsinka til møte",
        author: "Thomas",
      },
    ],
  },
  { name: "b-rage", numOfBeers: 2, numOfWine: 99, punishments: [] },
  { name: "thomas", numOfBeers: 17, numOfWine: 20, punishments: [] },
  { name: "anhkha", numOfBeers: 0, numOfWine: 3, punishments: [] },
  { name: "1", numOfBeers: 0, numOfWine: 3, punishments: [] },
  { name: "2", numOfBeers: 0, numOfWine: 3, punishments: [] },
  { name: "3", numOfBeers: 0, numOfWine: 3, punishments: [] },
  { name: "4", numOfBeers: 0, numOfWine: 3, punishments: [] },
];
