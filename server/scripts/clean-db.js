const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpeza do banco: serão removidos registros de Ativo, Funcionario e Setor, preservando UsuarioTI.');

  // Deletar ativos primeiro (referenciam funcionarios/setores)
  const ativosDeleted = await prisma.ativo.deleteMany({});
  console.log(`Ativos removidos: ${ativosDeleted.count}`);

  // Deletar funcionarios (referenciam setor)
  const funcionariosDeleted = await prisma.funcionario.deleteMany({});
  console.log(`Funcionarios removidos: ${funcionariosDeleted.count}`);

  // Deletar setores
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
