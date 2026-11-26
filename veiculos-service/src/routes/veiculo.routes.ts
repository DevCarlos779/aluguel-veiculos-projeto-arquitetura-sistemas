import { Router } from "express";
import { VeiculoController } from "../controllers/veiculo.controller";
import { VeiculoRepository } from "../repositories/veiculo.repository";
import { VeiculoService } from "../services/veiculo.service";

const repository = new VeiculoRepository();
const service = new VeiculoService(repository);
const controller = new VeiculoController(service);

export const veiculoRoutes = Router();

veiculoRoutes.post("/", controller.cadastrar);
veiculoRoutes.get("/", controller.listar);
veiculoRoutes.get("/disponiveis", controller.listarDisponiveis); // antes de "/:id"
veiculoRoutes.get("/placa/:placa", controller.buscarPorPlaca);
veiculoRoutes.put("/:id", controller.atualizar);
veiculoRoutes.patch("/:id/status", controller.atualizarStatus);