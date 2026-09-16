import ExcelJS from 'exceljs';
import type { Project } from './types';
import type { CalcField } from './calc';
import { projectsToRows } from './utils';

export async function downloadProjectsAsXlsx(projects: Project[], calcFields: CalcField[] = [], filename?: string): Promise<void> {
  const { headers, rows } = projectsToRows(projects, calcFields);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Projects');
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) {
    sheet.addRow(row);
  }
  sheet.columns.forEach((col) => {
    col.width = 18;
  });
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `projects-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
