import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { ClienteService } from "../services/cliente.service";

export class ClienteController {
    constructor(private service: ClienteService) {}

    private tratarErro(error: unknown, res: Response) {
        if (error instanceof AppError) {
        return res.status(error.statusCode).json({ erro: error.message });
        }
        console.error(error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }

    cadastrar = async (req: Request, res: Response) => {
        try {
        const cliente = await this.service.cadastrar(req.body);
        res.status(201).json(cliente);
        } catch (e) {
        this.tratarErro(e, res);
        }
    };

    atualizar = async (req: Request, res: Response) => {
        try {
        const cliente = await this.service.atualizar(Number(req.params.id), req.body);
        res.json(cliente);
        } catch (e) {
        this.tratarErro(e, res);
        }
    };

    buscarPorCpf = async (req: Request, res: Response) => {
    try {
        const cpf = String(req.params.cpf);
        res.json(await this.service.buscarPorCpf(cpf));
    } catch (e) {
        this.tratarErro(e, res);
    }
    };

    listar = async (_req: Request, res: Response) => {
        try {
        res.json(await this.service.listar());
        } catch (e) {
        this.tratarErro(e, res);
        }
    };

    excluir = async (req: Request, res: Response) => {
        try {
        await this.service.excluir(Number(req.params.id));
        res.status(204).send();
        } catch (e) {
        this.tratarErro(e, res);
        }
    };
}