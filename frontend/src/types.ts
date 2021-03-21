export interface Punishment {
  price: number;
  imageurl: string;
  reason: string;
  verifiedBy: string | null;
  verifiedTime: string | null;
  givenBy: string;
  givenTime: string;
}

export interface PunishmentType {
  id: number;
  name: string;
  value: number;
  imageurl: string;
}

export interface User {
  id: number;
  name: string;
  punishments: Punishment[];
  debt: number;
  totalPaid: number;
  active: boolean;
}

export interface Group {
  id: number;
  name: string;
  rulesUrl: string;
  logoUrl: string;
  punishmentTypes: PunishmentType[];
  members: User[];
}

export interface CreatePunishment {
  name: string;
  reason: string;
  punishments: Punishment[];
}
