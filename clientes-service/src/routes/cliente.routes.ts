import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller";
import { ClienteRepository } from "../repositories/cliente.repository";
import { ClienteService } from "../services/cliente.service";

const repository = new ClienteRepository();
const service = new ClienteService(repository);
const controller = new ClienteController(service);

export const clienteRoutes = Router();

clienteRoutes.post("/", controller.cadastrar);
clienteRoutes.get("/", controller.listar);
clienteRoutes.get("/cpf/:cpf", controller.buscarPorCpf);
clienteRoutes.put("/:id", controller.atualizar);
clienteRoutes.delete("/:id", controller.excluir);