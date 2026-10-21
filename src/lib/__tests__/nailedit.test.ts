import { describe, expect, it } from "vitest";
import { generateSchedule } from "../scheduler";
import { initialScheduleFor, STORES } from "../stores";
import { publicHolidayNames, publicHolidays } from "../holidays";
import { datesOfMonth } from "../demand";
import { resolveDay } from "../workHours";
import { freezeMonth, employeeForMonth, upsertRecord } from "../history";
import { hoursFromPay } from "../payRecord";
import { validateSchedule } from "../validation";
import type { Shift } from "../../types";

const store = STORES[0];
const schedule = initialScheduleFor(store);

function openDatesOf(year: number, month: number) {
  const holidays = publicHolidays(year);
  return datesOfMonth(year, month).filter((d) => !resolveDay(store.workHours, d, holidays, {}).closed);
}

function plan(year: number, month: number, employees = schedule.employees): Shift[] {
  return generateSchedule({
    year, month, workHours: store.workHours, overrides: {}, employees,
    rules: store.staffingRules, weights: store.dayWeights, storeTag: store.id, seed: "test",
  });
}

describe("Nailed it Studio – Stammdaten", () => {
  it("Dresden, sechs Angestellte Start 10/2026", () => {
    expect(schedule.address).toBe("Schössergasse 23, 01067 Dresden");
    expect(schedule.year).toBe(2026);
    expect(schedule.month).toBe(10);
    expect(schedule.employees.filter((e) => !e.isOwner)).toHaveLength(6);
  });

  it("Minijob 630 € ÷ Stundenlohn", () => {
    const ngoc = schedule.employees.find((e) => e.name === "Lê Nguyễn Bảo Ngọc")!;
    expect(ngoc.employmentType).toBe("MINIJOB");
    expect(ngoc.monthlySalary).toBe(630);
    expect(ngoc.targetMinutes).toBe(Math.round(hoursFromPay(630, 13.9)! * 60));
  });

  it("Feiertage Sachsen: Reformationstag und Buß- und Bettag, kein Fronleichnam", () => {
    const names = publicHolidayNames(2026);
    expect(names.get("2026-10-31")).toBe("Reformationstag");
    expect(names.get("2026-11-18")).toBe("Buß- und Bettag");
    expect([...names.values()]).not.toContain("Fronleichnam");
    expect([...names.values()]).not.toContain("Allerheiligen");
  });
});

describe("Nailed it Studio – Oktober 2026", () => {
  const shifts = plan(2026, 10);
  const open = openDatesOf(2026, 10);

  it("jeden offenen Tag: jemand beginnt 09:00 und jemand endet 20:00", () => {
    for (const date of open) {
      const day = shifts.filter((s) => s.date === date);
      expect(day.some((s) => s.startMinutes === 9 * 60), `${date} 09:00`).toBe(true);
      expect(day.some((s) => s.endMinutes === 20 * 60), `${date} 20:00`).toBe(true);
    }
  });

  it("Soll je Person erreicht (± 30 min), Chủ tiệm nicht eingeplant", () => {
    const v = validateSchedule(schedule.employees.filter((e) => !e.isOwner), shifts, 2026, open, store.workHours);
    for (const s of v.summaries) expect(Math.abs(s.diffMinutes), s.employee.name).toBeLessThanOrEqual(30);
    expect(shifts.some((s) => s.employeeId === "nailedit-owner")).toBe(false);
  });

  it("Mo/Do/Fr bekommen mehr Stunden als Di/Mi", () => {
    const per = (days: number[]) => {
      const dates = open.filter((d) => days.includes(new Date(d).getDay()));
      return shifts.filter((s) => dates.includes(s.date)).reduce((n, s) => n + s.paidMinutes, 0) / dates.length;
    };
    expect(per([1, 4, 5])).toBeGreaterThan(per([2, 3]));
  });

  it("lange Schichten haben die gesetzliche Pause", () => {
    for (const s of shifts) {
      if (s.paidMinutes > 6 * 60) expect(s.pauseMinutes).toBeGreaterThanOrEqual(30);
    }
  });
});

describe("Quỳnh Như nur bis Oktober 2026", () => {
  it("im November nicht eingeplant", () => {
    const nov = plan(2026, 11);
    expect(nov.some((s) => s.employeeId === "nailedit-6")).toBe(false);
    expect(nov.length).toBeGreaterThan(0);
  });
});

describe("Lohn-/Stundenhistorie je Monat", () => {
  it("freezeMonth schreibt Werte fest; spätere Vertragsänderung ändert den Vormonat nicht", () => {
    const viet = schedule.employees.find((e) => e.id === "nailedit-1")!;
    const [frozen] = freezeMonth([viet], "2026-10", openDatesOf(2026, 10), store.workHours);
    expect(employeeForMonth(frozen, "2026-10").targetMinutes).toBe(80 * 60);
    const changed = { ...frozen, targetMinutes: 100 * 60 };
    expect(employeeForMonth(changed, "2026-10").targetMinutes).toBe(80 * 60);
    expect(employeeForMonth(changed, "2026-11").targetMinutes).toBe(100 * 60);
  });

  it("Lương tháng ÷ Lương giờ, außer bei direkt eingegebenen Stunden", () => {
    const viet = schedule.employees.find((e) => e.id === "nailedit-1")!;
    const byPay = upsertRecord(viet, { month: "2026-12", grossEuro: 1112, hourlyWage: 13.9, convertedHours: 0 });
    expect(employeeForMonth(byPay, "2026-12").targetMinutes).toBe(80 * 60);
    const manual = upsertRecord(viet, { month: "2026-12", grossEuro: 1112, hourlyWage: 13.9, convertedHours: 60, manualHours: true });
    expect(employeeForMonth(manual, "2026-12").targetMinutes).toBe(60 * 60);
  });
});

describe("Nghỉ qua hai tháng (21.10.–21.11.)", () => {
  it("giảm giờ mục tiêu từng tháng theo ngày mở cửa còn đi làm, không xếp ca ngày nghỉ", async () => {
    const { monthlyTargetMinutesFor } = await import("../contract");
    const viet = { ...schedule.employees.find((e) => e.id === "nailedit-1")!, vacations: [{ start: "2026-10-21", end: "2026-11-21" }] };
    // Okt: 16 von 25 offenen Tagen, Nov: 7 von 24 – auf 30 Minuten gerundet.
    expect(monthlyTargetMinutesFor(viet, openDatesOf(2026, 10), store.workHours)).toBe(51 * 60);
    expect(monthlyTargetMinutesFor(viet, openDatesOf(2026, 11), store.workHours)).toBe(23.5 * 60);
    const employees = schedule.employees.map((e) => (e.id === viet.id ? viet : e));
    const oct = plan(2026, 10, employees).filter((s) => s.employeeId === viet.id);
    expect(oct.some((s) => s.date >= "2026-10-21")).toBe(false);
    expect(oct.reduce((n, s) => n + s.paidMinutes, 0)).toBe(51 * 60);
  });
});

describe("Tháng trước 10/2026", () => {
  it("vẫn tạo được lịch (không có ngày vào làm mặc định)", () => {
    expect(plan(2026, 9).length).toBeGreaterThan(0);
  });
});
