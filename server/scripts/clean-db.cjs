require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando limpeza do banco: serão removidos registros de Ativo, Funcionario e Setor, preservando UsuarioTI.');

  const auditDeleted = await prisma.auditLog.deleteMany({});
  console.log(`Atividades de auditoria removidas: ${auditDeleted.count}`);

  const ativosDeleted = await prisma.ativo.deleteMany({});
  console.log(`Ativos removidos: ${ativosDeleted.count}`);

  const funcionariosDeleted = await prisma.funcionario.deleteMany({});
  console.log(`Funcionarios removidos: ${funcionariosDeleted.count}`);

  const setoresDeleted = await prisma.setor.deleteMany({});
  console.log(`Setores removidos: ${setoresDeleted.count}`);

  console.log('Limpeza concluída. UsuarioTI preservados.');
}

main()
  .catch((e) => {
    console.error('Erro durante a limpeza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });