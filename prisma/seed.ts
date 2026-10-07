import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/prisma/client.cjs';
import * as bcrypt from 'bcryptjs';

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL nao foi definida.');
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter });
}

async function seedInitialUser() {
  const email = process.env.SEED_USER_EMAIL;
  const name = process.env.SEED_USER_NAME ?? 'Usuario Inicial';
  const password =
    process.env.SEED_USER_PASSWORD ??
    (process.env.NODE_ENV === 'production' ? undefined : '123456');

  if (!email) {
    throw new Error(
      'SEED_USER_EMAIL e obrigatoria para criar o usuario inicial.',
    );
  }

  if (!password) {
    throw new Error(
      'SEED_USER_PASSWORD e obrigatoria em producao para criar o usuario inicial.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const prisma = createPrismaClient();

  try {
    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash, active: true },
      create: { name, email, passwordHash, active: true },
      select: { id: true },
    });

    console.log(`Usuario inicial criado ou atualizado: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

seedInitialUser().catch((error) => {
  console.error('Falha ao criar usuario inicial.');
  console.error(error);
  process.exitCode = 1;
});
