const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// 1. CONFIGURAÇÃO SIMPLIFICADA E COMPLETA DO CORS
// O middleware app.use(cors()) já trata as requisições OPTIONS automaticamente para todas as rotas
app.use(cors());

// 2. MIDDLEWARES PARA TRATAR O CORPO DAS REQUISIÇÕES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVE OS ARQUIVOS DA PASTA PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// CONEXÃO BANCO DE DADOS SQLITE
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Erro ao conectar ao SQLite:', err.message);
  else console.log('>>> Banco de dados SQLite ativo.');
});

// CRIAÇÃO DAS TABELAS
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS trabalhadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT NOT NULL,
      especialidade TEXT NOT NULL,
      valorHora REAL,
      localizacao TEXT NOT NULL,
      descricao TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeEmpresa TEXT NOT NULL,
      cnpj TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT NOT NULL,
      responsavel TEXT NOT NULL,
      ramo TEXT NOT NULL,
      endereco TEXT NOT NULL
    )
  `);
});

// ROTA POST DE CADASTRO TRABALHADOR
app.post('/api/cadastrar-trabalhador', (req, res) => {
  const { nome, cpf, email, telefone, especialidade, valorHora, localizacao, descricao } = req.body;

  if (!nome || !cpf || !email || !telefone || !especialidade || !localizacao) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const sql = `INSERT INTO trabalhadores (nome, cpf, email, telefone, especialidade, valorHora, localizacao, descricao)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [nome, cpf, email, telefone, especialidade, valorHora || null, localizacao, descricao || ''], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ erro: 'CPF já cadastrado.' });
      }
      return res.status(500).json({ erro: 'Erro ao salvar no banco de dados.' });
    }
    return res.status(201).json({ sucesso: true, mensagem: 'Profissional cadastrado com sucesso!' });
  });
});

// ROTA POST DE CADASTRO EMPRESA
app.post('/api/cadastrar-empresa', (req, res) => {
  const { nomeEmpresa, cnpj, email, telefone, responsavel, ramo, endereco } = req.body;

  if (!nomeEmpresa || !cnpj || !email || !telefone || !responsavel || !ramo || !endereco) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const sql = `INSERT INTO empresas (nomeEmpresa, cnpj, email, telefone, responsavel, ramo, endereco)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [nomeEmpresa, cnpj, email, telefone, responsavel, ramo, endereco], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ erro: 'CNPJ já cadastrado.' });
      }
      return res.status(500).json({ erro: 'Erro ao salvar empresa no banco de dados.' });
    }
    return res.status(201).json({ sucesso: true, mensagem: 'Empresa cadastrada com sucesso!' });
  });
});

// ROTAS GET PARA CONSULTA
app.get('/api/trabalhadores', (req, res) => {
  db.all("SELECT * FROM trabalhadores ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.get('/api/empresas', (req, res) => {
  db.all("SELECT * FROM empresas ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`>>> Servidor rodando na porta ${PORT}`);
});