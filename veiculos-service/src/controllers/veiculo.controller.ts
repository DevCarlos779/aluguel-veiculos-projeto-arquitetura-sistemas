import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { VeiculoService } from "../services/veiculo.service";

export class VeiculoController {
  constructor(private service: VeiculoService) {}

  private tratarErro(error: unknown, res: Response) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ erro: error.message });
    }
    console.error(error);
    return res.status(500).json({ erro: "Erro interno do servidor" });
  }

  cadastrar = async (req: Request, res: Response) => {
    try {
      const veiculo = await this.service.cadastrar(req.body);
      res.status(201).json(veiculo);
    } catch (e) {
      this.tratarErro(e, res);
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const veiculo = await this.service.atualizar(Number(req.params.id), req.body);
      res.json(veiculo);
    } catch (e) {
      this.tratarErro(e, res);
    }
  };

  buscarPorPlaca = async (req: Request, res: Response) => {
    try {
      const placa = String(req.params.placa);
      res.json(await this.service.buscarPorPlaca(placa));
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

  listarDisponiveis = async (_req: Request, res: Response) => {
    try {
      res.json(await this.service.listarDisponiveis());
    } catch (e) {
      this.tratarErro(e, res);
    }
  };

  atualizarStatus = async (req: Request, res: Response) => {
    try {
      const resultado = await this.service.atualizarStatus(
        Number(req.params.id),
        req.body.status
      );
      res.json(resultado);
    } catch (e) {
      this.tratarErro(e, res);
    }
  };
}