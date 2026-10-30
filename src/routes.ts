import express from "express";
import * as UserController from "@controllers/UserController";
import * as PlantController from "@controllers/PlantController";

const routes = express.Router();

routes.get("/", (req, res) => {
  res.status(200).json({ message: "API do treinamento de CRUD do CITi 🚀" });
});

// CRUD de usuários
routes.post("/users", UserController.createUser);
routes.get("/users", UserController.readAllUsers);
routes.get("/users/:id", UserController.readUserById);
routes.patch("/users/:id", UserController.updateUser);
routes.delete("/users/:id", UserController.deleteUser);

 
// Rotas de plantas
routes.post("/plantas", PlantController.createPlant);
routes.get("/plantas", PlantController.readAllPlants);

// Rotas antes da busca por id
routes.get("/plantas/estoque/valor-total", PlantController.getStockValue);

routes.get("/plantas/esgotadas", PlantController.readOutOfStockPlants);

routes.get("/plantas/:id", PlantController.readPlantById);
routes.patch("/plantas/:id", PlantController.updatePlant);
routes.delete("/plantas/:id", PlantController.deletePlant);
routes.post("/plantas/:id/venda", PlantController.sellPlant);

export default routes;
