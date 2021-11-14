export interface Punishment {
  name: string;
  number: number;
  id: number;
  price: number;
  imageurl: string;
  reason: string;
  verifiedBy: string | null;
  verifiedTime: string | null;
  givenBy: string;
  givenTime: string;
  created_time: string;
}

export interface CreatePunishment {
  name: string;
  reason: string;
  punishments: Punishment[];
}

export interface PunishmentInfo {
  id: number;
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
  user_id: number;
  // name: string;
  // punishments: PunishmentInfo[];
  // debt: number;
  // totalPaid: number;
  // active: boolean;
  // active: true
  email: string;
  first_name: string;
  last_name: string;
  punishments: Punishment[];
}

export interface Group {
  id: number;
  name: string;
  rulesUrl: string;
  logoUrl: string;
  punishmentTypes: PunishmentType[];
  members: User[];
}
