const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos (CSS e JS do front)
app.use(express.static(path.join(__dirname, 'public')));

// "Banco de Dados" em memória para testes
const trabalhadores = [
  { id: 1, nome: "Carlos Eduardo", funcao: "Auxiliar de Logistica", cidade: "Recife - PE", avaliacao: "4.9 ★", online: true },
  { id: 2, nome: "Mariana Costa", funcao: "Suporte Tecnico", cidade: "Olinda - PE", avaliacao: "5.0 ★", online: true },
  { id: 3, nome: "Lucas Andrade", funcao: "Atendimento ao Cliente", cidade: "Jaboatão - PE", avaliacao: "4.8 ★", online: false }
];

// --- ROTAS DAS PÁGINAS (HTML) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/cadastro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cadastro.html')));
app.get('/contratante', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contratante.html')));
app.get('/trabalhador', (req, res) => res.sendFile(path.join(__dirname, 'public', 'trabalhador.html')));

// --- ROTAS DA API (BACK-END) ---
app.get('/api/trabalhadores', (req, res) => {
  const { funcao } = req.query;
  let lista = trabalhadores.filter(t => t.online);
  if (funcao && funcao !== 'todas') {
    lista = lista.filter(t => t.funcao.toLowerCase() === funcao.toLowerCase());
  }
  res.json(lista);
});

app.post('/api/cadastrar', (req, res) => {
  const { nome, funcao, cidade } = req.body;
  if (!nome || !funcao) {
    return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
  }
  const novo = {
    id: trabalhadores.length + 1,
    nome,
    funcao,
    cidade: cidade || "Recife - PE",
    avaliacao: "5.0 ★ (Novo)",
    online: true
  };
  trabalhadores.push(novo);
  res.status(201).json({ mensagem: "Cadastro realizado com sucesso!", trabalhador: novo });
});

app.post('/api/trabalhador/status', (req, res) => {
  const { id, online } = req.body;
  const t = trabalhadores.find(item => item.id === Number(id));
  if (t) {
    t.online = online;
    return res.json({ mensagem: `Status atualizado para ${online ? 'Online' : 'Offline'}`, trabalhador: t });
  }
  res.status(404).json({ erro: "Trabalhador não encontrado." });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`>>> Servidor Web Amplo rodando em: http://localhost:${PORT}`);
});