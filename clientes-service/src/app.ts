import express from "express";
import cors from "cors";
import { clienteRoutes } from "./routes/cliente.routes";

export const app = express();

app.use(cors());          
app.use(express.json());  
app.use("/clientes", clienteRoutes);