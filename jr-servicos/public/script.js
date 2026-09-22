document.addEventListener('DOMContentLoaded', () => {
  carregarProfissionais();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filtrarProfissionais);
  }
});

let profissionaisData = [];

// Busca a lista de profissionais no backend
async function carregarProfissionais() {
  const container = document.getElementById('profissionaisContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="col-12 text-center my-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-2 text-muted">Carregando profissionais...</p>
    </div>
  `;

  try {
    const response = await fetch('/api/profissionais');
    if (!response.ok) throw new Error('Erro ao buscar dados do servidor');

    profissionaisData = await response.json();
    renderizarProfissionais(profissionaisData);
  } catch (error) {
    console.error('Erro:', error);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center" role="alert">
          Não foi possível carregar a lista de profissionais. Verifique a conexão com o servidor.
        </div>
      </div>
    `;
  }
}

// Renderiza os cartões dos profissionais no HTML
function renderizarProfissionais(lista) {
  const container = document.getElementById('profissionaisContainer');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center my-5">
        <p class="text-muted fs-5">Nenhum profissional encontrado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = lista.map(prof => {
    const linkWa = gerarLinkWhatsapp(prof.telefone, prof.nome, prof.especialidade);

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm border-0 bg-dark text-white card-profissional">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-circle bg-danger text-white fw-bold me-3">
                ${getIniciais(prof.nome)}
              </div>
              <div>
                <h5 class="card-title mb-0 text-white">${prof.nome}</h5>
                <span class="badge bg-outline-danger text-danger border border-danger mt-1">
                  ${prof.especialidade}
                </span>
              </div>
            </div>

            <p class="card-text text-light flex-grow-1">
              ${prof.descricao || 'Profissional qualificado pronto para atender sua necessidade com agilidade e qualidade.'}
            </p>

            <div class="border-top border-secondary pt-3 mt-2">
              <div class="small text-muted mb-2">
                <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                ${prof.cidade || 'Recife'} - ${prof.estado || 'PE'}
              </div>
              <a href="${linkWa}" target="_blank" rel="noopener noreferrer" class="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-whatsapp"></i> Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Função de busca e filtro em tempo real
function filtrarProfissionais() {
  const termo = document.getElementById('searchInput').value.toLowerCase().trim();

  const filtrados = profissionaisData.filter(prof => {
    const nome = (prof.nome || '').toLowerCase();
    const espec = (prof.especialidade || '').toLowerCase();
    const desc = (prof.descricao || '').toLowerCase();
    const cidade = (prof.cidade || '').toLowerCase();

    return nome.includes(termo) || espec.includes(termo) || desc.includes(termo) || cidade.includes(termo);
  });

  renderizarProfissionais(filtrados);
}

// Gera o link da API oficial do WhatsApp (Funciona no celular abrindo o App e no PC abrindo a Web)
function gerarLinkWhatsapp(telefone, nome, especialidade) {
  let numLimpo = (telefone || '').replace(/\D/g, '');

  if (!numLimpo) return '#';

  if (!numLimpo.startsWith('55')) {
    numLimpo = '55' + numLimpo;
  }

  const mensagem = `Olá ${nome}! Vi seu perfil no CapacitaLocal / JR Serviços como ${especialidade} e gostaria de solicitar um orçamento.`;

  // Utiliza a API universal do WhatsApp que ativa o App no celular sem passar por SMS
  return `https://api.whatsapp.com/send?phone=${numLimpo}&text=${encodeURIComponent(mensagem)}`;
}

// Retorna as iniciais do nome para o avatar
function getIniciais(nome) {
  if (!nome) return 'JR';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}