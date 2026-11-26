import { AppError } from "../errors/AppError";
import { Veiculo } from "../models/veiculo.model";
import { VeiculoRepository } from "../repositories/veiculo.repository";

type Status = "DISPONIVEL" | "ALUGADO";

export class VeiculoService {
  constructor(private repository: VeiculoRepository) {}

  private normalizarPlaca(placa: string): string {
    return String(placa ?? "").replace(/[\s-]/g, "").toUpperCase();
  }

  private validar(v: Veiculo) {
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(v.placa)) {
      throw new AppError("Placa inválida (ex.: ABC1234 ou ABC1D23)", 400);
    }
    if (!v.marca || v.marca.trim() === "") {
      throw new AppError("Marca é obrigatória", 400);
    }
    if (!v.modelo || v.modelo.trim() === "") {
      throw new AppError("Modelo é obrigatório", 400);
    }
    if (!Number.isInteger(v.ano) || v.ano < 1900 || v.ano > new Date().getFullYear() + 1) {
      throw new AppError("Ano inválido", 400);
    }
    if (typeof v.valor_diaria !== "number" || v.valor_diaria <= 0) {
      throw new AppError("Valor da diária deve ser maior que zero", 400);
    }
  }

  async cadastrar(dados: Veiculo) {
    const veiculo = { ...dados, placa: this.normalizarPlaca(dados.placa) };
    this.validar(veiculo);

    const existente = await this.repository.buscarPorPlaca(veiculo.placa);
    if (existente) throw new AppError("Já existe veículo com esta placa", 409);

    return this.repository.criar(veiculo);
  }

  async atualizar(id: number, dados: Veiculo) {
    const veiculo = { ...dados, placa: this.normalizarPlaca(dados.placa) };
    this.validar(veiculo);

    const existente = await this.repository.buscarPorPlaca(veiculo.placa);
    if (existente && existente.id !== id) {
      throw new AppError("Já existe outro veículo com esta placa", 409);
    }

    const ok = await this.repository.atualizar(id, veiculo);
    if (!ok) throw new AppError("Veículo não encontrado", 404);
    return { ...veiculo, id };
  }

  async buscarPorPlaca(placa: string) {
    const veiculo = await this.repository.buscarPorPlaca(this.normalizarPlaca(placa));
    if (!veiculo) throw new AppError("Veículo não encontrado", 404);
    return veiculo;
  }

  listar() {
    return this.repository.listar();
  }

  listarDisponiveis() {
    return this.repository.listarDisponiveis();
  }

  async atualizarStatus(id: number, status: Status) {
    if (status !== "DISPONIVEL" && status !== "ALUGADO") {
      throw new AppError("Status deve ser DISPONIVEL ou ALUGADO", 400);
    }
    const ok = await this.repository.atualizarStatus(id, status);
    if (!ok) throw new AppError("Veículo não encontrado", 404);
    return { id, status };
  }
}