const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();

// 1. CONFIGURAÇÕES DE MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve os arquivos da pasta 'public' (front-end)
app.use(express.static(path.join(__dirname, 'public')));

// 2. CONFIGURAÇÃO E CONEXÃO DO BANCO DE DADOS SQLITE
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('>>> Banco de dados SQLite ativo.');
  }
});

// Criação das tabelas
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

// 3. FUNÇÃO AUXILIAR: ENVIO AUTOMÁTICO DE NOTIFICAÇÃO VIA WHATSAPP (API)
// Altere as constantes abaixo quando contratar/configurar seu provedor de API do WhatsApp (Evolution API, Z-API, etc.)
const WHATSAPP_API_URL = 'https://sua-api-whatsapp.com/message/sendText/sua-instancia';
const WHATSAPP_API_KEY = 'SEU_TOKEN_DE_AUTENTICACAO';

async function enviarWhatsappAutomatico(telefone, texto) {
  try {
    let numLimpo = (telefone || '').replace(/\D/g, '');
    if (!numLimpo) return;

    if (!numLimpo.startsWith('55')) {
      numLimpo = '55' + numLimpo;
    }

    // Chamada silenciosa em segundo plano para o servidor do WhatsApp
    await axios.post(
      WHATSAPP_API_URL,
      {
        number: numLimpo,
        text: texto
      },
      {
        headers: {
          'apikey': WHATSAPP_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[WhatsApp API] Notificação enviada com sucesso para ${numLimpo}`);
  } catch (error) {
    // Log apenas no terminal do servidor, sem interromper o fluxo do usuário
    console.log(`[WhatsApp API] Aviso: Não foi possível enviar notificação automática para ${telefone}. (${error.message})`);
  }
}

// 4. ROTAS DA API

// POST: Cadastro de Trabalhador / Profissional
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
      return res.status(500).json({ erro: 'Erro ao salvar profissional no banco de dados.' });
    }

    // Disparo automático via WhatsApp para o trabalhador
    const msgTrabalhador = 
      `🛠️ *CapacitaLocal / JR Serviços*\n\n` +
      `Olá *${nome}*!\n` +
      `Seu perfil de *${especialidade}* foi cadastrado com sucesso na nossa plataforma.\n\n` +
      `Agora contratantes e empresas poderão visualizar seus dados e entrar em contato diretamente.`;

    enviarWhatsappAutomatico(telefone, msgTrabalhador);

    return res.status(201).json({ sucesso: true, mensagem: 'Profissional cadastrado com sucesso!' });
  });
});

// POST: Cadastro de Empresa
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

    // Disparo automático via WhatsApp para a empresa
    const msgEmpresa = 
      `🏢 *CapacitaLocal / JR Serviços*\n\n` +
      `Olá *${responsavel}*!\n` +
      `A empresa *${nomeEmpresa}* foi cadastrada com sucesso.\n\n` +
      `Acesse nosso painel para visualizar os profissionais disponíveis na região.`;

    enviarWhatsappAutomatico(telefone, msgEmpresa);

    return res.status(201).json({ sucesso: true, mensagem: 'Empresa cadastrada com sucesso!' });
  });
});

// GET: Consulta de Trabalhadores
app.get('/api/trabalhadores', (req, res) => {
  db.all("SELECT * FROM trabalhadores ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// GET: Consulta de Empresas
app.get('/api/empresas', (req, res) => {
  db.all("SELECT * FROM empresas ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// 5. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`>>> Servidor rodando na porta ${PORT}`);
});