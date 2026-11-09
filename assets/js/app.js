// ==========================================
// GESTOR DE TEMA (LIGHT / DARK MODE)
// ==========================================
const ThemeManager = {
  init() {
    const temaSalvo = localStorage.getItem('ecclesia_theme') || 'light';
    this.aplicarTema(temaSalvo);
  },

  aplicarTema(tema) {
    if (tema === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    }
    localStorage.setItem('ecclesia_theme', tema);
    this.atualizarBotoesUI(tema);
  },

  toggleTema() {
    const temaAtual = localStorage.getItem('ecclesia_theme') === 'dark' ? 'dark' : 'light';
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
    this.aplicarTema(novoTema);
  },

  atualizarBotoesUI(tema) {
    const iconHeader = document.getElementById('header-theme-icon');
    if (iconHeader) {
      iconHeader.textContent = tema === 'dark' ? '☀️' : '🌙';
    }

    const btnText = document.getElementById('theme-btn-text');
    const btnIcon = document.getElementById('theme-btn-icon');
    if (btnText && btnIcon) {
      if (tema === 'dark') {
        btnIcon.textContent = '☀️';
        btnText.textContent = 'Ativar Modo Claro';
      } else {
        btnIcon.textContent = '🌙';
        btnText.textContent = 'Ativar Modo Escuro';
      }
    }
  }
};

// ==========================================
// GESTOR DE NOTIFICAÇÕES DINÂMICAS
// ==========================================
function atualizarNotificacoesDinamicas() {
  const cultos = (typeof DB !== 'undefined' && DB.get) ? (DB.get('cultos') || []) : [];
  const financeiro = (typeof DB !== 'undefined' && DB.get) ? (DB.get('financeiro') || []) : [];
  const membros = (typeof DB !== 'undefined' && DB.get) ? (DB.get('membros') || []) : [];

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];
  const mesAtual = hoje.getMonth() + 1;

  // 1. Cultos para hoje
  const cultosHoje = cultos.filter(c => c.data === hojeStr);

  // 2. Dízimos registados (filtrando por descrição ou categoria relacionada a dízimo)
  const dizimos = financeiro.filter(f => 
    f.tipo === 'Entrada' && 
    (f.categoria?.toLowerCase().includes('dízimo') || f.descricao?.toLowerCase().includes('dízimo'))
  );

  // 3. Novos membros este mês
  const novosMembrosMes = membros.filter(m => {
    const dataCad = m.dataCadastro || m.createdAt;
    if (!dataCad) return false;
    const partes = dataCad.split('T')[0].split('-');
    if (partes.length < 2) return false;
    return parseInt(partes[1], 10) === mesAtual && parseInt(partes[0], 10) === hoje.getFullYear();
  });

  // 4. Aniversariantes do mês
  const aniversariantesMes = membros.filter(m => {
    if (!m.dataNascimento) return false;
    const partes = m.dataNascimento.split('-');
    if (partes.length < 2) return false;
    return parseInt(partes[1], 10) === mesAtual;
  });

  const listaNotifEl = document.getElementById('notif-list-container');
  const badgeEl = document.getElementById('notif-badge');
  if (!listaNotifEl || !badgeEl) return;

  let htmlItens = '';
  let totalNotif = 0;

  if (cultosHoje.length > 0) {
    totalNotif++;
    htmlItens += `<div style="padding:6px; background:var(--bg-table-header); border-radius:6px; border:1px solid var(--border-color);">⛪ Culto agendado para hoje (${cultosHoje[0].titulo || 'Geral'})</div>`;
  }

  if (dizimos.length > 0) {
    totalNotif++;
    htmlItens += `<div style="padding:6px; background:var(--bg-table-header); border-radius:6px; border:1px solid var(--border-color);">💰 ${dizimos.length} dízimo(s) registado(s) recentemente</div>`;
  }

  if (novosMembrosMes.length > 0) {
    totalNotif++;
    htmlItens += `<div style="padding:6px; background:var(--bg-table-header); border-radius:6px; border:1px solid var(--border-color);">👥 ${novosMembrosMes.length} novo(s) membro(s) este mês</div>`;
  }

  if (aniversariantesMes.length > 0) {
    totalNotif++;
    htmlItens += `<div style="padding:6px; background:var(--bg-table-header); border-radius:6px; border:1px solid var(--border-color); color:var(--primary); font-weight:600;">🎂 Há ${aniversariantesMes.length} aniversariante(s) neste mês!</div>`;
  }

  if (totalNotif === 0) {
    htmlItens = `<div style="padding:10px; text-align:center; color:var(--text-muted);">Sem novas notificações no momento.</div>`;
  }

  listaNotifEl.innerHTML = htmlItens;
  badgeEl.textContent = totalNotif;
  badgeEl.style.display = totalNotif > 0 ? 'flex' : 'none';
}

