// ============================================================================
// Módulo de Gestão Financeira & Tesouraria - EcclesiaSys (Atualizado)
// ============================================================================

const FinanceiroModule = {
  activeTab: 'dashboard',
  filtroTermo: '',
  filtroCategoria: 'TODAS',
  filtroMes: '',
  filtroData: '',
  filtroFechoData: '',

  init() {
    this.inicializarDadosPadrao();
    this.render();
  },

  inicializarDadosPadrao() {
    if (!DB.get('contas_financeiras')) {
      DB.set('contas_financeiras', [
        { id: '1', nome: 'Caixa Principal', tipo: 'Espécie', saldo: 150000, descricao: 'Dinheiro físico em cofre' },
        { id: '2', nome: 'Conta BAI / BFA', tipo: 'Banco', saldo: 450000, descricao: 'Conta Corrente Institucional' }
      ]);
    }
    if (!DB.get('transferencias')) {
      DB.set('transferencias', []);
    }
    if (!DB.get('orcamentos')) {
      DB.set('orcamentos', [
        { id: '1', categoria: 'Evangelismo', previsto: 1000000 },
        { id: '2', categoria: 'Manutenção', previsto: 1200000 },
        { id: '3', categoria: 'Assistência Social', previsto: 500000 }
      ]);
    }
    if (!DB.get('fechos_caixa')) {
      DB.set('fechos_caixa', []);
    }
    if (!DB.get('lixo_financeiro')) {
      DB.set('lixo_financeiro', []);
    }
  },

  getUsuarioAtual() {
    return localStorage.getItem('ecclesia_user_name') || 'Administrador';
  },

  isAdmin() {
    const userRole = localStorage.getItem('ecclesia_user_role') || '';
    const userName = this.getUsuarioAtual().toLowerCase();
    return userRole.toLowerCase().includes('admin') || userName.includes('admin') || userName.includes('emanuel');
  },

  setActiveTab(tab) {
    this.activeTab = tab;
    this.filtroTermo = '';
    this.filtroCategoria = 'TODAS';
    this.filtroData = '';
    this.filtroFechoData = '';
    this.render();
  },

  calcularSaldoTotal() {
    const contas = DB.get('contas_financeiras') || [];
    return contas.reduce((acc, c) => acc + parseFloat(c.saldo || 0), 0);
  },

  render() {
    const container = document.getElementById('view-financeiro');
    if (!container) return;

    container.innerHTML = `
      <style>
        .sticky-header-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #f8fafc;
          padding-top: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .scrollable-table-container {
          max-height: 520px;
          overflow-y: auto;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          background: #fff;
          margin-top: 15px;
        }
        .scrollable-table-container table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .scrollable-table-container th {
          position: sticky;
          top: 0;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          z-index: 10;
          box-shadow: inset 0 -1px 0 #cbd5e1;
          padding: 12px 10px;
          text-align: left;
        }
      </style>

      <div class="sticky-header-container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0; font-size:1.5rem; color:var(--text-main, #1e293b);">💰 Gestão Financeira & Tesouraria</h2>
            <p style="margin:4px 0 0 0; color:var(--text-muted, #64748b); font-size:13px;">Controlo avançado de receitas, despesas, contas, orçamentos e fechos.</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn-primary" style="background:#2563eb; padding:10px 16px; border-radius:8px; color:#fff; font-weight:600; border:none; cursor:pointer;" onclick="FinanceiroModule.imprimirListaGeral()">🖨️ Imprimir Lista</button>
            <button class="btn-primary" style="background:#16a34a; padding:10px 16px; border-radius:8px; color:#fff; font-weight:600; border:none; cursor:pointer;" onclick="FinanceiroModule.openModalReceita()">＋ Nova Receita</button>
            <button class="btn-primary" style="background:#dc2626; padding:10px 16px; border-radius:8px; color:#fff; font-weight:600; border:none; cursor:pointer;" onclick="FinanceiroModule.openModalDespesa()">＋ Nova Despesa</button>
            ${this.isAdmin() ? `<button class="btn-primary" style="background:#7c3aed; padding:10px 16px; border-radius:8px; color:#fff; font-weight:600; border:none; cursor:pointer;" onclick="FinanceiroModule.openModalLixoAdmin()">🗑️ Lixo (${(DB.get('lixo_financeiro')||[]).length})</button>` : ''}
          </div>
        </div>

        <!-- SUB-MENUS DE NAVEGAÇÃO FINANCEIRA -->
        <div style="display:flex; gap:8px; margin-bottom:15px; overflow-x:auto;">
          <button onclick="FinanceiroModule.setActiveTab('dashboard')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'dashboard' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'dashboard' ? '#fff' : '#475569'};">📊 Dashboard</button>
          <button onclick="FinanceiroModule.setActiveTab('receitas')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'receitas' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'receitas' ? '#fff' : '#475569'};">💵 Receitas</button>
          <button onclick="FinanceiroModule.setActiveTab('despesas')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'despesas' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'despesas' ? '#fff' : '#475569'};">💸 Despesas</button>
          <button onclick="FinanceiroModule.setActiveTab('transferencias')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'transferencias' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'transferencias' ? '#fff' : '#475569'};">🔄 Transferências</button>
          <button onclick="FinanceiroModule.setActiveTab('contas')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'contas' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'contas' ? '#fff' : '#475569'};">🏦 Contas</button>
          <button onclick="FinanceiroModule.setActiveTab('orcamento')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'orcamento' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'orcamento' ? '#fff' : '#475569'};">📋 Orçamento</button>
          <button onclick="FinanceiroModule.setActiveTab('fecho')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'fecho' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'fecho' ? '#fff' : '#475569'};">📅 Fecho de Caixa</button>
          <button onclick="FinanceiroModule.setActiveTab('relatorios')" style="padding:8px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${this.activeTab === 'relatorios' ? '#2563eb' : '#f1f5f9'}; color:${this.activeTab === 'relatorios' ? '#fff' : '#475569'};">📊 Relatórios</button>
        </div>
      </div>

      <div id="financeiro-content-area" style="margin-top: 15px;">
        ${this.renderActiveTabContent()}
      </div>
    `;
  },

  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'dashboard': return this.renderDashboard();
      case 'receitas': return this.renderReceitas();
      case 'despesas': return this.renderDespesas();
      case 'transferencias': return this.renderTransferencias();
      case 'contas': return this.renderContas();
      case 'orcamento': return this.renderOrcamento();
      case 'fecho': return this.renderFecho();
      case 'relatorios': return this.renderRelatorios();
      default: return this.renderDashboard();
    }
  },

  renderFiltrosBarra(categoriasList) {
    return `
      <div style="background:#1e293b; padding:15px; border-radius:8px; margin-bottom:15px; display:flex; gap:15px; flex-wrap:wrap; align-items:center;">
        <div style="flex:1; min-width:200px;">
          <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:4px; text-transform:uppercase; font-weight:bold;">Pesquisar</label>
          <input type="text" id="filtro-termo-input" value="${this.filtroTermo}" placeholder="Filtrar por descrição..." oninput="FinanceiroModule.atualizarFiltroTermo(this.value)" style="width:100%; padding:8px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-size:13px;">
        </div>
        <div style="min-width:180px;">
          <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:4px; text-transform:uppercase; font-weight:bold;">Categoria</label>
          <select id="filtro-cat-select" onchange="FinanceiroModule.atualizarFiltroCat(this.value)" style="width:100%; padding:8px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-size:13px;">
            <option value="TODAS">Todas as Categorias</option>
            ${categoriasList.map(c => `<option value="${c}" ${this.filtroCategoria === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div style="min-width:160px;">
          <label style="display:block; font-size:11px; color:#94a3b8; margin-bottom:4px; text-transform:uppercase; font-weight:bold;">Data</label>
          <input type="date" id="filtro-data-input" value="${this.filtroData}" onchange="FinanceiroModule.atualizarFiltroData(this.value)" style="width:100%; padding:8px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:6px; font-size:13px;">
        </div>
      </div>
    `;
  },

  atualizarFiltroTermo(val) { this.filtroTermo = val; this.render(); },
  atualizarFiltroCat(val) { this.filtroCategoria = val; this.render(); },
  atualizarFiltroData(val) { this.filtroData = val; this.render(); },
  atualizarFiltroFechoData(val) { this.filtroFechoData = val; this.render(); },

  renderAcoesBotoes(id, tipoItem) {
    return `
      <div style="display:flex; gap:4px; justify-content:flex-end;">
        <button onclick="FinanceiroModule.visualizar('${id}', '${tipoItem}')" title="Visualizar" style="background:#0ea5e9; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px;">👁️</button>
        <button onclick="FinanceiroModule.editar('${id}', '${tipoItem}')" title="Editar" style="background:#8b5cf6; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px;">⚙️</button>
        <button onclick="FinanceiroModule.imprimir('${id}', '${tipoItem}')" title="Imprimir" style="background:#3b82f6; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px;">🖨️</button>
        <button onclick="FinanceiroModule.eliminarPrompt('${id}', '${tipoItem}')" title="Eliminar" style="background:#ef4444; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px;">🗑️</button>
      </div>
    `;
  },

  renderDashboard() {
    const transacoes = DB.get('financeiro') || [];
    const receitas = transacoes.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
    const despesas = transacoes.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
    const saldo = this.calcularSaldoTotal();

    const filtradas = transacoes.filter(t => {
      const matchTermo = (t.descricao || '').toLowerCase().includes(this.filtroTermo.toLowerCase()) || (t.categoria || '').toLowerCase().includes(this.filtroTermo.toLowerCase());
      const matchCat = this.filtroCategoria === 'TODAS' || t.categoria === this.filtroCategoria;
      const matchData = !this.filtroData || t.data === this.filtroData;
      return matchTermo && matchCat && matchData;
    });

    const categoriasUnicas = [...new Set(transacoes.map(t => t.categoria))];

    return `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-bottom:24px;">
        <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:12px; font-weight:700; color:#16a34a; text-transform:uppercase;">💰 Total Receitas</span>
          <h3 style="font-size:26px; margin-top:8px; color:#16a34a;">${receitas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</h3>
        </div>
        <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:12px; font-weight:700; color:#dc2626; text-transform:uppercase;">💸 Total Despesas</span>
          <h3 style="font-size:26px; margin-top:8px; color:#dc2626;">${despesas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</h3>
        </div>
        <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:12px; font-weight:700; color:#2563eb; text-transform:uppercase;">💵 Saldo Consolidado nas Contas</span>
          <h3 style="font-size:26px; margin-top:8px; color:${saldo >= 0 ? '#2563eb' : '#dc2626'};">${saldo.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</h3>
        </div>
      </div>

      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <h3 style="margin-bottom:15px; font-size:16px; color:var(--text-main);">Últimas Movimentações</h3>
        ${this.renderFiltrosBarra(categoriasUnicas)}
        <div class="scrollable-table-container">
          <table>
            <thead>
              <tr>
                <th style="padding:10px;">Data</th>
                <th style="padding:10px;">Tipo</th>
                <th style="padding:10px;">Categoria</th>
                <th style="padding:10px;">Conta</th>
                <th style="padding:10px;">Descrição</th>
                <th style="padding:10px; text-align:right;">Valor</th>
                <th style="padding:10px; text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtradas.length === 0 ? '<tr><td colspan="7" style="padding:20px; text-align:center; color:#94a3b8;">Nenhuma movimentação encontrada.</td></tr>' : ''}
              ${filtradas.map(t => `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px;">${t.data || '—'}</td>
                  <td style="padding:10px;"><span style="padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold; background:${t.tipo === 'Entrada' ? '#dcfce7; color:#15803d;' : '#fee2e2; color:#b91c1c;'}">${t.tipo}</span></td>
                  <td style="padding:10px; font-weight:600;">${t.categoria || '—'}</td>
                  <td style="padding:10px;">${t.conta || 'Caixa Principal'}</td>
                  <td style="padding:10px;">${t.descricao || '—'}</td>
                  <td style="padding:10px; text-align:right; font-weight:700; color:${t.tipo === 'Entrada' ? '#16a34a' : '#dc2626'};">${t.tipo === 'Entrada' ? '+' : '-'} ${parseFloat(t.valor || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                  <td style="padding:10px; text-align:right;">${this.renderAcoesBotoes(t.id, t.tipo)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderReceitas() {
    const transacoes = (DB.get('financeiro') || []).filter(t => t.tipo === 'Entrada');
    const filtradas = transacoes.filter(t => {
      const matchTermo = (t.descricao || '').toLowerCase().includes(this.filtroTermo.toLowerCase()) || (t.categoria || '').toLowerCase().includes(this.filtroTermo.toLowerCase());
      const matchCat = this.filtroCategoria === 'TODAS' || t.categoria === this.filtroCategoria;
      const matchData = !this.filtroData || t.data === this.filtroData;
      return matchTermo && matchCat && matchData;
    });
    const categoriasUnicas = [...new Set(transacoes.map(t => t.categoria))];

    return `
      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <h3 style="margin:0; font-size:16px;">Registo de Receitas (Dízimos, Ofertas, Doações)</h3>
          <button onclick="FinanceiroModule.openModalReceita()" style="background:#16a34a; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-weight:600;">＋ Nova Receita</button>
        </div>
        ${this.renderFiltrosBarra(categoriasUnicas)}
        <div class="scrollable-table-container">
          <table>
            <thead>
              <tr>
                <th style="padding:10px;">Data</th>
                <th style="padding:10px;">Categoria</th>
                <th style="padding:10px;">Conta de Destino</th>
                <th style="padding:10px;">Descrição / Membro</th>
                <th style="padding:10px; text-align:right;">Valor</th>
                <th style="padding:10px; text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtradas.length === 0 ? '<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8;">Nenhuma receita encontrada.</td></tr>' : ''}
              ${filtradas.map(t => `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px;">${t.data}</td>
                  <td style="padding:10px; font-weight:600;">${t.categoria}</td>
                  <td style="padding:10px;">${t.conta || 'Caixa Principal'}</td>
                  <td style="padding:10px;">${t.descricao}</td>
                  <td style="padding:10px; text-align:right; font-weight:700; color:#16a34a;">+ ${parseFloat(t.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                  <td style="padding:10px; text-align:right;">${this.renderAcoesBotoes(t.id, 'Entrada')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderDespesas() {
    const transacoes = (DB.get('financeiro') || []).filter(t => t.tipo === 'Saída');
    const filtradas = transacoes.filter(t => {
      const matchTermo = (t.descricao || '').toLowerCase().includes(this.filtroTermo.toLowerCase()) || (t.categoria || '').toLowerCase().includes(this.filtroTermo.toLowerCase());
      const matchCat = this.filtroCategoria === 'TODAS' || t.categoria === this.filtroCategoria;
      const matchData = !this.filtroData || t.data === this.filtroData;
      return matchTermo && matchCat && matchData;
    });
    const categoriasUnicas = [...new Set(transacoes.map(t => t.categoria))];

    return `
      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <h3 style="margin:0; font-size:16px;">Registo de Despesas & Pagamentos</h3>
          <button onclick="FinanceiroModule.openModalDespesa()" style="background:#dc2626; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-weight:600;">＋ Nova Despesa</button>
        </div>
        ${this.renderFiltrosBarra(categoriasUnicas)}
        <div class="scrollable-table-container">
          <table>
            <thead>
              <tr>
                <th style="padding:10px;">Data</th>
                <th style="padding:10px;">Categoria</th>
                <th style="padding:10px;">Conta de Origem</th>
                <th style="padding:10px;">Descrição</th>
                <th style="padding:10px; text-align:right;">Valor</th>
                <th style="padding:10px; text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${filtradas.length === 0 ? '<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8;">Nenhuma despesa encontrada.</td></tr>' : ''}
              ${filtradas.map(t => `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px;">${t.data}</td>
                  <td style="padding:10px; font-weight:600;">${t.categoria}</td>
                  <td style="padding:10px;">${t.conta || 'Caixa Principal'}</td>
                  <td style="padding:10px;">${t.descricao}</td>
                  <td style="padding:10px; text-align:right; font-weight:700; color:#dc2626;">- ${parseFloat(t.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                  <td style="padding:10px; text-align:right;">${this.renderAcoesBotoes(t.id, 'Saída')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderTransferencias() {
    const transferencias = DB.get('transferencias') || [];
    return `
      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <div>
            <h3 style="margin:0; font-size:16px;">Transferências Entre Contas</h3>
            <p style="font-size:13px; color:#64748b; margin:4px 0 0 0;">Mova valores internamente entre o Caixa Principal, Contas Bancárias e Fundos.</p>
          </div>
          <button onclick="FinanceiroModule.openModalTransferencia()" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">🔄 Nova Transferência</button>
        </div>
        <div class="scrollable-table-container">
          <table>
            <thead>
              <tr>
                <th style="padding:10px;">Data</th>
                <th style="padding:10px;">Conta Origem</th>
                <th style="padding:10px;">Conta Destino</th>
                <th style="padding:10px;">Descrição</th>
                <th style="padding:10px; text-align:right;">Valor</th>
                <th style="padding:10px; text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${transferencias.length === 0 ? '<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8;">Nenhuma transferência registada.</td></tr>' : ''}
              ${transferencias.map(tr => `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px;">${tr.data}</td>
                  <td style="padding:10px; font-weight:600; color:#dc2626;">${tr.origem}</td>
                  <td style="padding:10px; font-weight:600; color:#16a34a;">${tr.destino}</td>
                  <td style="padding:10px;">${tr.descricao || 'Transferência interna'}</td>
                  <td style="padding:10px; text-align:right; font-weight:700; color:#2563eb;">${parseFloat(tr.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                  <td style="padding:10px; text-align:right;">
                    <button onclick="FinanceiroModule.eliminarTransferencia('${tr.id}')" title="Eliminar" style="background:#ef4444; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer;">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderContas() {
    const contas = DB.get('contas_financeiras') || [];
    const totalGeral = contas.reduce((acc, c) => acc + parseFloat(c.saldo || 0), 0);

    return `
      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h3 style="margin:0; font-size:16px;">Contas Bancárias e Caixas</h3>
            <p style="font-size:13px; color:#64748b; margin:4px 0 0 0;">Total consolidado em todas as contas: <strong>${totalGeral.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong></p>
          </div>
          <button onclick="FinanceiroModule.openModalConta()" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">＋ Adicionar Conta</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:15px;">
          ${contas.map(c => `
            <div style="border:1px solid #cbd5e1; padding:20px; border-radius:10px; background:#f8fafc; position:relative;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span style="font-size:11px; background:#e2e8f0; padding:3px 8px; border-radius:4px; font-weight:bold; color:#475569;">${c.tipo}</span>
                  <h4 style="margin:8px 0 4px 0; font-size:18px; color:#1e293b;">${c.nome}</h4>
                  <p style="margin:0; color:#64748b; font-size:12px;">${c.descricao || 'Sem descrição'}</p>
                </div>
                <button onclick="FinanceiroModule.eliminarConta('${c.id}')" title="Eliminar Conta" style="background:transparent; border:none; cursor:pointer; font-size:14px; color:#ef4444;">🗑️</button>
              </div>
              <div style="margin-top:15px; border-top:1px solid #e2e8f0; paddingTop:12px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:12px; color:#64748b; font-weight:bold;">Saldo Atual:</span>
                <strong style="font-size:18px; color:${c.saldo >= 0 ? '#16a34a' : '#dc2626'};">${parseFloat(c.saldo || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderOrcamento() {
    const orcamentos = DB.get('orcamentos') || [];
    const transacoes = DB.get('financeiro') || [];

    return `
      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <div>
            <h3 style="margin:0; font-size:16px;">Orçamento Anual & Planeamento</h3>
            <p style="font-size:13px; color:#64748b; margin:4px 0 0 0;">Controlo de verbas previstas versus gastos reais por categoria.</p>
          </div>
          <button onclick="FinanceiroModule.openModalOrcamento()" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">＋ Nova Categoria de Orçamento</button>
        </div>
        <div class="scrollable-table-container">
          <table>
            <thead>
              <tr>
                <th style="padding:10px;">Categoria</th>
                <th style="padding:10px;">Orçamento Previsto</th>
                <th style="padding:10px;">Gasto Realizado</th>
                <th style="padding:10px;">Disponível</th>
                <th style="padding:10px;">Progresso</th>
                <th style="padding:10px; text-align:right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${orcamentos.length === 0 ? '<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8;">Nenhum orçamento configurado.</td></tr>' : ''}
              ${orcamentos.map(o => {
                const realizado = transacoes
                  .filter(t => t.tipo === 'Saída' && (t.categoria || '').trim().toLowerCase() === (o.categoria || '').trim().toLowerCase())
                  .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
                
                const previsto = parseFloat(o.previsto || 0);
                const disponivel = previsto - realizado;
                const percentual = previsto > 0 ? Math.min(Math.round((realizado / previsto) * 100), 100) : 0;
                const corBarra = percentual > 90 ? '#dc2626' : percentual > 70 ? '#f59e0b' : '#16a34a';

                return `
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:10px; font-weight:600;">${o.categoria}</td>
                    <td style="padding:10px;">${previsto.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; color:#dc2626; font-weight:bold;">${realizado.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; color:${disponivel >= 0 ? '#16a34a' : '#dc2626'}; font-weight:bold;">${disponivel.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; width:150px;">
                      <div style="background:#e2e8f0; border-radius:4px; height:8px; width:100%; overflow:hidden;">
                        <div style="background:${corBarra}; width:${percentual}%; height:100%;"></div>
                      </div>
                      <span style="font-size:10px; color:#64748b;">${percentual}% utilizado</span>
                    </td>
                    <td style="padding:10px; text-align:right;">
                      <button onclick="FinanceiroModule.eliminarOrcamento('${o.id}')" title="Eliminar" style="background:#ef4444; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer;">🗑️</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderFecho() {
    const transacoes = DB.get('financeiro') || [];
    const entradas = transacoes.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
    const saidas = transacoes.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
    const saldoEsperado = this.calcularSaldoTotal();

    const historicoFechos = DB.get('fechos_caixa') || [];
    const fechosFiltrados = historicoFechos.filter(f => !this.filtroFechoData || f.data === this.filtroFechoData);

    return `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0); max-width:600px;">
          <h3 style="margin-bottom:15px; font-size:16px;">📅 Fecho Diário / Mensal de Caixa</h3>
          <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
              <span>Total de Entradas Acumuladas:</span>
              <strong style="color:#16a34a;">+ ${entradas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
              <span>Total de Saídas Acumuladas:</span>
              <strong style="color:#dc2626;">- ${saidas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:2px solid #334155; font-weight:bold; font-size:15px;">
              <span>Saldo Esperado nas Contas:</span>
              <span style="color:${saldoEsperado >= 0 ? '#2563eb' : '#dc2626'};">${saldoEsperado.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span>
            </div>
            <div style="margin-top:10px;">
              <label style="display:block; font-weight:600; margin-bottom:6px;">Saldo Contado (Dinheiro Físico & Bancos):</label>
              <input type="number" id="fecho-contado" placeholder="0.00" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px;">
            </div>
            <button onclick="FinanceiroModule.fecharCaixa(${saldoEsperado}, ${entradas}, ${saidas})" style="background:#16a34a; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:10px;">🔒 FECHAR PERÍODO</button>
          </div>
        </div>

        <!-- HISTÓRICO DE FECHOS COM FILTRO -->
        <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <h3 style="margin:0; font-size:16px;">📜 Histórico de Fechos de Caixa</h3>
            <div style="display:flex; gap:10px; align-items:center;">
              <label style="font-size:12px; font-weight:bold; color:#64748b;">Filtrar Data:</label>
              <input type="date" value="${this.filtroFechoData}" onchange="FinanceiroModule.atualizarFiltroFechoData(this.value)" style="padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
              ${this.filtroFechoData ? `<button onclick="FinanceiroModule.atualizarFiltroFechoData('')" style="padding:6px 10px; background:#e2e8f0; border:none; border-radius:6px; cursor:pointer; font-size:12px;">Limpar</button>` : ''}
            </div>
          </div>
          <div class="scrollable-table-container">
            <table>
              <thead>
                <tr>
                  <th style="padding:10px;">Data / Hora</th>
                  <th style="padding:10px; text-align:right;">Entradas</th>
                  <th style="padding:10px; text-align:right;">Saídas</th>
                  <th style="padding:10px; text-align:right;">Saldo Esperado</th>
                  <th style="padding:10px; text-align:right;">Saldo Contado</th>
                  <th style="padding:10px; text-align:right;">Diferença</th>
                  <th style="padding:10px;">Responsável</th>
                  <th style="padding:10px; text-align:right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${fechosFiltrados.length === 0 ? '<tr><td colspan="8" style="padding:20px; text-align:center; color:#94a3b8;">Nenhum fecho registado.</td></tr>' : ''}
                ${fechosFiltrados.map(f => `
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:10px; font-weight:600;">${f.timestamp || f.data}</td>
                    <td style="padding:10px; text-align:right; color:#16a34a;">+ ${parseFloat(f.entradas || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; text-align:right; color:#dc2626;">- ${parseFloat(f.saidas || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; text-align:right;">${parseFloat(f.saldoEsperado || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; text-align:right; font-weight:bold;">${parseFloat(f.saldoContado || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px; text-align:right; color:${f.diferenca === 0 ? '#16a34a' : '#dc2626'}; font-weight:bold;">${parseFloat(f.diferenca || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                    <td style="padding:10px;">${f.responsavel || 'Administrador'}</td>
                    <td style="padding:10px; text-align:right;">
                      <button onclick="FinanceiroModule.imprimirFecho('${f.id}')" title="Imprimir Fecho" style="background:#3b82f6; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer;">🖨️</button>
                      <button onclick="FinanceiroModule.eliminarFecho('${f.id}')" title="Eliminar" style="background:#ef4444; border:none; color:#fff; width:28px; height:28px; border-radius:6px; cursor:pointer; margin-left:4px;">🗑️</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  fecharCaixa(saldoEsperado, entradas, saidas) {
    const contadoInput = document.getElementById('fecho-contado');
    const valorContado = parseFloat(contadoInput ? contadoInput.value : 0);
    if (isNaN(valorContado)) return alert('⚠️ Insira um valor válido.');

    const diferenca = valorContado - saldoEsperado;
    const agora = new Date();
    const dataIso = agora.toISOString().split('T')[0];
    const horaStr = agora.toLocaleTimeString('pt-AO');

    const novoFecho = {
      id: Date.now().toString(),
      data: dataIso,
      timestamp: `${dataIso} ${horaStr}`,
      entradas,
      saidas,
      saldoEsperado,
      saldoContado: valorContado,
      diferenca,
      responsavel: this.getUsuarioAtual()
    };

    const fechos = DB.get('fechos_caixa') || [];
    fechos.unshift(novoFecho);
    DB.set('fechos_caixa', fechos);

    alert(`🔒 Fecho registado com sucesso!\n\nSaldo Esperado: ${saldoEsperado.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz\nSaldo Contado: ${valorContado.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz\nDiferença: ${diferenca.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz`);
    this.render();
  },

  eliminarFecho(id) {
    if (!confirm('Deseja eliminar este registo de fecho de caixa?')) return;
    let fechos = DB.get('fechos_caixa') || [];
    fechos = fechos.filter(f => f.id !== id);
    DB.set('fechos_caixa', fechos);
    this.render();
  },

  imprimirFecho(id) {
    const fechos = DB.get('fechos_caixa') || [];
    const item = fechos.find(f => f.id === id);
    if (!item) return alert('Fecho não encontrado.');

    const iframeId = 'print-iframe-hidden';
    let iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.position = 'fixed';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fecho de Caixa - ${item.timestamp || item.data}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background: #fff; }
            .cabecalho-instituicao { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .cabecalho-instituicao h1 { font-size: 16px; margin: 0; color: #1e293b; text-transform: uppercase; font-weight: bold; }
            .cabecalho-instituicao h2 { font-size: 14px; margin: 5px 0; color: #475569; text-transform: uppercase; font-weight: normal; border: none; padding: 0; }
            .cabecalho-instituicao h3 { font-size: 13px; margin: 0; color: #2563eb; text-transform: uppercase; font-weight: bold; }
            h2.titulo-relatorio { color: #2563eb; font-size: 15px; margin-bottom: 5px; text-align: center; text-transform: uppercase; }
            .info-cabecalho { font-size: 12px; color: #64748b; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .resumo-bloco { margin-top: 20px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 6px; font-size: 14px; }
            .resumo-bloco p { margin: 10px 0; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            .positivo { color: #16a34a; font-weight: bold; }
            .negativo { color: #dc2626; font-weight: bold; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="cabecalho-instituicao">
            <h1>Igreja Evangélica Pentecostal Maranata</h1>
            <h2>Centro Missionário Atos Dos Apóstolos</h2>
            <h3>Direção de Finanças</h3>
          </div>
          <h2 class="titulo-relatorio">Comprovativo de Fecho Diário de Caixa</h2>
          <div class="info-cabecalho">
            <span>Responsável: <strong>${item.responsavel || 'Administrador'}</strong></span>
            <span>Data/Hora do Fecho: <strong>${item.timestamp || item.data}</strong></span>
          </div>
          <div class="resumo-bloco">
            <p><strong>Total de Entradas Acumuladas:</strong> <span class="positivo">+ ${parseFloat(item.entradas || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
            <p><strong>Total de Saídas Acumuladas:</strong> <span class="negativo">- ${parseFloat(item.saidas || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
            <p><strong>Saldo Esperado nas Contas:</strong> <span>${parseFloat(item.saldoEsperado || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
            <p><strong>Saldo Contado (Dinheiro & Bancos):</strong> <strong>${parseFloat(item.saldoContado || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong></p>
            <p><strong>Diferença de Caixa:</strong> <span class="${item.diferenca === 0 ? 'positivo' : 'negativo'}">${parseFloat(item.diferenca || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
          </div>
          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px;">
            <div style="text-align: center; width: 40%; border-top: 1px solid #333; padding-top: 5px;">Assinatura do Tesoureiro</div>
            <div style="text-align: center; width: 40%; border-top: 1px solid #333; padding-top: 5px;">Aprovação da Direção</div>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Imprimir Fecho</button>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  },

  renderRelatorios() {
    return `
      <div style="background:#fff; padding:20px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
        <h3 style="margin-bottom:15px; font-size:16px;">📊 Centro de Relatórios Financeiros</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <button onclick="FinanceiroModule.imprimirRelatorio('fluxo')" style="padding:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; text-align:left;">📄 Relatório de Fluxo de Caixa</button>
          <button onclick="FinanceiroModule.imprimirRelatorio('dizimos')" style="padding:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; text-align:left;">📄 Relatório de Dízimos</button>
          <button onclick="FinanceiroModule.imprimirRelatorio('despesas')" style="padding:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; text-align:left;">📄 Relatório de Despesas</button>
          <button onclick="FinanceiroModule.imprimirRelatorio('balanco')" style="padding:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; font-weight:600; cursor:pointer; text-align:left;">📄 Balanço Financeiro Anual</button>
        </div>
      </div>
    `;
  },

  imprimirListaGeral() {
    this.imprimirRelatorio('fluxo');
  },

  imprimirRelatorio(tipo) {
    const transacoes = DB.get('financeiro') || [];
    const contas = DB.get('contas_financeiras') || [];
    const orcamentos = DB.get('orcamentos') || [];
    const dataAtual = new Date().toLocaleDateString('pt-AO');
    const usuario = this.getUsuarioAtual();

    let titulo = '';
    let conteudoTabela = '';

    if (tipo === 'fluxo') {
      titulo = 'Relatório de Fluxo de Caixa';
      const totalEntradas = transacoes.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
      const totalSaidas = transacoes.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
      const saldoFinal = totalEntradas - totalSaidas;

      conteudoTabela = `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Descrição</th>
              <th style="text-align:right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${transacoes.length === 0 ? '<tr><td colspan="6" style="text-align:center;">Nenhum registo encontrado.</td></tr>' : ''}
            ${transacoes.map(t => `
              <tr>
                <td>${t.data || '—'}</td>
                <td><span class="${t.tipo === 'Entrada' ? 'positivo' : 'negativo'}">${t.tipo}</span></td>
                <td>${t.categoria || '—'}</td>
                <td>${t.conta || 'Caixa Principal'}</td>
                <td>${t.descricao || '—'}</td>
                <td style="text-align:right;" class="${t.tipo === 'Entrada' ? 'positivo' : 'negativo'}">${t.tipo === 'Entrada' ? '+' : '-'} ${parseFloat(t.valor || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="resumo-bloco">
          <p><strong>Total de Entradas:</strong> <span class="positivo">+ ${totalEntradas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
          <p><strong>Total de Saídas:</strong> <span class="negativo">- ${totalSaidas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
          <p><strong>Saldo Líquido do Período:</strong> <strong>${saldoFinal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong></p>
        </div>
      `;
    } else if (tipo === 'dizimos') {
      titulo = 'Relatório de Dízimos';
      const dizimos = transacoes.filter(t => (t.categoria || '').toLowerCase().includes('dízimo') || (t.categoria || '').toLowerCase().includes('dizimo'));
      const totalDizimos = dizimos.reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

      conteudoTabela = `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Conta de Destino</th>
              <th>Descrição / Membro</th>
              <th style="text-align:right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${dizimos.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Nenhum registo de dízimo encontrado.</td></tr>' : ''}
            ${dizimos.map(t => `
              <tr>
                <td>${t.data || '—'}</td>
                <td>${t.categoria}</td>
                <td>${t.conta || 'Caixa Principal'}</td>
                <td>${t.descricao || '—'}</td>
                <td style="text-align:right;" class="positivo">+ ${parseFloat(t.valor || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="resumo-bloco">
          <p><strong>Total Arrecadado em Dízimos:</strong> <span class="positivo">${totalDizimos.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
        </div>
      `;
    } else if (tipo === 'despesas') {
      titulo = 'Relatório de Despesas';
      const despesas = transacoes.filter(t => t.tipo === 'Saída');
      const totalDespesas = despesas.reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

      conteudoTabela = `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Conta de Origem</th>
              <th>Descrição</th>
              <th style="text-align:right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${despesas.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Nenhum registo de despesa encontrado.</td></tr>' : ''}
            ${despesas.map(t => `
              <tr>
                <td>${t.data || '—'}</td>
                <td>${t.categoria}</td>
                <td>${t.conta || 'Caixa Principal'}</td>
                <td>${t.descricao || '—'}</td>
                <td style="text-align:right;" class="negativo">- ${parseFloat(t.valor || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="resumo-bloco">
          <p><strong>Total de Despesas Realizadas:</strong> <span class="negativo">${totalDespesas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
        </div>
      `;
    } else if (tipo === 'balanco') {
      titulo = 'Balanço Financeiro Anual';
      const saldoContas = this.calcularSaldoTotal();
      const totalEntradas = transacoes.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
      const totalSaidas = transacoes.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);

      conteudoTabela = `
        <h3>Resumo de Contas Bancárias & Caixas</h3>
        <table>
          <thead>
            <tr>
              <th>Nome da Conta</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th style="text-align:right;">Saldo Atual</th>
            </tr>
          </thead>
          <tbody>
            ${contas.map(c => `
              <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.tipo}</td>
                <td>${c.descricao || '—'}</td>
                <td style="text-align:right; font-weight:bold;">${parseFloat(c.saldo || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-top:20px;">Orçamento Anual & Execução</h3>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Previsto</th>
              <th>Realizado</th>
              <th style="text-align:right;">Disponível</th>
            </tr>
          </thead>
          <tbody>
            ${orcamentos.map(o => {
              const realizado = transacoes
                .filter(t => t.tipo === 'Saída' && (t.categoria || '').trim().toLowerCase() === (o.categoria || '').trim().toLowerCase())
                .reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
              const previsto = parseFloat(o.previsto || 0);
              const disponivel = previsto - realizado;
              return `
                <tr>
                  <td><strong>${o.categoria}</strong></td>
                  <td>${previsto.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                  <td class="negativo">${realizado.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                  <td style="text-align:right;" class="${disponivel >= 0 ? 'positivo' : 'negativo'}">${disponivel.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="resumo-bloco">
          <p><strong>Total de Receitas Acumuladas:</strong> <span class="positivo">+ ${totalEntradas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
          <p><strong>Total de Despesas Acumuladas:</strong> <span class="negativo">- ${totalSaidas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></p>
          <p><strong>Saldo Consolidado Geral nas Contas:</strong> <strong style="font-size:16px; color:#2563eb;">${saldoContas.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong></p>
        </div>
      `;
    }

    const iframeId = 'print-iframe-hidden';
    let iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.position = 'fixed';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titulo} - EcclesiaSys</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; background: #fff; }
            .cabecalho-instituicao { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .cabecalho-instituicao h1 { font-size: 16px; margin: 0; color: #1e293b; text-transform: uppercase; font-weight: bold; }
            .cabecalho-instituicao h2 { font-size: 14px; margin: 5px 0; color: #475569; text-transform: uppercase; font-weight: normal; border: none; padding: 0; }
            .cabecalho-instituicao h3 { font-size: 13px; margin: 0; color: #2563eb; text-transform: uppercase; font-weight: bold; }
            h2.titulo-relatorio { color: #2563eb; font-size: 15px; margin-bottom: 5px; text-align: center; text-transform: uppercase; }
            h3 { color: #334155; margin-top: 20px; font-size: 14px; text-transform: uppercase; }
            .info-cabecalho { font-size: 12px; color: #64748b; margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 10px; padding: 8px; text-align: left; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .positivo { color: #16a34a; font-weight: bold; }
            .negativo { color: #dc2626; font-weight: bold; }
            .resumo-bloco { margin-top: 20px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; font-size: 13px; }
            .resumo-bloco p { margin: 6px 0; display: flex; justify-content: space-between; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="cabecalho-instituicao">
            <h1>Igreja Evangélica Pentecostal Maranata</h1>
            <h2>Centro Missionário Atos Dos Apóstolos</h2>
            <h3>Direção de Finanças</h3>
          </div>
          <h2 class="titulo-relatorio">${titulo}</h2>
          <div class="info-cabecalho">
            <span>Emitido por: <strong>${usuario}</strong></span>
            <span>Data de Emissão: <strong>${dataAtual}</strong></span>
          </div>
          ${conteudoTabela}
          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Imprimir Relatório</button>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  },

  openModalConta() {
    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:400px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:15px; color:#1e293b;">Adicionar Nova Conta</h3>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Nome da Conta</label><input type="text" id="conta-nome" placeholder="Ex: Conta BFA, Caixa Secundário" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Tipo</label>
          <select id="conta-tipo" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            <option>Espécie</option><option>Banco</option><option>Mobile Money</option><option>Fundo de Departamento</option>
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Saldo Inicial (Kz)</label><input type="number" id="conta-saldo" placeholder="0.00" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px; font-weight:bold;">Descrição</label><input type="text" id="conta-desc" placeholder="Detalhes da conta" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 14px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="FinanceiroModule.salvarConta()" style="padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Guardar Conta</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  salvarConta() {
    const nome = document.getElementById('conta-nome').value.trim();
    const tipo = document.getElementById('conta-tipo').value;
    const saldo = parseFloat(document.getElementById('conta-saldo').value) || 0;
    const descricao = document.getElementById('conta-desc').value.trim();

    if (!nome) return alert('Insira o nome da conta.');
    const contas = DB.get('contas_financeiras') || [];
    contas.push({ id: Date.now().toString(), nome, tipo, saldo, descricao });
    DB.set('contas_financeiras', contas);
    document.getElementById('modal-financeiro').style.display = 'none';
    this.render();
  },

  eliminarConta(id) {
    if (!confirm('Deseja eliminar esta conta?')) return;
    let contas = DB.get('contas_financeiras') || [];
    contas = contas.filter(c => c.id !== id);
    DB.set('contas_financeiras', contas);
    this.render();
  },

  openModalTransferencia() {
    const contas = DB.get('contas_financeiras') || [];
    if (contas.length < 2) return alert('⚠️ É necessário ter pelo menos 2 contas registadas para efetuar transferências internas.');

    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }
    const hoje = new Date().toISOString().split('T')[0];
    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:420px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:15px; color:#1e293b;">Transferência Entre Contas</h3>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Data</label><input type="date" id="tr-data" value="${hoje}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Conta de Origem</label>
          <select id="tr-origem" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            ${contas.map(c => `<option value="${c.nome}">${c.nome} (${parseFloat(c.saldo).toLocaleString('pt-AO')} Kz)</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Conta de Destino</label>
          <select id="tr-destino" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            ${contas.map(c => `<option value="${c.nome}">${c.nome} (${parseFloat(c.saldo).toLocaleString('pt-AO')} Kz)</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Valor (Kz)</label><input type="number" id="tr-valor" placeholder="0.00" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px; font-weight:bold;">Descrição</label><input type="text" id="tr-desc" placeholder="Motivo da transferência" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 14px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="FinanceiroModule.salvarTransferencia()" style="padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Efetuar Transferência</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  salvarTransferencia() {
    const data = document.getElementById('tr-data').value;
    const origem = document.getElementById('tr-origem').value;
    const destino = document.getElementById('tr-destino').value;
    const valor = parseFloat(document.getElementById('tr-valor').value);
    const descricao = document.getElementById('tr-desc').value.trim();

    if (origem === destino) return alert('⚠️ A conta de origem e destino não podem ser iguais.');
    if (!valor || valor <= 0) return alert('Insira um valor válido.');

    let contas = DB.get('contas_financeiras') || [];
    const contaOrigemObj = contas.find(c => c.nome === origem);
    if (!contaOrigemObj || contaOrigemObj.saldo < valor) {
      return alert(`⚠️ Saldo insuficiente na conta de origem (${origem}).`);
    }

    contas = contas.map(c => {
      if (c.nome === origem) c.saldo = parseFloat(c.saldo) - valor;
      if (c.nome === destino) c.saldo = parseFloat(c.saldo) + valor;
      return c;
    });
    DB.set('contas_financeiras', contas);

    const transferencias = DB.get('transferencias') || [];
    transferencias.push({ id: Date.now().toString(), data, origem, destino, valor, descricao });
    DB.set('transferencias', transferencias);

    document.getElementById('modal-financeiro').style.display = 'none';
    this.render();
  },

  eliminarTransferencia(id) {
    if (!confirm('Deseja eliminar este registo de transferência?')) return;
    let transferencias = DB.get('transferencias') || [];
    transferencias = transferencias.filter(t => t.id !== id);
    DB.set('transferencias', transferencias);
    this.render();
  },

  openModalOrcamento() {
    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:400px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:15px; color:#1e293b;">Novo Orçamento por Categoria</h3>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Categoria</label><input type="text" id="orc-cat" placeholder="Ex: Construção, Eventos, Evangelismo" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px; font-weight:bold;">Valor Previsto (Kz)</label><input type="number" id="orc-previsto" placeholder="0.00" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 14px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="FinanceiroModule.salvarOrcamento()" style="padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Guardar Orçamento</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  salvarOrcamento() {
    const categoria = document.getElementById('orc-cat').value.trim();
    const previsto = parseFloat(document.getElementById('orc-previsto').value);

    if (!categoria || isNaN(previsto)) return alert('Preencha todos os campos corretamente.');
    const orcamentos = DB.get('orcamentos') || [];
    orcamentos.push({ id: Date.now().toString(), categoria, previsto });
    DB.set('orcamentos', orcamentos);
    document.getElementById('modal-financeiro').style.display = 'none';
    this.render();
  },

  eliminarOrcamento(id) {
    if (!confirm('Deseja eliminar este orçamento?')) return;
    let orcamentos = DB.get('orcamentos') || [];
    orcamentos = orcamentos.filter(o => o.id !== id);
    DB.set('orcamentos', orcamentos);
    this.render();
  },

  openModalReceita() {
    const contas = DB.get('contas_financeiras') || [];
    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }
    const hoje = new Date().toISOString().split('T')[0];
    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:15px; color:#1e293b;">Nova Receita</h3>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Data</label><input type="date" id="rec-data" value="${hoje}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Categoria</label>
          <select id="rec-cat" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            <option>Dízimo</option><option>Oferta</option><option>Doação</option><option>Contribuição</option><option>Campanha</option><option>Outras receitas</option>
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Conta de Destino</label>
          <select id="rec-conta" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            ${contas.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Valor (Kz)</label><input type="number" id="rec-valor" placeholder="0.00" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px; font-weight:bold;">Descrição / Membro</label><input type="text" id="rec-desc" placeholder="Ex: Dízimo do irmão João" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 14px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="FinanceiroModule.salvarReceita()" style="padding:8px 16px; background:#16a34a; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Registar Receita</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  salvarReceita() {
    const data = document.getElementById('rec-data').value;
    const categoria = document.getElementById('rec-cat').value;
    const conta = document.getElementById('rec-conta').value;
    const valor = parseFloat(document.getElementById('rec-valor').value);
    const descricao = document.getElementById('rec-desc').value.trim();

    if (!valor || valor <= 0) return alert('Insira um valor válido.');

    let contas = DB.get('contas_financeiras') || [];
    contas = contas.map(c => {
      if (c.nome === conta) c.saldo = parseFloat(c.saldo || 0) + valor;
      return c;
    });
    DB.set('contas_financeiras', contas);

    const transacoes = DB.get('financeiro') || [];
    transacoes.push({ id: Date.now().toString(), tipo: 'Entrada', categoria, conta, valor, data, descricao, responsavel: this.getUsuarioAtual(), editCount: 0 });
    DB.set('financeiro', transacoes);

    document.getElementById('modal-financeiro').style.display = 'none';
    this.render();
  },

  openModalDespesa() {
    const saldoAtual = this.calcularSaldoTotal();
    const contas = DB.get('contas_financeiras') || [];
    const orcamentos = DB.get('orcamentos') || [];
    
    const categoriasPadrao = ['Despesas Administrativas', 'Água / Energia', 'Salários / Subsídios', 'Manutenção', 'Eventos', 'Evangelismo', 'Assistência Social', 'Outras despesas'];
    const categoriasOrcamento = orcamentos.map(o => o.categoria);
    const todasCategorias = [...new Set([...categoriasOrcamento, ...categoriasPadrao])];

    if (saldoAtual <= 0) {
      alert('⚠️ Operação negada! Não existem fundos disponíveis nas contas para realizar despesas.');
      return;
    }

    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }
    const hoje = new Date().toISOString().split('T')[0];
    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:15px; color:#1e293b;">Nova Despesa</h3>
        <p style="font-size:12px; color:#64748b; margin-bottom:10px;">Saldo total disponível: <strong>${saldoAtual.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</strong></p>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Data</label><input type="date" id="desp-data" value="${hoje}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Categoria</label>
          <select id="desp-cat" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            ${todasCategorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Conta de Origem</label>
          <select id="desp-conta" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
            ${contas.map(c => `<option value="${c.nome}">${c.nome} (${parseFloat(c.saldo).toLocaleString('pt-AO')} Kz)</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Valor (Kz)</label><input type="number" id="desp-valor" placeholder="0.00" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px; font-weight:bold;">Descrição</label><input type="text" id="desp-desc" placeholder="Ex: Pagamento de eletricidade" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 14px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="FinanceiroModule.salvarDespesa()" style="padding:8px 16px; background:#dc2626; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Registar Despesa</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  salvarDespesa() {
    const data = document.getElementById('desp-data').value;
    const categoria = document.getElementById('desp-cat').value;
    const conta = document.getElementById('desp-conta').value;
    const valor = parseFloat(document.getElementById('desp-valor').value);
    const descricao = document.getElementById('desp-desc').value.trim();

    if (!valor || valor <= 0) return alert('Insira um valor válido.');

    let contas = DB.get('contas_financeiras') || [];
    const contaObj = contas.find(c => c.nome === conta);
    if (!contaObj || contaObj.saldo < valor) {
      return alert(`⚠️ Saldo insuficiente na conta selecionada (${conta}).`);
    }

    contas = contas.map(c => {
      if (c.nome === conta) c.saldo = parseFloat(c.saldo) - valor;
      return c;
    });
    DB.set('contas_financeiras', contas);

    const transacoes = DB.get('financeiro') || [];
    transacoes.push({ id: Date.now().toString(), tipo: 'Saída', categoria, conta, valor, data, descricao, responsavel: this.getUsuarioAtual(), editCount: 0 });
    DB.set('financeiro', transacoes);

    document.getElementById('modal-financeiro').style.display = 'none';
    this.render();
  },

  visualizar(id, tipo) {
    const transacoes = DB.get('financeiro') || [];
    const item = transacoes.find(t => t.id === id);
    if (!item) return alert('Registo não encontrado.');
    alert(`Detalhes do Registo:\n\nData: ${item.data}\nTipo: ${item.tipo}\nCategoria: ${item.categoria}\nConta: ${item.conta || 'Caixa Principal'}\nValor: ${parseFloat(item.valor).toLocaleString('pt-AO')} Kz\nDescrição: ${item.descricao}\nNúmero de Edições: ${item.editCount || 0}`);
  },

  // FUNCIONALIDADE DE EDIÇÃO COM LIMITE DE 3X E APROVAÇÃO ADMIN NA 4ª
  editar(id, tipo) {
    let transacoes = DB.get('financeiro') || [];
    const item = transacoes.find(t => t.id === id);
    if (!item) return alert('Registo não encontrado.');

    item.editCount = item.editCount || 0;

    if (item.editCount >= 3) {
      const senhaAdmin = prompt(`⚠️ Este registo já foi editado ${item.editCount} vezes.\nA 4ª edição requer aprovação e código/senha de Administrador:`);
      // Verifica senha de admin (ou PIN padrão 'admin123' ou permissão de admin)
      if (senhaAdmin !== 'admin123' && !this.isAdmin()) {
        return alert('❌ Senha de Administrador incorreta ou sem permissões para autorizar a 4ª edição.');
      }
      alert('✅ Aprovação de Administrador concedida para a 4ª edição!');
    }

    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:15px; color:#1e293b;">Editar Transação (Edição nº ${(item.editCount || 0) + 1})</h3>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Data</label><input type="date" id="edit-data" value="${item.data || ''}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Categoria</label><input type="text" id="edit-cat" value="${item.categoria || ''}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:12px; font-weight:bold;">Valor (Kz)</label><input type="number" id="edit-valor" value="${item.valor || 0}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px; font-weight:bold;">Descrição</label><input type="text" id="edit-desc" value="${item.descricao || ''}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;"></div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 14px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="FinanceiroModule.salvarEdicao('${id}')" style="padding:8px 16px; background:#8b5cf6; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Guardar Alterações</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  salvarEdicao(id) {
    let transacoes = DB.get('financeiro') || [];
    const index = transacoes.findIndex(t => t.id === id);
    if (index === -1) return;

    const novaData = document.getElementById('edit-data').value;
    const novaCat = document.getElementById('edit-cat').value.trim();
    const novoValor = parseFloat(document.getElementById('edit-valor').value);
    const novaDesc = document.getElementById('edit-desc').value.trim();

    if (!novoValor || novoValor <= 0) return alert('Insira um valor válido.');

    transacoes[index].data = novaData;
    transacoes[index].categoria = novaCat;
    transacoes[index].valor = novoValor;
    transacoes[index].descricao = novaDesc;
    transacoes[index].editCount = (transacoes[index].editCount || 0) + 1;
    transacoes[index].ultimaEdicaoPor = this.getUsuarioAtual();

    DB.set('financeiro', transacoes);
    document.getElementById('modal-financeiro').style.display = 'none';
    alert('✅ Registo atualizado com sucesso!');
    this.render();
  },

  imprimir(id, tipo) {
    const transacoes = DB.get('financeiro') || [];
    const item = transacoes.find(t => t.id === id);
    if (!item) return alert('Registo não encontrado.');
    
    const iframeId = 'print-iframe-hidden';
    let iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeId;
      iframe.style.position = 'fixed';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprovativo - ${item.tipo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .cabecalho-instituicao { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .cabecalho-instituicao h1 { font-size: 16px; margin: 0; color: #1e293b; text-transform: uppercase; font-weight: bold; }
            .cabecalho-instituicao h2 { font-size: 14px; margin: 5px 0; color: #475569; text-transform: uppercase; font-weight: normal; border: none; padding: 0; }
            .cabecalho-instituicao h3 { font-size: 13px; margin: 0; color: #2563eb; text-transform: uppercase; font-weight: bold; }
            h2.titulo-comprovativo { border-bottom: 2px solid #2563eb; padding-bottom: 10px; color: #2563eb; font-size: 15px; text-transform: uppercase; text-align: center; }
            .detalhe { margin: 10px 0; font-size: 14px; }
            .valor { font-size: 18px; font-weight: bold; margin-top: 20px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="cabecalho-instituicao">
            <h1>Igreja Evangélica Pentecostal Maranata</h1>
            <h2>Centro Missionário Atos Dos Apóstolos</h2>
            <h3>Direção de Finanças</h3>
          </div>
          <h2 class="titulo-comprovativo">Comprovativo de ${item.tipo}</h2>
          <div class="detalhe"><strong>ID do Registo:</strong> ${item.id}</div>
          <div class="detalhe"><strong>Data:</strong> ${item.data}</div>
          <div class="detalhe"><strong>Tipo:</strong> ${item.tipo}</div>
          <div class="detalhe"><strong>Categoria:</strong> ${item.categoria}</div>
          <div class="detalhe"><strong>Conta:</strong> ${item.conta || 'Caixa Principal'}</div>
          <div class="detalhe"><strong>Descrição:</strong> ${item.descricao || '—'}</div>
          <div class="detalhe"><strong>Responsável:</strong> ${item.responsavel || 'Administrador'}</div>
          <div class="valor">Valor: ${parseFloat(item.valor).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</div>
          <div style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Imprimir Comprovativo</button>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  },

  // ELIMINAR COM JUSTIFICATIVA E ARQUIVO SEGURO PARA ADMIN (LIXO FINANCEIRO)
  eliminarPrompt(id, tipo) {
    const justificativa = prompt('⚠️ Justificativa obrigatória para eliminar esta transação:');
    if (justificativa === null) return; // Cancelado
    if (!justificativa.trim()) {
      alert('❌ A justificativa é obrigatória para efetuar a eliminação.');
      return;
    }
    this.eliminar(id, tipo, justificativa.trim());
  },

  eliminar(id, tipo, justificativa) {
    let transacoes = DB.get('financeiro') || [];
    const item = transacoes.find(t => t.id === id);
    if (!item) return alert('Registo não encontrado.');

    // Salvar no lixo seguro para o Admin
    const lixo = DB.get('lixo_financeiro') || [];
    const agora = new Date();
    lixo.unshift({
      ...item,
      eliminadoPor: this.getUsuarioAtual(),
      dataEliminacao: agora.toISOString().split('T')[0],
      horaEliminacao: agora.toLocaleTimeString('pt-AO'),
      justificativa: justificativa
    });
    DB.set('lixo_financeiro', lixo);

    // Estornar valor na conta
    let contas = DB.get('contas_financeiras') || [];
    contas = contas.map(c => {
      if (c.nome === (item.conta || 'Caixa Principal')) {
        if (item.tipo === 'Entrada') c.saldo = parseFloat(c.saldo) - parseFloat(item.valor);
        if (item.tipo === 'Saída') c.saldo = parseFloat(c.saldo) + parseFloat(item.valor);
      }
      return c;
    });
    DB.set('contas_financeiras', contas);

    transacoes = transacoes.filter(t => t.id !== id);
    DB.set('financeiro', transacoes);
    alert('🗑️ Registo eliminado e arquivado com segurança no histórico do administrador.');
    this.render();
  },

  openModalLixoAdmin() {
    if (!this.isAdmin()) return alert('⚠️ Acesso restrito apenas a Administradores.');
    const lixo = DB.get('lixo_financeiro') || [];

    let modal = document.getElementById('modal-financeiro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-financeiro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:750px; max-height:80vh; overflow-y:auto; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <h3 style="margin:0; color:#1e293b;">🗑️ Arquivo de Transações Eliminadas (Área Restrita Admin)</h3>
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="background:none; border:none; font-size:16px; cursor:pointer;">✕</button>
        </div>
        <p style="font-size:12px; color:#64748b; margin-bottom:15px;">Registo detalhado de todas as exclusões, incluindo autor, data, hora e justificativa.</p>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#f8fafc; text-align:left; color:#64748b; text-transform:uppercase;">
              <th style="padding:8px;">Data/Hora Exclusão</th>
              <th style="padding:8px;">Utilizador</th>
              <th style="padding:8px;">Transação</th>
              <th style="padding:8px; text-align:right;">Valor</th>
              <th style="padding:8px;">Justificativa</th>
            </tr>
          </thead>
          <tbody>
            ${lixo.length === 0 ? '<tr><td colspan="5" style="padding:20px; text-align:center; color:#94a3b8;">Nenhum registo no lixo.</td></tr>' : ''}
            ${lixo.map(item => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px;">${item.dataEliminacao} ${item.horaEliminacao}</td>
                <td style="padding:8px; font-weight:bold;">${item.eliminadoPor}</td>
                <td style="padding:8px;"><strong>${item.tipo}</strong> - ${item.categoria}<br><small>${item.descricao || ''}</small></td>
                <td style="padding:8px; text-align:right; font-weight:bold; color:${item.tipo === 'Entrada' ? '#16a34a' : '#dc2626'};">${parseFloat(item.valor).toLocaleString('pt-AO')} Kz</td>
                <td style="padding:8px; font-style:italic; color:#475569;">"${item.justificativa}"</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top:20px; text-align:right;">
          <button onclick="document.getElementById('modal-financeiro').style.display='none'" style="padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Fechar</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }
};