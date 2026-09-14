const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// "Bancos de dados" temporários em memória
const trabalhadores = [];
const empresas = [];

// ================= ROTAS DE PÁGINAS (FRONTEND) =================
// Garante que qualquer uma dessas URLs abra a tela do formulário sem erro de GET

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/trabalhador', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/contratante', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// ================= ROTAS DE API (BACKEND) =================

// 1. Cadastrar Trabalhador / Profissional (PF)
app.post('/api/cadastrar-trabalhador', (req, res) => {
  const { nome, cpf, email, telefone, especialidade, valorHora, localizacao, descricao } = req.body;

  if (!nome || !cpf || !email || !telefone || !especialidade) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios do trabalhador.' });
  }

  const novoTrabalhador = {
    id: trabalhadores.length + 1,
    tipo: 'PF',
    nome,
    cpf,
    email,
    telefone,
    especialidade,
    valorHora: valorHora ? parseFloat(valorHora) : 0,
    localizacao,
    descricao,
    dataCadastro: new Date()
  };

  trabalhadores.push(novoTrabalhador);
  console.log('Novo Profissional:', novoTrabalhador);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Profissional cadastrado com sucesso!',
    dados: novoTrabalhador
  });
});

// 2. Cadastrar Empresa / Contratante (PJ)
app.post('/api/cadastrar-empresa', (req, res) => {
  const { nomeEmpresa, cnpj, email, telefone, responsavel, ramo, endereco } = req.body;

  if (!nomeEmpresa || !cnpj || !email || !telefone || !responsavel || !ramo) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios do contratante/empresa.' });
  }

  const novaEmpresa = {
    id: empresas.length + 1,
    tipo: 'PJ',
    nomeEmpresa,
    cnpj,
    email,
    telefone,
    responsavel,
    ramo,
    endereco,
    dataCadastro: new Date()
  };

  empresas.push(novaEmpresa);
  console.log('Nova Empresa/Contratante:', novaEmpresa);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Contratante/Empresa cadastrado com sucesso!',
    dados: novaEmpresa
  });
});

// Rotas de consulta
app.get('/api/trabalhadores', (req, res) => res.json(trabalhadores));
app.get('/api/empresas', (req, res) => res.json(empresas));

// Porta dinâmica para o Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`>>> Servidor JR Serviços rodando na porta: ${PORT}`);
});