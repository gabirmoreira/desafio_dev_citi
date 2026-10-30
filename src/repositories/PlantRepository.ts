
import { Prisma } from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
  return await prisma.planta.create({
    data: data,
  });
};

export const findAllPlantas = async (
  where: Prisma.PlantaWhereInput = {},
  orderBy?: Prisma.PlantaOrderByWithRelationInput
) => {
  return await prisma.planta.findMany({
    where,
    ...(orderBy && { orderBy }),
  });
};

export const findPlantaById = async (id: number) => {
  return await prisma.planta.findUnique({
    where: { id: id },
  });
};

export const updatePlanta = async (
  id: number,
  data: Prisma.PlantaUpdateInput
) => {
  return await prisma.planta.update({
    where: { id: id },
    data: data,
  });
};

export const deletePlanta = async (id: number) => {
  return await prisma.planta.delete({
    where: { id: id },
  });
};


export const venderPlanta = async (id: number, quantidade: number) => {
  const resultado = await prisma.planta.updateMany({
    where: {
      id,
      estoque: { gte: quantidade },
    },
    data: {
      estoque: { decrement: quantidade },
    },
  });

  if (resultado.count === 0) {
    return null;
  }

  return await prisma.planta.findUnique({
    where: { id },
  });
};

export const calcularValorEstoque = async () => {
  const plantas = await prisma.planta.findMany({
    select: {
      preco: true,
      estoque: true,
    },
  });

  return {
    valorTotalEmCentavos: plantas.reduce(
      (total, planta) => total + planta.preco * planta.estoque,
      0
    ),
    totalDeVasos: plantas.reduce(
      (total, planta) => total + planta.estoque,
      0
    ),
  };
};

export const findPlantasEsgotadas = async () => {
  return await prisma.planta.findMany({
    where: {
      estoque: 0,
    },
  });
};