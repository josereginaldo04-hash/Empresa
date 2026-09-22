// Usando caminho relativo, o front-end faz as chamadas para a mesma origem/porta do servidor
const API_BASE_URL = '';

let todosTrabalhadores = [];

async function carregarPainel() {
  const containerTrab = document.getElementById('listaTrabalhadores');
  if (!containerTrab) return;

  try {
    const resTrab = await fetch(`${API_BASE_URL}/api/trabalhadores`);
    todosTrabalhadores = await resTrab.json();
    renderizarTrabalhadores(todosTrabalhadores);

    const resEmp = await fetch(`${API_BASE_URL}/api/empresas`);
    const empresas = await resEmp.json();
    renderizarEmpresas(empresas);
  } catch (err) {
    console.error('Erro ao carregar os dados:', err);
  }
}

function renderizarTrabalhadores(lista) {
  const containerTrab = document.getElementById('listaTrabalhadores');
  const badgeTrab = document.getElementById('totalTrabalhadores');

  if (badgeTrab) badgeTrab.innerText = lista.length + ' online';

  if (!lista || lista.length === 0) {
    containerTrab.innerHTML = '<div class="col-12 text-muted text-center">Nenhum profissional encontrado.</div>';
    return;
  }

  let htmlTrab = '';
  lista.forEach(t => {
    const foneLimpo = (t.telefone || '').replace(/\D/g, '');
    const msgZap = encodeURIComponent('Olá ' + (t.nome || '') + '! Vi seu perfil na JR Serviços como ' + (t.especialidade || '') + ' e gostaria de contratar.');

    htmlTrab += `
      <div class="col-md-6 col-lg-4">
        <div class="card bg-secondary text-white shadow border-danger h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title text-warning mb-0">${t.nome || ''}</h5>
              <span class="badge bg-success">🟢 Online</span>
            </div>
            <h6 class="text-info">${t.especialidade || ''}</h6>
            <p class="card-text small text-light mb-2">${t.descricao || 'Sem descrição informada.'}</p>
            <ul class="list-unstyled small text-light mb-3">
              <li><strong>💰 Valor/Hora:</strong> R$ ${t.valorHora ? Number(t.valorHora).toFixed(2) : 'A combinar'}</li>
              <li><strong>📍 Localização:</strong> ${t.localizacao || 'Não informada'}</li>
              <li><strong>📱 Tel:</strong> ${t.telefone || ''}</li>
            </ul>
            <a href="https://wa.me/55${foneLimpo}?text=${msgZap}" target="_blank" class="btn btn-success w-100">
              💬 Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;
  });
  containerTrab.innerHTML = htmlTrab;
}

function renderizarEmpresas(empresas) {
  const containerEmp = document.getElementById('listaEmpresas');
  const badgeEmp = document.getElementById('totalEmpresas');

  if (badgeEmp) badgeEmp.innerText = empresas.length + ' cadastradas';

  if (!empresas || empresas.length === 0) {
    containerEmp.innerHTML = '<div class="col-12 text-muted text-center">Nenhuma empresa cadastrada no momento.</div>';
    return;
  }

  let htmlEmp = '';
  empresas.forEach(e => {
    htmlEmp += `
      <div class="col-md-6 col-lg-4">
        <div class="card bg-secondary text-white shadow border-warning h-100">
          <div class="card-body">
            <h5 class="card-title text-warning mb-2">${e.nomeEmpresa || ''}</h5>
            <h6 class="text-info">${e.ramo || ''}</h6>
            <ul class="list-unstyled small text-light mt-3 mb-3">
              <li><strong>👤 Responsável:</strong> ${e.responsavel || ''}</li>
              <li><strong>📍 Endereço:</strong> ${e.endereco || ''}</li>
              <li><strong>📱 Tel:</strong> ${e.telefone || ''}</li>
            </ul>
            <a href="mailto:${e.email || ''}" class="btn btn-warning text-dark w-100 fw-bold">
              ✉️ Contatar Empresa
            </a>
          </div>
        </div>
      </div>
    `;
  });
  containerEmp.innerHTML = htmlEmp;
}

document.addEventListener('DOMContentLoaded', () => {
  carregarPainel();

  // ENVIO DO FORMULÁRIO PF (Trabalhador)
  const formPF = document.getElementById('formCadastroPF');
  if (formPF) {
    formPF.addEventListener('submit', async function (e) {
      e.preventDefault();
      const dados = Object.fromEntries(new FormData(this).entries());

      try {
        const resp = await fetch('/api/cadastrar-trabalhador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const res = await resp.json();

        if (resp.ok) {
          alert('✅ ' + res.mensagem);
          window.location.href = 'index.html?cadastrado=true';
        } else {
          alert('⚠️ Erro: ' + res.erro);
        }
      } catch (err) {
        alert('❌ Erro de conexão com o servidor. Verifique se a aplicação está rodando!');
      }
    });
  }

  // ENVIO DO FORMULÁRIO PJ (Empresa)
  const formPJ = document.getElementById('formCadastroPJ');
  if (formPJ) {
    formPJ.addEventListener('submit', async function (e) {
      e.preventDefault();
      const dados = Object.fromEntries(new FormData(this).entries());

      try {
        const resp = await fetch('/api/cadastrar-empresa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
        const res = await resp.json();

        if (resp.ok) {
          alert('✅ ' + res.mensagem);
          window.location.href = 'index.html?cadastrado=true';
        } else {
          alert('⚠️ Erro: ' + res.erro);
        }
      } catch (err) {
        alert('❌ Erro de conexão com o servidor. Verifique se a aplicação está rodando!');
      }
    });
  }
});