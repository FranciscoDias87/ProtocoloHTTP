import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Send,
  Sun,
  Moon,
  ShieldAlert,
  Edit,
  Database, 
  Cpu, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Trash2, 
  RefreshCcw,
  Code2,
  Network,
  Lock
} from "lucide-react";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Quest {
  id: number;
  title: string;
  description: string;
  targetMethod: Method;
  targetPath: string;
  successCondition: (res: any) => boolean;
  hint?: string;
}

const QUESTS: Quest[] = [
  {
    id: 1,
    title: "A Pergunta Simples",
    description: "Use o método GET para consultar a lista de recursos do servidor no caminho /api/resources.",
    targetMethod: "GET",
    targetPath: "/api/resources",
    successCondition: (res) => res.status === 200 && Array.isArray(res.data)
  },
  {
    id: 2,
    title: "Criando algo Novo",
    description: "Use o método POST para criar um novo recurso. Você deve enviar um JSON com a chave 'name' no corpo da requisição para /api/resources.",
    targetMethod: "POST",
    targetPath: "/api/resources",
    successCondition: (res) => res.status === 201,
    hint: "Certifique-se de preencher o Body do Request."
  },
  {
    id: 3,
    title: "O Upgrade (PUT)",
    description: "Use o método PUT para atualizar o recurso de ID 1. Envie um objeto completo com 'name' para /api/resources/1.",
    targetMethod: "PUT",
    targetPath: "/api/resources/1",
    successCondition: (res) => res.status === 200 && res.message.includes("atualizado")
  },
  {
    id: 4,
    title: "Modificação Parcial (PATCH)",
    description: "Use o método PATCH para mudar apenas o tipo de um recurso. Envie um JSON com {'type': 'gold'} para /api/resources/1.",
    targetMethod: "PATCH",
    targetPath: "/api/resources/1",
    successCondition: (res) => res.status === 200 && res.explanation.includes("PATCH")
  },
  {
    id: 5,
    title: "Acesso Negado (401)",
    description: "Tente acessar dados protegidos em /api/secure-data usando GET. Você deve receber um erro 401 porque não enviamos a chave de acesso.",
    targetMethod: "GET",
    targetPath: "/api/secure-data",
    successCondition: (res) => res.status === 401
  },
  {
    id: 6,
    title: "O Destruidor (DELETE)",
    description: "Remova o recurso de ID 2 permanentemente do servidor acessando /api/resources/2 com o método correto.",
    targetMethod: "DELETE",
    targetPath: "/api/resources/2",
    successCondition: (res) => res.status === 200 && res.message.includes("removido")
  }
];

