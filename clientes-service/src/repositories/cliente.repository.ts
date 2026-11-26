import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../database/connection";
import { Cliente } from "../models/cliente.model";

export class ClienteRepository {
  async criar(c: Cliente): Promise<Cliente> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO clientes (nome, cpf, email, telefone) VALUES (?, ?, ?, ?)",
      [c.nome, c.cpf, c.email ?? null, c.telefone ?? null]
    );
    return { ...c, id: result.insertId };
  }

  async atualizar(id: number, c: Cliente): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE clientes SET nome = ?, cpf = ?, email = ?, telefone = ? WHERE id = ?",
      [c.nome, c.cpf, c.email ?? null, c.telefone ?? null, id]
    );
    return result.affectedRows > 0;
  }

  async buscarPorCpf(cpf: string): Promise<Cliente | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM clientes WHERE cpf = ?",
      [cpf]
    );
    return (rows[0] as Cliente) ?? null;
  }

  async listar(): Promise<Cliente[]> {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM clientes");
    return rows as Cliente[];
  }

  async excluir(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM clientes WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}