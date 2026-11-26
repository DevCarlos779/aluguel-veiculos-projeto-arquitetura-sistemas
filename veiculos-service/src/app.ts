import express from "express";
import cors from "cors";
import { veiculoRoutes } from "./routes/veiculo.routes";

export const app = express();

app.use(cors());          // permite o front-end (outra porta) acessar a API
app.use(express.json());  // permite ler o corpo JSON das requisições
app.use("/veiculos", veiculoRoutes);