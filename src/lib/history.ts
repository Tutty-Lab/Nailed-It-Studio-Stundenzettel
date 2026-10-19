// ============================================================================
// Lương & giờ theo TỪNG THÁNG (lịch sử). Mỗi bản ghi chỉ áp dụng cho đúng tháng
// đó, nên sửa hợp đồng chung hay tháng sau không làm đổi số của tháng trước.
//
//   Giờ mục tiêu = Lương tháng ÷ Lương giờ   (khi có cả hai và không nhập tay)
//   Nhập giờ mục tiêu trực tiếp               -> dùng đúng số đó để xếp ca.
//
// Khi bấm „Tạo lịch" cho một tháng, người nào chưa có bản ghi của tháng đó sẽ
// được chốt bản ghi từ hợp đồng hiện tại (freezeMonth) – lịch sử không trôi.
// ============================================================================
import type { Employee, PayrollRecord, Schedule } from "../types";
import { hoursFromPay, recordHours } from "./payRecord";
export { MINDESTLOHN_2026, hoursFromPay, recordHours } from "./payRecord";
import { monthlyTargetMinutesFor } from "./contract";
import type { WorkHoursConfig } from "./workHours";

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Không còn dữ liệu cũ cần nạp: app bắt đầu từ 10/2026, không nhập lại giấy. */
export function applyReportedHistory(schedule: Schedule): Schedule {
  return schedule;
}

/** Bản ghi của tháng (nếu có) thay cho hợp đồng chung, không chia tỉ lệ lại. */
export function employeeForMonth(employee: Employee, month: string): Employee {
  const record = employee.payrollRecords?.find((r) => r.month === month);
  return record ? { ...employee, weeklyHours: undefined, targetMinutes: Math.round(recordHours(record) * 60) } : employee;
}

/** Ai được xếp trong tháng: mọi người; ngày vào/thôi làm lọc ở availability.ts. */
export function employeesForMonth(employees: readonly Employee[], _month: string): Employee[] {
  return [...employees];
}

/** Ghi (hoặc thay) bản ghi tháng của một nhân viên. */
export function upsertRecord(employee: Employee, record: PayrollRecord): Employee {
  const others = (employee.payrollRecords ?? []).filter((r) => r.month !== record.month);
  return { ...employee, payrollRecords: [...others, record].sort((a, b) => a.month.localeCompare(b.month)) };
}

/**
 * Chốt lịch sử cho tháng sắp xếp lịch: ai đang làm mà chưa có bản ghi tháng đó
 * thì lưu lương + giờ hiện tại thành bản ghi của tháng.
 */
export function freezeMonth(
  employees: readonly Employee[],
  month: string,
  openDates: readonly string[],
  workHours: WorkHoursConfig,
): Employee[] {
  return employees.map((employee) => {
    if (employee.isOwner || employee.payrollRecords?.some((r) => r.month === month)) return employee;
    const minutes = monthlyTargetMinutesFor(employee, openDates, workHours);
    if (minutes <= 0) return employee;
    const fromPay = hoursFromPay(employee.monthlySalary, employee.hourlyWage);
    return upsertRecord(employee, {
      month,
      grossEuro: employee.monthlySalary,
      hourlyWage: employee.hourlyWage,
      convertedHours: Math.round((minutes / 60) * 100) / 100,
      manualHours: fromPay == null || Math.abs(fromPay * 60 - minutes) > 1,
    });
  });
}
