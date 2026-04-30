import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database for the game
  let resources = [
    { id: 1, name: "Elemento Inicial", type: "item" },
    { id: 2, name: "Segundo Recurso", type: "item" }
  ];

  // --- API ROUTES ---

  // Demonstration of GET
  app.get("/api/resources", (req, res) => {
    res.json({
      status: 200,
      message: "Recursos recuperados com sucesso!",
      data: resources,
      explanation: "O método GET é como fazer perguntas para obter informações. Você acabou de perguntar ao servidor 'Quais recursos você tem?'."
    });
  });

  // Demonstration of POST
  app.post("/api/resources", (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request: Nome é obrigatório.",
        explanation: "O servidor não entendeu a solicitação porque faltam dados. Use POST para enviar dados no 'corpo' da mensagem."
      });
    }
    const newResource = { id: resources.length + 1, name, type: "manual" };
    resources.push(newResource);
    res.status(201).json({
      status: 201,
      message: "Recurso criado!",
      data: newResource,
      explanation: "Status 201 (Created) indica que você enviou dados com sucesso e um novo recurso foi gerado no servidor."
    });
  });

  // Demonstration of PUT
  app.put("/api/resources/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const index = resources.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        status: 404,
        message: "Not Found: Recurso não existe.",
        explanation: "O código 404 indica que você tentou atualizar algo que o servidor não conseguiu encontrar."
      });
    }

    resources[index].name = name || resources[index].name;
    res.json({
      status: 200,
      message: "Recurso atualizado!",
      data: resources[index],
      explanation: "O método PUT é usado para fazer melhorias ou substituir algo existente. Você deu um 'upgrade' no recurso!"
    });
  });

  // Demonstration of DELETE
  app.delete("/api/resources/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = resources.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ status: 404, message: "Recurso não encontrado." });
    }

    const removed = resources.splice(index, 1);
    res.json({
      status: 200,
      message: "Recurso removido!",
      deleted: removed[0],
      explanation: "O método DELETE é como um botão de 'destruir'. Você removeu permanentemente um objeto do servidor."
    });
  });

  // Special route for status code demonstration
  app.get("/api/status/:code", (req, res) => {
    const code = parseInt(req.params.code);
    const codeMap: Record<number, string> = {
      200: "Sucesso!",
      201: "Criado com sucesso!",
      301: "Movido permanentemente (Redirecionamento).",
      400: "Solicitação inválida.",
      401: "Não autorizado.",
      404: "Não encontrado.",
      500: "Erro interno do servidor."
    };
    
    res.status(code).json({
      status: code,
      message: codeMap[code] || "Status Code Processado",
      explanation: `O código ${code} é uma mensagem do servidor sobre o estado da sua solicitação.`
    });
  });

  // Demonstration of PATCH (Partial Update)
  app.patch("/api/resources/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { type } = req.body;
    const index = resources.findIndex(r => r.id === id);
    
    if (index === -1) return res.status(404).json({ status: 404, message: "Recurso não encontrado." });

    if (type) resources[index].type = type;
    
    res.json({
      status: 200,
      message: "Atributo modificado!",
      data: resources[index],
      explanation: "O PATCH é usado para pequenas modificações. Diferente do PUT, você enviou apenas o campo 'type' para mudar, sem precisar enviar todo o objeto."
    });
  });

  // Demonstration of 401 Unauthorized
  app.get("/api/secure-data", (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== "Bearer token123") {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: Acesso Negado.",
        explanation: "O código 401 indica que o servidor exige autenticação ou que ela falhou. Você precisa de uma 'chave' para entrar aqui!"
      });
    }
    res.json({ status: 200, message: "Dados secretos acessados!" });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
