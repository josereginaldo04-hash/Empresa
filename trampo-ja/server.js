const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// "Bancos de dados" temporários em memória
const trabalhadores = [];
const empresas = [];

// ================= ROTAS DE CADASTRO =================

// 1. Cadastrar Trabalhador (Pessoa Física)
app.post('/api/cadastrar-trabalhador', (req, res) => {
  const { nome, cpf, email, telefone, especialidade, valorHora, localizacao, descricao } = req.body;

  if (!nome || !cpf || !email || !telefone || !especialidade) {
    return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
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
  console.log('Novo Profissional Cadastrado:', novoTrabalhador);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Profissional cadastrado com sucesso!',
    dados: novoTrabalhador
  });
});

// 2. Cadastrar Empresa (Pessoa Jurídica)
app.post('/api/cadastrar-empresa', (req, res) => {
  const { nomeEmpresa, cnpj, email, telefone, responsavel, ramo, endereco } = req.body;

  if (!nomeEmpresa || !cnpj || !email || !telefone || !responsavel || !ramo) {
    return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios da empresa.' });
  }

  novaEmpresa = {
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
  console.log('Nova Empresa Cadastrada:', novaEmpresa);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Empresa cadastrada com sucesso!',
    dados: novaEmpresa
  });
});

// ================= ROTAS DE CONSULTA =================

// Listar todos os trabalhadores
app.get('/api/trabalhadores', (req, res) => {
  res.json(trabalhadores);
});

// Listar todas as empresas
app.get('/api/empresas', (req, res) => {
  res.json(empresas);
});

// Porta dinâmica para o Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`>>> Servidor JR Serviços rodando na porta: ${PORT}`);
});