export default function App() {
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/api/resources");
  const [body, setBody] = useState('{\n  "name": "Novo Recurso",\n  "type": "comum"\n}');
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  
  const [packetPhase, setPacketPhase] = useState<"idle" | "request" | "response">("idle");

  const currentQuest = QUESTS[currentQuestIndex];
  const isQuestComplete = lastResponse && currentQuest.successCondition(lastResponse);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  const sendRequest = async () => {
    if (isSending) return;
    
    setIsSending(true);
    setPacketPhase("request");
    setLastResponse(null);

    await new Promise(r => setTimeout(r, 1200));

    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" }
      };
      if (["POST", "PUT", "PATCH"].includes(method)) {
        options.body = body;
      }

      const res = await fetch(path, options);
      const data = await res.json();
      
      setPacketPhase("response");
      await new Promise(r => setTimeout(r, 1200));
      
      setLastResponse(data);
    } catch (err) {
      setLastResponse({
        status: 500,
        message: "Erro de Conexão",
        explanation: "Ocorreu uma falha ao tentar se comunicar com o servidor."
      });
    } finally {
      setIsSending(false);
      setPacketPhase("idle");
    }
  };

  const nextQuest = () => {
    if (currentQuestIndex < QUESTS.length - 1) {
      setCurrentQuestIndex(prev => prev + 1);
      setLastResponse(null);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto transition-colors`}>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-white">
              <Globe className="text-blue-500" /> HTTP Explorer
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Aprenda Protocolo na Prática</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-600 dark:text-zinc-400"
            title="Alternar Tema"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto shadow-sm dark:shadow-none">
          <div className="flex-1">
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Missão {currentQuestIndex + 1}/{QUESTS.length}</p>
            <h2 className="font-semibold text-zinc-700 dark:text-zinc-200">{currentQuest.title}</h2>
          </div>
          {isQuestComplete && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={nextQuest}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-green-600/20"
            >
              Próxima <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Request Lab */}
        <section className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[600px] shadow-sm dark:shadow-xl">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2">
            <Database size={18} className="text-blue-500" />
            <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Request Lab</h3>
          </div>
          
          <div className="p-6 flex flex-col gap-5 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase">Instrução</label>
              <div className="bg-blue-50 dark:bg-zinc-800/50 border border-blue-100 dark:border-zinc-700/50 p-3 rounded-lg text-sm text-blue-900 dark:text-zinc-300 leading-relaxed font-medium">
                {currentQuest.description}
                {currentQuest.hint && <p className="mt-2 text-[11px] text-blue-500 dark:text-blue-400 italic">Dica: {currentQuest.hint}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase">Método</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["GET", "POST", "PUT", "PATCH", "DELETE"] as Method[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`text-[10px] font-bold py-2 rounded-md transition-all border ${
                      method === m
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-blue-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase">Caminho (URL)</label>
              <div className="relative">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-sm font-mono text-zinc-700 dark:text-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="/api/..."
                />
              </div>
            </div>

            {["POST", "PUT", "PATCH"].includes(method) && (
              <div className="space-y-2">
                <label className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500 uppercase">Request Body (JSON)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm font-mono h-32 text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
                />
              </div>
            )}

            <div className="mt-auto pt-6">
              <button
                disabled={isSending}
                onClick={sendRequest}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-md ${
                  isSending 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-[0.98]"
                }`}
              >
                {isSending ? (
                  <RefreshCcw className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                {isSending ? "PROCESSANDO..." : "ENVIAR CHAMADA HTTP"}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Visualization & Response */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Network Visualization */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 relative h-64 shadow-sm dark:shadow-xl flex items-center justify-between">
            <div className="flex flex-col items-center gap-3">
              <motion.div 
                animate={packetPhase === "request" ? { 
                  scale: [1, 1.05, 1],
                  boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                  borderColor: "#3b82f6"
                } : { scale: 1, boxShadow: "none" }}
                transition={packetPhase === "request" ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 }}
                className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-inner"
              >
                <Globe className={packetPhase === "request" ? "text-blue-500 transition-colors" : "text-zinc-400 dark:text-zinc-500 transition-colors"} size={32} />
              </motion.div>
              <span className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500">BROWSER</span>
            </div>

            {/* Network Line */}
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-8 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-4 py-1 text-[10px] font-bold font-mono text-zinc-300 dark:text-zinc-600 italic">
                INTERNET
              </div>
              
              {/* Animated Packets */}
              <AnimatePresence>
                {packetPhase === "request" && (
                  <motion.div 
                    initial={{ left: "0%", opacity: 0 }}
                    animate={{ left: "100%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="request-packet top-1/2 -translate-y-1/2"
                  />
                )}
                {packetPhase === "response" && (
                  <motion.div 
                    initial={{ left: "100%", opacity: 0 }}
                    animate={{ left: "0%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="response-packet top-1/2 -translate-y-1/2"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-3">
              <motion.div 
                animate={packetPhase === "response" ? { 
                  scale: [1, 1.05, 1],
                  boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                  borderColor: "#22c55e"
                } : { scale: 1, boxShadow: "none" }}
                transition={packetPhase === "response" ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 }}
                className="w-20 h-20 bg-blue-50 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-500/30 shadow-sm"
              >
                <Cpu className={packetPhase === "response" ? "text-green-500 transition-colors" : "text-blue-500 transition-colors"} size={32} />
              </motion.div>
              <span className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-500">API SERVER</span>
            </div>
          </div>

          {/* Response Console */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex-1 flex flex-col shadow-sm dark:shadow-xl min-h-[400px]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Resposta do Servidor</h3>
              </div>
              {lastResponse && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${
                  lastResponse.status < 300 
                    ? "bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" 
                    : lastResponse.status === 401 
                      ? "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      : "bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}>
                  HTTP STATUS {lastResponse.status}
                </div>
              )}
            </div>

            <div className="p-6 flex-1 overflow-auto">
              {!lastResponse && !isSending && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 gap-4">
                  <Network size={64} strokeWidth={1} />
                  <p className="text-sm font-mono italic">Aguardando a sua requisição...</p>
                </div>
              )}

              {isSending && (
                <div className="h-full flex flex-col items-center justify-center text-blue-500 gap-4">
                  <RefreshCcw className="animate-spin" size={32} />
                  <p className="text-sm font-bold font-mono animate-pulse">Servidor processando...</p>
                </div>
              )}

              {lastResponse && (
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      lastResponse.status < 300 
                        ? "bg-green-100 dark:bg-green-600/10 text-green-600 dark:text-green-500" 
                        : lastResponse.status === 401
                          ? "bg-amber-100 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500"
                          : "bg-red-100 dark:bg-red-600/10 text-red-600 dark:text-red-500"
                    }`}>
                      {lastResponse.status < 300 ? <CheckCircle2 size={24} /> : lastResponse.status === 401 ? <Lock size={24} /> : <ShieldAlert size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-800 dark:text-white text-lg">
                        {lastResponse.status < 300 ? "Requisição Bem-Sucedida!" : "Erro ou Alerta Detectado"}
                      </h4>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{lastResponse.message}</p>
                    </div>
                  </div>

                  {/* Explanation Blurb */}
                  <div className="bg-blue-50 dark:bg-zinc-800/50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm border-y border-r border-blue-100 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle size={14} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest">O que aprendemos com isso?</span>
                    </div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-200 italic leading-relaxed font-medium">
                      {lastResponse.explanation}
                    </p>
                  </div>

                  {/* JSON Code */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black font-mono text-zinc-400 dark:text-zinc-500 uppercase">Inspecionar Body da Resposta</label>
                    <pre className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg overflow-x-auto text-[11px] font-mono text-blue-700 dark:text-blue-300 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                      {JSON.stringify(lastResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer Instruction Overlay */}
      <footer className="text-center mt-6 py-6 border-t border-zinc-100 dark:border-zinc-900">
        <p className="text-[10px] font-black font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
          Protocolo HTTP • Métodos & Status Codes • Aula 06-08 • SEDUC Piauí
        </p>
      </footer>
    </div>
  );
}


