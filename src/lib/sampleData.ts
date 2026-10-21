// ============================================================================
// Startbelegschaft Nailed it Studio (Dresden), gültig ab Oktober 2026.
// Die Papier-Stundenzettel vor 10/2026 werden NICHT nachgetragen.
//
//   Phan Ngô Đức Việt       80 h/Monat
//   Đinh Thị Vân Anh        70 h/Monat
//   Lê Thị Xuân Quỳnh       70 h/Monat
//   Nguyễn Hà Linh          70 h/Monat
//   Lê Nguyễn Bảo Ngọc      Minijob 630 €/Monat -> Stunden = 630 € ÷ Stundenlohn
//                           (vorläufig Mindestlohn 13,90 € => 45,32 h; zu bestätigen)
//   Nguyễn Quỳnh Như        80 h/Monat, letzter Monat 10/2026 (Austritt 31.10.2026,
//                           genauer Tag zu bestätigen)
//
// Die Inhaberin hilft gelegentlich mit; sie steht als „Chủ tiệm" ohne Soll in
// der Liste und wird nur von Hand in den Plan gesetzt.
// ============================================================================

import type { Employee, Schedule } from "../types";
import { NAILEDIT_WORK_HOURS } from "./workHours";
import { MINDESTLOHN_2026, hoursFromPay } from "./payRecord";

export function makeEmployee(
  id: string,
  name: string,
  employmentType: Employee["employmentType"],
  targetHours: number,
): Employee {
  return { id, name, employmentType, targetMinutes: Math.round(targetHours * 60) };
}

/** Mitarbeiter mit WOCHENvertrag – auf der Abrechnung als „Wöch.Arb.Zt.". */
export function makeWeekly(
  id: string,
  name: string,
  employmentType: Employee["employmentType"],
  weeklyHours: number,
): Employee {
  return { id, name, employmentType, targetMinutes: 0, weeklyHours };
}

const WAGE = MINDESTLOHN_2026;

/**
 * Nailed it Studio, Schössergasse 23, 01067 Dresden. Eintrittsdaten unbekannt –
 * ohne startDate lassen sich auch Monate vor 10/2026 planen.
 */
export function naileditEmployees(): Employee[] {
  const fixed = (id: string, name: string, hours: number, extra: Partial<Employee> = {}): Employee => ({
    ...makeEmployee(id, name, "TEILZEIT", hours),
    hourlyWage: WAGE,
    maxDaysPerWeek: 5,
    ...extra,
  });
  return [
    fixed("nailedit-1", "Phan Ngô Đức Việt", 80),
    fixed("nailedit-2", "Đinh Thị Vân Anh", 70),
    fixed("nailedit-3", "Lê Thị Xuân Quỳnh", 70),
    fixed("nailedit-4", "Nguyễn Hà Linh", 70),
    {
      ...makeEmployee("nailedit-5", "Lê Nguyễn Bảo Ngọc", "MINIJOB", hoursFromPay(630, WAGE)!),
      monthlySalary: 630,
      hourlyWage: WAGE,
      maxDaysPerWeek: 5,
    },
    fixed("nailedit-6", "Nguyễn Quỳnh Như", 80, { endDate: "2026-10-31" }),
  ];
}

/** Belegschaft für Tests und Altaufrufe. */
export const SAMPLE_EMPLOYEES: Employee[] = naileditEmployees().map(({ startDate: _s, endDate: _e, ...e }) => e);

export function createSampleSchedule(): Schedule {
  return {
    companyName: "Nailed it Studio",
    address: "Schössergasse 23, 01067 Dresden",
    year: 2026,
    month: 10,
    workHours: structuredClone(NAILEDIT_WORK_HOURS),
    dateOverrides: [],
    employees: naileditEmployees(),
    shifts: [],
  };
}
