import 'dotenv/config';
import Database from 'better-sqlite3';
import * as bcrypt from 'bcryptjs';
import * as path from 'node:path';

type UserRow = {
  id: number;
};

function getDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não foi definida.');
  }

  if (!databaseUrl.startsWith('file:')) {
    throw new Error('O seed atual suporta apenas DATABASE_URL SQLite file:.');
  }

  const sqlitePath = databaseUrl.replace(/^file:/, '');

  return path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.resolve(process.cwd(), sqlitePath);
}

async function seedInitialUser() {
  const email = process.env.SEED_USER_EMAIL;
  const name = process.env.SEED_USER_NAME ?? 'Usuario Inicial';
  const password =
    process.env.SEED_USER_PASSWORD ??
    (process.env.NODE_ENV === 'production' ? undefined : '123456');

  if (!email) {
    throw new Error(
      'SEED_USER_EMAIL é obrigatória para criar o usuário inicial.',
    );
  }

  if (!password) {
    throw new Error(
      'SEED_USER_PASSWORD é obrigatória em produção para criar o usuário inicial.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const database = new Database(getDatabasePath());

  try {
    const existingUser = database
      .prepare('SELECT id FROM "User" WHERE email = ?')
      .get(email) as UserRow | undefined;

    if (existingUser) {
      database
        .prepare(
          'UPDATE "User" SET name = ?, passwordHash = ?, active = 1 WHERE id = ?',
        )
        .run(name, passwordHash, existingUser.id);

      console.log(`Usuário inicial atualizado: ${email}`);
      return;
    }

    database
      .prepare(
        'INSERT INTO "User" (name, email, passwordHash, active) VALUES (?, ?, ?, 1)',
      )
      .run(name, email, passwordHash);

    console.log(`Usuário inicial criado: ${email}`);
  } finally {
    database.close();
  }
}

seedInitialUser().catch((error) => {
  console.error('Falha ao criar usuário inicial.');
  console.error(error);
  process.exitCode = 1;
});
