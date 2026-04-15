// data.ts

export interface Data {
  id: number;
  name: string;
  krsaid: string;
  rsfiid: string;
  dob: string;
  gender: string;
  category: string;
  discipline: string;
  district: string;
  club: string;
}

export function createData(
  id: number,
  name: string,
  krsaid: string,
  rsfiid: string,
  dob: string,
  gender: string,
  category: string,
  discipline: string,
  district: string,
  club: string
): Data {
  return {
    id,
    name,
    krsaid,
    rsfiid,
    dob,
    gender,
    category,
    discipline,
    district,
    club,
  };
}

export const rows: Data[] = [
  createData(1,"Rahul", "KRS123", "RSF456", "2000-05-10", "Male", "Senior", "Skating", "Bangalore", "Speed Club"),
  createData(2,"Anjali", "KRS124", "RSF457", "2002-08-15", "Female", "Junior", "Roller", "Mysore", "Champ Club"),
];