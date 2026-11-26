import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";

const port = process.env.PORT || 3003;
app.listen(port, () => console.log(`Serviço de Veículos rodando na porta ${port}`));