// Navegação Principal entre os Módulos
function navigate(viewName) {
  const appScreen = document.getElementById('app-screen');
  if (appScreen && appScreen.classList.contains('hidden')) return;

  // Verificação de Restrição de Acesso por Perfil
  if (typeof Auth !== 'undefined' && !Auth.canAccess(viewName)) {
    alert(`Acesso negado: O seu perfil (${Auth.usuarioAtual?.perfil || 'Desconhecido'}) não tem permissão para aceder a esta secção.`);
    return;
  }

  // Oculta todas as seções
  document.querySelectorAll('.content section').forEach(sec => {
    sec.classList.add('hidden');
  });

  // Desativa estilos ativos nos links do menu
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Exibe a seção selecionada
  const targetSection = document.getElementById(`view-${viewName}`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Destaque visual do item no menu Sidebar
  const activeMenuItem = document.querySelector(`.menu-item[onclick*="'${viewName}'"]`);
  if (activeMenuItem) {
    activeMenuItem.classList.add('active');
  } else if (typeof event !== 'undefined' && event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  // Atualização dinâmica do Breadcrumb
  updateBreadcrumb(viewName);

  // Atualiza as notificações a cada mudança de navegação
  atualizarNotificacoesDinamicas();

  // Execução condicional dos módulos
  if (viewName === 'dashboard' && typeof DashboardModule !== 'undefined') {
    DashboardModule.init();
  } else if (viewName === 'membros' && typeof MembrosModule !== 'undefined') {
    MembrosModule.init();
  } else if (viewName === 'ministerio' && typeof MinisterioModule !== 'undefined') {
    MinisterioModule.init();
  } else if (viewName === 'cultos' && typeof CultosModule !== 'undefined') {
    CultosModule.init();
  } else if (viewName === 'financeiro' && typeof FinanceiroModule !== 'undefined') {
    FinanceiroModule.init();
  } else if (viewName === 'patrimonio' && typeof PatrimonioModule !== 'undefined') {
    PatrimonioModule.init();
  } else if (viewName === 'relatorios' && typeof RelatoriosModule !== 'undefined') {
    RelatoriosModule.init();
  } else if (viewName === 'configuracoes' && typeof ConfiguracoesModule !== 'undefined') {
    ConfiguracoesModule.init();
  }
}

// Função Auxiliar para Atualizar o Breadcrumb na Navbar
function updateBreadcrumb(viewName) {
  const breadcrumbEl = document.getElementById('breadcrumb-current');
  if (!breadcrumbEl) return;

  const titulos = {
    'dashboard': 'Dashboard Principal',
    'membros': 'Gestão de Membros',
    'ministerio': 'Corpo Ministerial',
    'cultos': 'Cultos e Eventos',
    'financeiro': 'Gestão Financeira',
    'patrimonio': 'Gestão de Património',
    'relatorios': 'Relatórios Gerenciais',
    'configuracoes': 'Configurações do Sistema'
  };

  breadcrumbEl.textContent = titulos[viewName] || (viewName.charAt(0).toUpperCase() + viewName.slice(1));
}

// Inicialização automática ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init(); // Inicializa o tema do utilizador

  const appScreen = document.getElementById('app-screen');
  if (appScreen && !appScreen.classList.contains('hidden')) {
    navigate('dashboard');
  }
});