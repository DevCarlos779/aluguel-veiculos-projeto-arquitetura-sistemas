import { AppError } from "../errors/AppError";
import { Cliente } from "../models/cliente.model";
import { ClienteRepository } from "../repositories/cliente.repository";

export class ClienteService {
  constructor(private repository: ClienteRepository) {}

  private validar(c: Cliente) {
    if (!c.nome || c.nome.trim() === "") {
      throw new AppError("Nome é obrigatório", 400);
    }
    if (!c.cpf || !/^\d{11}$/.test(c.cpf)) {
      throw new AppError("CPF deve ter 11 dígitos numéricos", 400);
    }
  }

  async cadastrar(c: Cliente) {
    this.validar(c);
    const existente = await this.repository.buscarPorCpf(c.cpf);
    if (existente) throw new AppError("Já existe cliente com este CPF", 409);
    return this.repository.criar(c);
  }

  async atualizar(id: number, c: Cliente) {
    this.validar(c);
    const ok = await this.repository.atualizar(id, c);
    if (!ok) throw new AppError("Cliente não encontrado", 404);
    return { ...c, id };
  }

  async buscarPorCpf(cpf: string) {
    const cliente = await this.repository.buscarPorCpf(cpf);
    if (!cliente) throw new AppError("Cliente não encontrado", 404);
    return cliente;
  }

  listar() {
    return this.repository.listar();
  }

  async excluir(id: number) {
    const ok = await this.repository.excluir(id);
    if (!ok) throw new AppError("Cliente não encontrado", 404);
  }
}