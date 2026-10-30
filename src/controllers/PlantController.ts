
import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantRepository from "@repositories/PlantRepository";

const luminosidadesValidas = Object.values(Luminosidade);

export const createPlant = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    } = req.body;

    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof especie !== "string" || !especie.trim() ||
      !Number.isInteger(preco) || preco <= 0 ||
      !Number.isInteger(estoque) || estoque < 0 ||
      !luminosidadesValidas.includes(luminosidade) ||
      typeof petFriendly !== "boolean" ||
      !Number.isInteger(regaACadaDias) || regaACadaDias < 1
    ) {
      return res.status(400).json({
        message: "Dados da planta inválidos ou incompletos.",
      });
    }

    const planta = await PlantRepository.createPlanta({
      nome: nome.trim(),
      especie: especie.trim(),
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(201).json(planta);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao cadastrar planta.",
    });
  }
};
