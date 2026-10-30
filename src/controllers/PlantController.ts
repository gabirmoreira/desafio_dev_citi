
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
    } = req.body ?? {};

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


export const readAllPlants = async (req: Request, res: Response) => {
  try {
    const { nome, luminosidade, petFriendly } = req.query;

    if (
      (luminosidade !== undefined &&
        (typeof luminosidade !== "string" ||
          !luminosidadesValidas.includes(luminosidade as Luminosidade))) ||
      (petFriendly !== undefined &&
        petFriendly !== "true" &&
        petFriendly !== "false")
    ) {
      return res.status(400).json({
        message: "Filtros inválidos.",
      });
    }

    const plantas = await PlantRepository.findAllPlantas({
  ...(nome !== undefined && {
    nome: {
      contains: nome as string,
      mode: "insensitive" as const,
    },
  }),
  ...(luminosidade !== undefined && {
    luminosidade: luminosidade as Luminosidade,
  }),
  ...(petFriendly !== undefined && {
    petFriendly: petFriendly === "true",
  }),
});

    return res.status(200).json(plantas);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao listar plantas.",
    });
  }
};

export const readPlantById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID inválido.",
      });
    }

    const planta = await PlantRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({
        message: "Planta não encontrada.",
      });
    }

    return res.status(200).json(planta);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar planta.",
    });
  }
};


export const updatePlant = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const planta = await PlantRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    const camposPermitidos = [
      "nome", "especie", "preco", "estoque",
      "luminosidade", "petFriendly", "regaACadaDias",
    ];

    const dados = req.body;

    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados) ||
      Object.keys(dados).some(campo => !camposPermitidos.includes(campo)) ||
      ("nome" in dados &&
        (typeof dados.nome !== "string" || !dados.nome.trim())) ||
      ("especie" in dados &&
        (typeof dados.especie !== "string" || !dados.especie.trim())) ||
      ("preco" in dados &&
        (!Number.isInteger(dados.preco) || dados.preco <= 0)) ||
      ("estoque" in dados &&
        (!Number.isInteger(dados.estoque) || dados.estoque < 0)) ||
      ("luminosidade" in dados &&
        !luminosidadesValidas.includes(dados.luminosidade)) ||
      ("petFriendly" in dados &&
        typeof dados.petFriendly !== "boolean") ||
      ("regaACadaDias" in dados &&
        (!Number.isInteger(dados.regaACadaDias) || dados.regaACadaDias < 1))
    ) {
      return res.status(400).json({ message: "Dados inválidos para edição." });
    }

    const plantaAtualizada = await PlantRepository.updatePlanta(id, {
      ...dados,
      ...(dados.nome !== undefined && { nome: dados.nome.trim() }),
      ...(dados.especie !== undefined && { especie: dados.especie.trim() }),
    });

    return res.status(200).json(plantaAtualizada);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
};

export const deletePlant = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const planta = await PlantRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    await PlantRepository.deletePlanta(id);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao excluir planta." });
  }
};


export const sellPlant = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { quantidade } = req.body ?? {};

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        message: "A quantidade deve ser um inteiro maior que zero.",
      });
    }

    const planta = await PlantRepository.findPlantaById(id);

    if (!planta) {
      return res.status(404).json({ message: "Planta não encontrada." });
    }

    const plantaAtualizada = await PlantRepository.venderPlanta(id, quantidade);

    if (!plantaAtualizada) {
      return res.status(400).json({
        message: "Estoque insuficiente para realizar a venda.",
      });
    }

    return res.status(200).json(plantaAtualizada);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao registrar venda.",
    });
  }
};

export const getStockValue = async (req: Request, res: Response) => {
  try {
    const resultado = await PlantRepository.calcularValorEstoque();
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao calcular o valor do estoque.",
    });
  }
};

