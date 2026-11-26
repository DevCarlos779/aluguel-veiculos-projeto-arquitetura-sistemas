import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../database/connection";
import { Veiculo } from "../models/veiculo.model";

export class VeiculoRepository {
  async criar(v: Veiculo): Promise<Veiculo> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO veiculos (placa, marca, modelo, ano, valor_diaria) VALUES (?, ?, ?, ?, ?)",
      [v.placa, v.marca, v.modelo, v.ano, v.valor_diaria]
    );
    return { ...v, id: result.insertId, status: "DISPONIVEL" };
  }

  async atualizar(id: number, v: Veiculo): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE veiculos SET placa = ?, marca = ?, modelo = ?, ano = ?, valor_diaria = ? WHERE id = ?",
      [v.placa, v.marca, v.modelo, v.ano, v.valor_diaria, id]
    );
    return result.affectedRows > 0;
  }

  async buscarPorPlaca(placa: string): Promise<Veiculo | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM veiculos WHERE placa = ?",
      [placa]
    );
    return (rows[0] as Veiculo) ?? null;
  }

  async listar(): Promise<Veiculo[]> {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM veiculos");
    return rows as Veiculo[];
  }

  async listarDisponiveis(): Promise<Veiculo[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM veiculos WHERE status = 'DISPONIVEL'"
    );
    return rows as Veiculo[];
  }

  async atualizarStatus(id: number, status: "DISPONIVEL" | "ALUGADO"): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE veiculos SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows > 0;
  }
}