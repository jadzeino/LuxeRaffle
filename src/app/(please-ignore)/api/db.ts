import { Raffle } from '@/types/Raffle';
import { Order } from '@/types/Order';
import { User } from '@/types/User';
import fs from 'fs/promises';
import path from 'path';

const SOURCE_PATH = path.join(process.cwd(), 'data', 'db.json');
const TMP_PATH = '/tmp/luxeraffle-db.json';

type Database = {
  raffles: Raffle[];
  orders: Record<string, Order>;
  userOrders: Record<string, string[]>;
  users: Array<User & { password: string }>;
};

async function resolveDbPath(): Promise<string> {
  try {
    await fs.access(SOURCE_PATH, fs.constants.W_OK);
    return SOURCE_PATH;
  } catch {
    // Vercel: deployment FS is read-only. Bootstrap /tmp on first use.
    try {
      await fs.access(TMP_PATH);
    } catch {
      await fs.copyFile(SOURCE_PATH, TMP_PATH);
    }
    return TMP_PATH;
  }
}

export async function readDatabase(): Promise<Database> {
  const dbPath = await resolveDbPath();
  const data = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(data) as Database;
}

export async function writeDatabase(data: Database): Promise<void> {
  const dbPath = await resolveDbPath();
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}
