export interface Club {
  id?: number;
  name: string;
  region: string;
  address: string;
  contact: string;
  manager: string;
  affiliationDate?: string;
  latitude?: number;
  longitude?: number;
  swimmers?: any[];
}
