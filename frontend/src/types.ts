export interface Punishment {
  punishment_type: number;
  reason: string;
  punishment_id: number;
  created_time: string;
  verified_time: string | null;
  verified_by: string | null;
  amount: number;

  // name: string;
  // number: number;
  // id: number;
  // price: number;
  // imageurl: string;

  // givenBy: string;
  // givenTime: string;
}

export interface CreatePunishment {
  punishment_type: number;
  reason: string;
  amount: number;
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
  name: string;
  value: number;
  logo_url: string;
  punishment_type_id: number;
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
  active: boolean;
}

export interface Group {
  group_id: number;
  name: string;
  rules: string;
  logoUrl: string;
  punishment_types: PunishmentType[];
  members: User[];
}
