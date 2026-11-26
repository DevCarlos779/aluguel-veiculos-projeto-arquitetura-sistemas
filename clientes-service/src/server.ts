import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Serviço de Clientes rodando na porta ${port}`));