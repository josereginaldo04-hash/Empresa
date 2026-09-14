const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados temporário em memória
const trabalhadores = [];
const empresas = [];
const solicitacoes = [];

// Configuração do Transportador de E-mail (Nodemailer)
// NOTA: Para funcionar na prática, insira seu e-mail e senha de aplicativo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'sua-senha-de-aplicativo'
  }
});
   
// ==========================================
// 1. ROTAS DAS PÁGINAS (HTML)
// ==========================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cadastro.html')));
app.get('/cadastro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cadastro.html'))); // <--- ADICIONE ESTA LINHA
app.get('/trabalhador', (req, res) => res.sendFile(path.join(__dirname, 'public', 'trabalhador.html')));
app.get('/contratante', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contratante.html')));

// ==========================================
// 2. ROTAS DE CADASTRO (API)
// ==========================================

// Cadastrar Trabalhador (PF)
app.post('/api/cadastrar-trabalhador', (req, res) => {
  const { nome, cpf, email, telefone, especialidade } = req.body;

  if (!nome || !cpf || !email || !telefone || !especialidade) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const novoTrabalhador = {
    id: trabalhadores.length + 1,
    tipo: 'PF',
    ...req.body,
    dataCadastro: new Date()
  };

  trabalhadores.push(novoTrabalhador);
  return res.status(201).json({
    sucesso: true,
    mensagem: 'Profissional cadastrado com sucesso na JR Serviços!',
    dados: novoTrabalhador
  });
});

// Cadastrar Empresa (PJ)
app.post('/api/cadastrar-empresa', (req, res) => {
  const { nomeEmpresa, cnpj, email, telefone, responsavel, ramo } = req.body;

  if (!nomeEmpresa || !cnpj || !email || !telefone || !responsavel || !ramo) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  const novaEmpresa = {
    id: empresas.length + 1,
    tipo: 'PJ',
    ...req.body,
    dataCadastro: new Date()
  };

  empresas.push(novaEmpresa);
  return res.status(201).json({
    sucesso: true,
    mensagem: 'Empresa cadastrada com sucesso na JR Serviços!',
    dados: novaEmpresa
  });
});

// Listar cadastros
app.get('/api/trabalhadores', (req, res) => res.json(trabalhadores));
app.get('/api/empresas', (req, res) => res.json(empresas));

// ==========================================
// 3. ROTA PARA CHAMAR/NOTIFICAR UM TRABALHADOR
// ==========================================
app.post('/api/solicitar-servico', async (req, res) => {
  const { emailTrabalhador, nomeEmpresa, mensagemProposta, telefoneEmpresa } = req.body;

  if (!emailTrabalhador || !nomeEmpresa || !mensagemProposta) {
    return res.status(400).json({ erro: 'Dados da solicitação incompletos.' });
  }

  // Registra a chamada na memória
  const novaSolicitacao = {
    id: solicitacoes.length + 1,
    emailTrabalhador,
    nomeEmpresa,
    mensagemProposta,
    telefoneEmpresa,
    data: new Date()
  };
  solicitacoes.push(novaSolicitacao);

  // Monta o e-mail de notificação
  const mailOptions = {
    from: 'Plataforma JR Serviços <seu-email@gmail.com>',
    to: emailTrabalhador,
    subject: `🚨 Nova Oportunidade da empresa ${nomeEmpresa} - JR Serviços`,
    html: `
      <h2>Olá! Você recebeu uma proposta de trabalho!</h2>
      <p>A empresa <strong>${nomeEmpresa}</strong> viu seu perfil na Plataforma JR Serviços e deseja contratar seus serviços.</p>
      <p><strong>Mensagem / Proposta:</strong> ${mensagemProposta}</p>
      <p><strong>Contato da Empresa:</strong> ${telefoneEmpresa}</p>
      <br>
      <p>Acesse a plataforma para entrar em contato diretamente!</p>
    `
  };

  try {
    // Tenta enviar o e-mail (se o Nodemailer estiver configurado)
    await transporter.sendMail(mailOptions);
    return res.json({
      sucesso: true,
      mensagem: 'Proposta registrada e e-mail de notificação enviado ao trabalhador!'
    });
  } catch (err) {
    // Se o e-mail não estiver configurado no servidor, registra apenas no sistema
    return res.json({
      sucesso: true,
      mensagem: 'Proposta salva no sistema com sucesso! (Aviso: configure o serviço de e-mail para envios automáticos).'
    });
  }
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`>>> Servidor JR Serviços rodando na porta: ${PORT}`);
});