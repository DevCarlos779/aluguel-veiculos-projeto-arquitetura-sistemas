export interface Veiculo {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  valor_diaria: number;
  status?: "DISPONIVEL" | "ALUGADO";
}