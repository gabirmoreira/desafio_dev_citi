const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const plantas = [
  {
    nome: "Rosa",
    especie: "Rosa spp.",
    preco: 3000,
    estoque: 12,
    luminosidade: "SOL_PLENO",
    petFriendly: false,
    regaACadaDias: 2,
  },
  {
    nome: "Violeta",
    especie: "Saintpaulia ionantha",
    preco: 1500,
    estoque: 8,
    luminosidade: "SOMBRA",
    petFriendly: true,
    regaACadaDias: 4,
  },
  {
    nome: "Suculenta",
    especie: "Echeveria elegans",
    preco: 1800,
    estoque: 0,
    luminosidade: "SOL_PLENO",
    petFriendly: true,
    regaACadaDias: 14,
  },
];

async function main() {
  for (const planta of plantas) {
    const existente = await prisma.planta.findFirst({
      where: { nome: planta.nome },
    });

    if (!existente) {
      await prisma.planta.create({ data: planta });
    }
  }

  console.log("Plantas de exemplo cadastradas!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());