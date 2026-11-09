const RelatoriosModule = {
  tipoAtual: 'geral',

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-relatorios');
    if (!container) return;

    // Obtenção de Dados Globais
    const membros = DB.get('membros') || [];
    const financeiro = DB.get('financeiro') || [];
    const patrimonio = DB.get('patrimonio') || [];
    const cultos = DB.get('cultos') || [];

    // Cálculos Rápidos
    const totalEntradas = financeiro.filter(f => f.tipo === 'Entrada').reduce((acc, f) => acc + (parseFloat(f.valor) || 0), 0);
    const totalSaidas = financeiro.filter(f => f.tipo === 'Saída').reduce((acc, f) => acc + (parseFloat(f.valor) || 0), 0);
    const saldoAtual = totalEntradas - totalSaidas;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2>📊 Central de Relatórios & Estatísticas</h2>
          <p style="color:var(--text-muted); font-size:13px;">Gere resumos executivos da igreja para análise interna e impressão.</p>
        </div>
        <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 18px; display:flex; align-items:center; gap:8px;">
          🖨️ Imprimir Relatório
        </button>
      </div>

      <!-- SELETOR DE TIPO DE RELATÓRIO -->
      <div style="display:flex; gap:10px; margin-bottom:20px; background:#fff; padding:8px; border-radius:10px; border:1px solid var(--border-color);">
        <button onclick="RelatoriosModule.setTipo('geral')" style="${this.getTabStyle('geral')}">📋 Geral & Resumo Executive</button>
        <button onclick="RelatoriosModule.setTipo('financeiro')" style="${this.getTabStyle('financeiro')}">💰 Relatório Financeiro</button>
        <button onclick="RelatoriosModule.setTipo('membros')" style="${this.getTabStyle('membros')}">👥 Membros & Departamentos</button>
        <button onclick="RelatoriosModule.setTipo('patrimonio')" style="${this.getTabStyle('patrimonio')}">🏛 Inventário / Património</button>
      </div>

      <!-- ÁREA DE CONTEÚDO DO RELATÓRIO (IMPRESSÃO OK) -->
      <div id="print-area" style="background:#fff; padding:25px; border-radius:12px; border:1px solid var(--border-color);">
        ${this.renderConteudoRelatorio(membros, financeiro, patrimonio, cultos, totalEntradas, totalSaidas, saldoAtual)}
      </div>
    `;
  },

  getTabStyle(tipo) {
    const active = this.tipoAtual === tipo;
    return `padding:9px 16px; border-radius:6px; font-weight:600; font-size:13px; border:none; cursor:pointer; background:${active ? 'var(--primary-blue, #2563eb)' : 'transparent'}; color:${active ? '#fff' : 'var(--text-muted)'};`;
  },

  setTipo(tipo) {
    this.tipoAtual = tipo;
    this.render();
  },

  renderConteudoRelatorio(membros, financeiro, patrimonio, cultos, totalEntradas, totalSaidas, saldoAtual) {
    if (this.tipoAtual === 'financeiro') {
      return `
        <h3 style="border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px; color:var(--text-main);">Demonstrativo Financeiro</h3>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:20px;">
          <div style="padding:15px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
            <small style="color:#166534; font-weight:bold;">TOTAL ENTRADAS</small>
            <h2 style="color:#15803d; margin-top:5px;">${totalEntradas.toLocaleString('pt-AO')} Kz</h2>
          </div>
          <div style="padding:15px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px;">
            <small style="color:#991b1b; font-weight:bold;">TOTAL SAÍDAS</small>
            <h2 style="color:#b91c1c; margin-top:5px;">${totalSaidas.toLocaleString('pt-AO')} Kz</h2>
          </div>
          <div style="padding:15px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px;">
            <small style="color:#1e40af; font-weight:bold;">SALDO LÍQUIDO</small>
            <h2 style="color:#1d4ed8; margin-top:5px;">${saldoAtual.toLocaleString('pt-AO')} Kz</h2>
          </div>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#64748b;">
              <th style="padding:10px;">DATA</th>
              <th style="padding:10px;">DESCRIÇÃO</th>
              <th style="padding:10px;">CATEGORIA</th>
              <th style="padding:10px;">TIPO</th>
              <th style="padding:10px; text-align:right;">VALOR</th>
            </tr>
          </thead>
          <tbody>
            ${financeiro.length === 0 ? '<tr><td colspan="5" style="padding:15px; text-align:center; color:#94a3b8;">Sem lançamentos.</td></tr>' : ''}
            ${financeiro.map(f => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px;">${f.data || '-'}</td>
                <td style="padding:10px; font-weight:600;">${f.descricao}</td>
                <td style="padding:10px;">${f.categoria}</td>
                <td style="padding:10px;"><span style="color:${f.tipo === 'Entrada' ? '#16a34a' : '#dc2626'}; font-weight:bold;">${f.tipo}</span></td>
                <td style="padding:10px; text-align:right; font-weight:600;">${(parseFloat(f.valor) || 0).toLocaleString('pt-AO')} Kz</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (this.tipoAtual === 'membros') {
      const ativos = membros.filter(m => m.status === 'Ativo').length;
      return `
        <h3 style="border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px; color:var(--text-main);">Relatório Geral de Membraria</h3>
        <p style="margin-bottom:15px; font-size:14px;">Total Registado: <strong>${membros.length}</strong> | Membros Ativos: <strong style="color:#16a34a;">${ativos}</strong></p>
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#64748b;">
              <th style="padding:10px;">NOME</th>
              <th style="padding:10px;">TELEFONE</th>
              <th style="padding:10px;">CARGO</th>
              <th style="padding:10px;">DEPARTAMENTO</th>
              <th style="padding:10px;">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            ${membros.length === 0 ? '<tr><td colspan="5" style="padding:15px; text-align:center; color:#94a3b8;">Sem membros cadastrados.</td></tr>' : ''}
            ${membros.map(m => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px; font-weight:600;">${m.nome}</td>
                <td style="padding:10px;">${m.telefone || 'N/A'}</td>
                <td style="padding:10px;">${m.cargo || 'Membro'}</td>
                <td style="padding:10px;">${m.departamento || 'Geral'}</td>
                <td style="padding:10px;"><span style="color:${m.status === 'Ativo' ? '#16a34a' : '#64748b'}; font-weight:bold;">${m.status || 'Ativo'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (this.tipoAtual === 'patrimonio') {
      return `
        <h3 style="border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px; color:var(--text-main);">Inventário do Património</h3>
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#64748b;">
              <th style="padding:10px;">ITEM</th>
              <th style="padding:10px;">CATEGORIA</th>
              <th style="padding:10px;">QTD</th>
              <th style="padding:10px;">LOCALIZAÇÃO</th>
              <th style="padding:10px;">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            ${patrimonio.length === 0 ? '<tr><td colspan="5" style="padding:15px; text-align:center; color:#94a3b8;">Sem itens no inventário.</td></tr>' : ''}
            ${patrimonio.map(p => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px; font-weight:600;">${p.nome}</td>
                <td style="padding:10px;">${p.categoria}</td>
                <td style="padding:10px; font-weight:bold;">${p.quantidade}</td>
                <td style="padding:10px;">${p.localizacao || 'Nave Principal'}</td>
                <td style="padding:10px;"><span style="font-weight:bold;">${p.estado}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Visão Geral por defeito
    return `
      <h3 style="border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:20px; color:var(--text-main);">Resumo Executivo da Igreja</h3>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px; margin-bottom:25px;">
        <div style="padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
          <small style="color:#64748b; font-weight:bold;">TOTAL MEMBROS</small>
          <h2 style="color:#2563eb; margin-top:5px;">${membros.length}</h2>
        </div>
        <div style="padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
          <small style="color:#64748b; font-weight:bold;">SALDO ATUAL</small>
          <h2 style="color:${saldoAtual >= 0 ? '#16a34a' : '#dc2626'}; margin-top:5px;">${saldoAtual.toLocaleString('pt-AO')} Kz</h2>
        </div>
        <div style="padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
          <small style="color:#64748b; font-weight:bold;">ITENS PATRIMÓNIO</small>
          <h2 style="color:#0284c7; margin-top:5px;">${patrimonio.length}</h2>
        </div>
        <div style="padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
          <small style="color:#64748b; font-weight:bold;">CULTOS/EVENTOS</small>
          <h2 style="color:#9333ea; margin-top:5px;">${cultos.length}</h2>
        </div>
      </div>
      <p style="font-size:13px; color:#64748b;">Selecione uma das abas acima para visualizar e imprimir relatórios detalhados por área.</p>
    `;
  }
};