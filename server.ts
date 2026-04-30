import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Mock database (in-memory, resets on serverless restart)
let resources = [
  { id: 1, name: "Elemento Inicial", type: "item" },
  { id: 2, name: "Segundo Recurso", type: "item" }
];

// --- API ROUTES ---
app.get("/api/resources", (req, res) => {
  res.json({
    status: 200,
    message: "Recursos recuperados com sucesso!",
    data: resources,
    explanation: "O método GET é como fazer perguntas para obter informações. Você acabou de perguntar ao servidor 'Quais recursos você tem?'."
  });
});

app.post("/api/resources", (req, res) => {
  const { name, type } = req.body;
  if (!name) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Nome é obrigatório.",
      explanation: "O servidor não entendeu a solicitação porque faltam dados. Use POST para enviar dados no 'corpo' da mensagem."
    });
  }
  const newResource = { id: resources.length + 1, name, type: type || "manual" };
  resources.push(newResource);
  res.status(201).json({
    status: 201,
    message: "Recurso criado!",
    data: newResource,
    explanation: "Status 201 (Created) indica que você enviou dados com sucesso e um novo recurso foi gerado no servidor."
  });
});

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
    explanation: "O PATCH é usado para pequenas modificações. Diferente do PUT, você enviou apenas o campo 'type' para mudar."
  });
});

app.delete("/api/resources/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = resources.findIndex(r => r.id === id);
  
  if (index === -1) return res.status(404).json({ status: 404, message: "Recurso não encontrado." });

  const removed = resources.splice(index, 1);
  res.json({
    status: 200,
    message: "Recurso removido!",
    deleted: removed[0],
    explanation: "O método DELETE é como um botão de 'destruir'. Você removeu permanentemente um objeto do servidor."
  });
});

app.get("/api/secure-data", (req, res) => {
  res.status(401).json({
    status: 401,
    message: "Unauthorized: Acesso Negado.",
    explanation: "O código 401 indica falta de autenticação. No jogo, isso serve para você aprender que existem áreas protegidas!"
  });
});

// --- VITE MIDDLEWARE / STATIC FILES ---
async function setupServer() {
  console.log("Setting up server routes...");
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware loaded.");
    } catch (e) {
      console.error("Failed to load Vite middleware:", e);
    }
  } else if (!process.env.VERCEL) {
    // Only serve static files if NOT on Vercel (Vercel handles them via config)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static file serving enabled.");
  }
}

// Start setup but don't await blocking export
setupServer();

// For local/Cloud Run environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
