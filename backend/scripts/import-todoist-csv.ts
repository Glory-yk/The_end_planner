/**
 * Todoist CSV Import Script
 *
 * Usage:
 *   cd backend
 *   npx ts-node scripts/import-todoist-csv.ts <your-email>
 *
 * Imports CSV files from project root into the PostgreSQL database.
 * Files: creative.csv, personal.csv, work.csv, Indox.csv
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

// CSV files to import: filename (relative to project root) → project name (null = no project / inbox)
const CSV_FILES: Array<{ file: string; projectName: string | null; completed?: boolean }> = [
  { file: 'creative.csv', projectName: 'creative' },
  { file: 'personal.csv', projectName: 'personal' },
  { file: 'work.csv', projectName: 'work' },
  { file: 'Indox.csv', projectName: null },
  { file: 'completed.csv', projectName: null, completed: true },
];

// ---------------------------------------------------------------------------
// CSV Parser — handles multiline quoted fields and escaped quotes ("")
// ---------------------------------------------------------------------------
function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentField += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        currentField += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if (ch === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else if (ch === '\r') {
        i++; // skip \r in \r\n
      } else {
        currentField += ch;
        i++;
      }
    }
  }

  // Flush last field/row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Date parser — handles ISO, English, and Korean Todoist date formats
// ---------------------------------------------------------------------------
const KO_MONTHS: Record<string, number> = {};
for (let m = 1; m <= 12; m++) KO_MONTHS[`${m}월`] = m;

const EN_MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function parseDate(dateStr: string): { date: string | null; time: string | null } {
  if (!dateStr) return { date: null, time: null };

  // Recurring — cannot represent as a single date
  if (/^(매달|매주|매일|every\s)/i.test(dateStr)) {
    return { date: null, time: null };
  }

  // Infer year: use current year, but if the resulting date is in the future by > 6 months, use last year
  const now = new Date();
  function inferYear(month: number, day: number): number {
    const candidate = new Date(now.getFullYear(), month - 1, day);
    const diffMs = candidate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // If more than 180 days in the future, assume last year
    return diffDays > 180 ? now.getFullYear() - 1 : now.getFullYear();
  }
  const year = now.getFullYear();

  // ISO: "2024-02-22" or "2024-02-22 08:00" or "2024-10-31T08:00..."
  const iso = dateStr.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}))?/);
  if (iso) return { date: iso[1], time: iso[2] ?? null };

  // English: "Dec 16, 2024 12:00AM" / "Feb 26, 2025 10:00AM"
  const eng = dateStr.match(/^(\w{3})\s+(\d+),\s+(\d{4})\s+(\d+):(\d+)(AM|PM)/i);
  if (eng) {
    const mon = EN_MONTHS[eng[1]];
    if (mon) {
      const d = parseInt(eng[2]);
      const y = parseInt(eng[3]);
      let h = parseInt(eng[4]);
      const mi = parseInt(eng[5]);
      const ap = eng[6].toUpperCase();
      if (ap === 'PM' && h < 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      return { date: `${y}-${pad(mon)}-${pad(d)}`, time: `${pad(h)}:${pad(mi)}` };
    }
  }

  // Korean: "2월 26일 오전9:00" / "10월 13일 오전6" / "4월 25일 오후8"
  const kor1 = dateStr.match(/^(\d+)월\s*(\d+)일\s*(오전|오후)(\d+)(?::(\d+))?/);
  if (kor1) {
    const mon = parseInt(kor1[1]);
    const day = parseInt(kor1[2]);
    let h = parseInt(kor1[4]);
    const mi = parseInt(kor1[5] ?? '0');
    if (kor1[3] === '오후' && h < 12) h += 12;
    if (kor1[3] === '오전' && h === 12) h = 0;
    const y = inferYear(mon, day);
    return { date: `${y}-${pad(mon)}-${pad(day)}`, time: `${pad(h)}:${pad(mi)}` };
  }

  // Korean date only: "2월 26일"
  const kor2 = dateStr.match(/^(\d+)월\s*(\d+)일\s*$/);
  if (kor2) {
    const mon = parseInt(kor2[1]);
    const day = parseInt(kor2[2]);
    const y = inferYear(mon, day);
    return { date: `${y}-${pad(mon)}-${pad(day)}`, time: null };
  }

  // Korean time-first: "08시00분 11월13일" / "10시00분 7월 30일"
  const kor3 = dateStr.match(/^(\d+)시(\d+)분\s*(\d+)월\s*(\d+)일/);
  if (kor3) {
    const h = parseInt(kor3[1]);
    const mi = parseInt(kor3[2]);
    const mon = parseInt(kor3[3]);
    const day = parseInt(kor3[4]);
    const y = inferYear(mon, day);
    return { date: `${y}-${pad(mon)}-${pad(day)}`, time: `${pad(h)}:${pad(mi)}` };
  }

  console.warn(`  [WARN] Could not parse date: "${dateStr}"`);
  return { date: null, time: null };
}

// ---------------------------------------------------------------------------
// CSV task row
// ---------------------------------------------------------------------------
interface CsvTask {
  title: string;
  description: string | null;
  priority: number;
  indent: number;
  dateRaw: string | null;
}

function parseCsvFile(filePath: string): CsvTask[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCsvRows(content);
  if (rows.length === 0) return [];

  const header = rows[0];
  const col = (name: string) => header.findIndex((h) => h.trim() === name);

  const TYPE = col('TYPE');
  const CONTENT = col('CONTENT');
  const DESC = col('DESCRIPTION');
  const PRIORITY = col('PRIORITY');
  const INDENT = col('INDENT');
  const DATE = col('DATE');

  const tasks: CsvTask[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const type = (row[TYPE] ?? '').trim();
    if (type !== 'task') continue;

    const title = (row[CONTENT] ?? '').trim();
    if (!title) continue;

    tasks.push({
      title,
      description: row[DESC]?.trim() || null,
      priority: parseInt(row[PRIORITY] ?? '1') || 1,
      indent: parseInt(row[INDENT] ?? '1') || 1,
      dateRaw: row[DATE]?.trim() || null,
    });
  }

  return tasks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const userEmail = process.argv[2];
  if (!userEmail) {
    console.error('Usage: npx ts-node scripts/import-todoist-csv.ts <your-email>');
    process.exit(1);
  }

  // Support both DATABASE_URL (single connection string) and individual env vars
  const client = process.env.DATABASE_URL
    ? new Client({ connectionString: process.env.DATABASE_URL })
    : new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'daily_planner_db',
    });

  await client.connect();
  console.log('✓ Connected to database');

  // Find user
  const userResult = await client.query(
    'SELECT id, email FROM users WHERE email = $1',
    [userEmail],
  );
  if (userResult.rows.length === 0) {
    console.error(`✗ User not found: ${userEmail}`);
    console.log('  Available users:');
    const all = await client.query('SELECT email FROM users LIMIT 10');
    all.rows.forEach((r) => console.log(`    - ${r.email}`));
    await client.end();
    process.exit(1);
  }
  const userId = userResult.rows[0].id as string;
  console.log(`✓ User: ${userResult.rows[0].email} (${userId})\n`);

  // Project root is two levels above backend/scripts/
  const csvDir = path.join(__dirname, '../../');

  let totalImported = 0;

  for (const { file, projectName, completed } of CSV_FILES) {
    const filePath = path.join(csvDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠  Skipping ${file} — file not found`);
      continue;
    }

    console.log(`Processing ${file}${projectName ? ` → project "${projectName}"` : ' → inbox (no project)'}...`);

    // Create or reuse project
    let projectId: string | null = null;
    if (projectName) {
      const existing = await client.query(
        'SELECT id FROM projects WHERE LOWER(name) = LOWER($1) AND "userId" = $2',
        [projectName, userId],
      );
      if (existing.rows.length > 0) {
        projectId = existing.rows[0].id as string;
        console.log(`  → reusing project "${projectName}" (${projectId})`);
      } else {
        const created = await client.query(
          `INSERT INTO projects (id, name, "userId", "sortOrder", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, 0, NOW(), NOW()) RETURNING id`,
          [projectName, userId],
        );
        projectId = created.rows[0].id as string;
        console.log(`  → created project "${projectName}" (${projectId})`);
      }
    }

    const tasks = parseCsvFile(filePath);
    console.log(`  → ${tasks.length} tasks found`);

    for (const task of tasks) {
      const { date, time } = task.dateRaw ? parseDate(task.dateRaw) : { date: null, time: null };
      const isCompleted = completed === true;

      await client.query(
        `INSERT INTO tasks
           (id, "userId", "projectId", title, description, "isCompleted",
            priority, indent, "scheduledDate", "startTime", "createdAt", "updatedAt")
         VALUES
           (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [userId, projectId, task.title, task.description, isCompleted, task.priority, task.indent, date, time],
      );
      totalImported++;
    }

    console.log(`  ✓ imported ${tasks.length} tasks\n`);
  }

  await client.end();
  console.log(`Done! Total imported: ${totalImported} tasks`);
}

main().catch((err) => {
  console.error('Error:', err.message ?? err);
  process.exit(1);
});
