export interface Punishment {
  price: number;
  imageurl: string;
  reason: string;
  verifiedBy: string | null;
  verifiedTime: string | null;
  givenBy: string;
  givenTime: string;
}

export interface User {
  id: number;
  name: string;
  punishments: Punishment[];
  active: boolean;
}

export interface Group {
  id: number;
  name: string;
  rulesUrl: string;
  logoUrl: string;
  validPunishments: string[];
  users: User[];
}
