// ============================================================================
// Módulo de Departamentos - EcclesiaSys (Com Filtros e Conclusão com Ordem/Presença)
// ============================================================================

const DepartamentosModule = {
  departamentos: [],
  viewMode: 'dashboard', // 'dashboard', 'lista', 'perfil'
  activeDepartamentoId: null,
  activeTabPerfil: 'resumo',
  editandoEquipaIndex: null,
  membrosTempEquipa: [],
  editandoDepartamentoId: null,
  editandoAtividadeId: null,
  filtroTexto: '',

  init: function() {
    this.carregarDados();
    this.render();
  },

  carregarDados: function() {
    const salvo = localStorage.getItem('ecclesiasys_departamentos_v5');
    if (salvo) {
      try {
        this.departamentos = JSON.parse(salvo);
      } catch (e) {
        this.departamentos = this.getDefaultDepartamentos();
      }
    } else {
      this.departamentos = this.getDefaultDepartamentos();
      this.salvarDados();
    }
  },

  getDefaultDepartamentos: function() {
    return [
      {
        id: 1,
        nome: 'Departamento da Juventude',
        sigla: 'DJ',
        categoria: 'Ministério',
        responsavel: 'Emanuel Miguel Capitango Manuel',
        secretario: '',
        financeiro: '',
        outroLider: '',
        estado: 'Ativo',
        descricao: 'Departamento automático para membros da juventude.',
        orcamentoAnual: 500000,
        executado: 0,
        equipas: [],
        atividades: []
      }
    ];
  },

  salvarDados: function() {
    localStorage.setItem('ecclesiasys_departamentos_v5', JSON.stringify(this.departamentos));
  },

  corresponderDepartamento: function(nomeDepMembro, nomeDepSistema) {
    if (!nomeDepMembro || !nomeDepSistema) return false;
    const m = nomeDepMembro.toLowerCase().trim();
    const s = nomeDepSistema.toLowerCase().trim();
    if (m === s) return true;
    if (m.includes('juventude') && s.includes('juventude')) return true;
    if (m.includes('jovens') && s.includes('jovens')) return true;
    if (m.includes('jovem') && s.includes('jovem')) return true;
    if (m.includes('homens') && s.includes('homens')) return true;
    if (m.includes('mulher') && s.includes('mulher')) return true;
    return false;
  },

  obterMembrosDoDepartamento: function(depNome) {
    const membrosGlobais = (typeof DB !== 'undefined' && DB.get) ? (DB.get('membros') || []) : [];
    return membrosGlobais.filter(m => this.corresponderDepartamento(m.departamento, depNome));
  },

  verificarMembroExiste: function(nome) {
    if (!nome) return false;
    const membrosGlobais = (typeof DB !== 'undefined' && DB.get) ? (DB.get('membros') || []) : [];
    return membrosGlobais.some(m => m.nome && m.nome.toLowerCase().trim() === nome.toLowerCase().trim());
  },

  render: function() {
    const container = document.getElementById('view-departamentos');
    if (!container) return;

    if (this.viewMode === 'dashboard') {
      container.innerHTML = this.renderDashboardHTML();
    } else if (this.viewMode === 'lista') {
      container.innerHTML = this.renderListaHTML();
    } else if (this.viewMode === 'perfil') {
      container.innerHTML = this.renderPerfilHTML();
    }
  },

  mudarVisao: function(modo, id = null) {
    this.viewMode = modo;
    if (id !== null) {
      this.activeDepartamentoId = id;
      this.filtroTexto = '';
    }
    this.render();
  },

  atualizarFiltro: function(valor) {
    this.filtroTexto = valor.toLowerCase();
    this.render();
  },

  // GESTÃO DE ATIVIDADES NO MÓDULO DE DEPARTAMENTOS
  abrirModalAtividade: function(idAtividade = null) {
    this.editandoAtividadeId = idAtividade;
    const modal = document.getElementById('modal-atividade-dep');
    if (!modal) return;
    modal.style.display = 'flex';

    if (idAtividade !== null) {
      document.getElementById('titulo-modal-atv').innerText = 'Editar Atividade do Departamento';
      const cultosGlobais = (typeof DB !== 'undefined' && DB.get) ? (DB.get('cultos') || []) : [];
      const atv = cultosGlobais.find(c => c.id == idAtividade);
      if (atv) {
        document.getElementById('atv-titulo').value = atv.titulo || '';
        document.getElementById('atv-categoria').value = atv.categoria || 'Culto Normal';
        document.getElementById('atv-data').value = atv.data || '';
        document.getElementById('atv-hora').value = atv.hora || '';
        document.getElementById('atv-local').value = atv.local || 'Templo Sede - Luanda/Sapú2';
        document.getElementById('atv-pregador').value = atv.pregador || '';
        document.getElementById('atv-dirigente').value = atv.dirigente || '';
        document.getElementById('atv-status').value = atv.status || 'Agendado';

        const secao = document.getElementById('secao-concluido-dep');
        if (atv.status === 'Concluído') {
          secao.style.display = 'block';
          document.getElementById('atv-ordem').value = atv.ordem || '';
          document.getElementById('atv-presenca-total').value = atv.presencaTotal || 0;
          document.getElementById('atv-presenca-homens').value = atv.presencaHomens || 0;
          document.getElementById('atv-presenca-mulheres').value = atv.presencaMulheres || 0;
          document.getElementById('atv-presenca-criancas').value = atv.presencaCriancas || 0;
        } else {
          secao.style.display = 'none';
        }
      }
    } else {
      document.getElementById('titulo-modal-atv').innerText = 'Nova Atividade do Departamento';
      document.getElementById('atv-titulo').value = '';
      document.getElementById('atv-data').value = '';
      document.getElementById('atv-hora').value = '';
      document.getElementById('atv-pregador').value = '';
      document.getElementById('atv-dirigente').value = '';
      document.getElementById('atv-status').value = 'Agendado';
      document.getElementById('secao-concluido-dep').style.display = 'none';
    }
  },

  handleStatusChangeDep: function() {
    const status = document.getElementById('atv-status').value;
    const secao = document.getElementById('secao-concluido-dep');
    if (!secao) return;
    if (status === 'Concluído') secao.style.display = 'block';
    else secao.style.display = 'none';
  },

  fecharModalAtividade: function() {
    this.editandoAtividadeId = null;
    const modal = document.getElementById('modal-atividade-dep');
    if (modal) modal.style.display = 'none';
  },

  salvarAtividadeDepartamento: function() {
    const d = this.departamentos.find(item => item.id === this.activeDepartamentoId);
    if (!d) return;

    const titulo = document.getElementById('atv-titulo').value.trim();
    const categoria = document.getElementById('atv-categoria').value;
    const data = document.getElementById('atv-data').value;
    const hora = document.getElementById('atv-hora').value;
    const local = document.getElementById('atv-local').value;
    const pregador = document.getElementById('atv-pregador').value.trim();
    const dirigente = document.getElementById('atv-dirigente').value.trim();
    const status = document.getElementById('atv-status').value;

    if (!titulo || !data) return alert('Preencha o título e a data da atividade.');

    let ordem = '';
    let presencaTotal = 0, presencaHomens = 0, presencaMulheres = 0, presencaCriancas = 0;

    if (status === 'Concluído') {
      ordem = document.getElementById('atv-ordem').value.trim();
      presencaTotal = parseInt(document.getElementById('atv-presenca-total').value) || 0;
      presencaHomens = parseInt(document.getElementById('atv-presenca-homens').value) || 0;
      presencaMulheres = parseInt(document.getElementById('atv-presenca-mulheres').value) || 0;
      presencaCriancas = parseInt(document.getElementById('atv-presenca-criancas').value) || 0;
    }

    const dadosAtividade = {
      titulo,
      categoria,
      data,
      hora,
      local,
      departamento: d.nome,
      pregador,
      dirigente,
      status,
      ordem,
      presencaTotal,
      presencaHomens,
      presencaMulheres,
      presencaCriancas
    };

    if (this.editandoAtividadeId !== null) {
      if (typeof DB !== 'undefined' && DB.update) {
        DB.update('cultos', this.editandoAtividadeId, dadosAtividade);
      }
    } else {
      if (typeof DB !== 'undefined' && DB.add) {
        DB.add('cultos', { id: Date.now().toString(), ...dadosAtividade });
      }
    }

    this.fecharModalAtividade();
    this.render();
  },

  visualizarAtividade: function(idAtividade) {
    if (typeof CultosModule !== 'undefined' && CultosModule.visualizar) {
      CultosModule.visualizar(idAtividade);
    }
  },

  imprimirAtividade: function(idAtividade) {
    if (typeof CultosModule !== 'undefined' && CultosModule.visualizar) {
      CultosModule.visualizar(idAtividade);
      setTimeout(() => { window.print(); }, 300);
    }
  },

  eliminarAtividade: function(idAtividade) {
    if (confirm('Tem certeza que deseja eliminar esta atividade/culto?')) {
      if (typeof DB !== 'undefined' && DB.remove) {
        DB.remove('cultos', idAtividade);
        this.render();
      }
    }
  },

  imprimirSecaoPerfil: function(tituloSecao) {
    const conteudoOriginal = document.body.innerHTML;
    const painelPerfil = document.getElementById('perfil-conteudo-imprimir').innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-transform: uppercase; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">Relatório - ${tituloSecao}</h2>
        ${painelPerfil}
      </div>
    `;
    window.print();
    document.body.innerHTML = conteudoOriginal;
    location.reload();
  },

  renderDashboardHTML: function() {
    const temPermissaoEdicao = typeof Auth !== 'undefined' && Auth.isAdminSecOrPastor();

    const linhasTabela = this.departamentos.map(d => {
      const membrosDep = this.obterMembrosDoDepartamento(d.nome);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; color: #1e293b; font-weight: 600; cursor: pointer;" onclick="DepartamentosModule.mudarVisao('perfil', ${d.id})">${d.nome}</td>
          <td style="padding: 12px; color: #64748b; cursor: pointer;" onclick="DepartamentosModule.mudarVisao('perfil', ${d.id})">${d.responsavel || '—'}</td>
          <td style="padding: 12px; color: #1e293b; font-weight: 700; cursor: pointer;" onclick="DepartamentosModule.mudarVisao('perfil', ${d.id})">${membrosDep.length}</td>
          <td style="padding: 12px; cursor: pointer;" onclick="DepartamentosModule.mudarVisao('perfil', ${d.id})"><span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${d.estado}</span></td>
          <td style="text-align: right; padding: 12px;">
            <div style="display:inline-flex; gap:6px; align-items:center;">
              <button onclick="DepartamentosModule.mudarVisao('perfil', ${d.id})" title="Ver Perfil" style="cursor:pointer; background:#f0f9ff; border:1px solid #bae6fd; color:#0284c7; padding:4px 8px; border-radius:4px; font-size:12px;">👁️</button>
              ${temPermissaoEdicao ? `
                <button onclick="DepartamentosModule.abrirModalNovo(${d.id})" title="Editar Departamento" style="cursor:pointer; background:#eff6ff; border:1px solid #bfdbfe; color:#2563eb; padding:4px 8px; border-radius:4px; font-size:12px;">✏️</button>
                <button onclick="DepartamentosModule.eliminarDepartamento(${d.id})" title="Eliminar Departamento" style="cursor:pointer; background:#fef2f2; border:1px solid #fecaca; color:#ef4444; padding:4px 8px; border-radius:4px; font-size:12px;">🗑️</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <div>
          <h1 style="font-size: 24px; margin: 0 0 5px 0; color: #1e293b;">Gestão de Departamentos</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Lista geral de departamentos da igreja.</p>
        </div>
        <div>
          <button onclick="DepartamentosModule.abrirModalNovo()" style="background: #2563eb; border: none; color: #fff; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600;">+ Novo Departamento</button>
        </div>
      </div>

      <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #1e293b; margin-bottom: 15px;">Departamentos Registados</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-size:11px; text-transform:uppercase;">
              <th style="padding: 10px;">Departamento</th>
              <th style="padding: 10px;">Diretor / Responsável</th>
              <th style="padding: 10px;">Membros Alocados</th>
              <th style="padding: 10px;">Estado</th>
              <th style="padding: 10px; text-align:right;">Ações</th>
            </tr>
          </thead>
          <tbody>${linhasTabela}</tbody>
        </table>
      </div>
      ${this.renderModalNovoHTML()}
    `;
  },

  renderPerfilHTML: function() {
    const d = this.departamentos.find(item => item.id === this.activeDepartamentoId);
    if (!d) return `<p style="padding:20px; color:#1e293b;">Departamento não encontrado.</p>`;

    const membrosAlocados = this.obterMembrosDoDepartamento(d.nome);
    let totalGeral = membrosAlocados.length;
    let batizados = 0, naoBatizados = 0, ativos = 0, passivos = 0;

    membrosAlocados.forEach(m => {
      const codigoStr = (m.codigo || '').toLowerCase();
      const batizadoStr = (m.batizado || '').toLowerCase();
      if (codigoStr.startsWith('mb') || batizadoStr.includes('sim') || batizadoStr.includes('batizado')) batizados++;
      else naoBatizados++;

      const estadoStr = (m.estado || 'Activo').toLowerCase();
      if (estadoStr.includes('passivo') || estadoStr.includes('inativo')) passivos++;
      else ativos++;
    });

    let conteudoAba = '';

    if (this.activeTabPerfil === 'resumo') {
      conteudoAba = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b;">TOTAL GERAL</span>
            <h2 style="font-size: 24px; margin: 5px 0 0 0; color: #2563eb;">${totalGeral}</h2>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b;">BATIZADOS</span>
            <h2 style="font-size: 24px; margin: 5px 0 0 0; color: #16a34a;">${batizados}</h2>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b;">NÃO BATIZADOS</span>
            <h2 style="font-size: 24px; margin: 5px 0 0 0; color: #d97706;">${naoBatizados}</h2>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b;">ATIVOS</span>
            <h2 style="font-size: 24px; margin: 5px 0 0 0; color: #0284c7;">${ativos}</h2>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b;">PASSIVOS</span>
            <h2 style="font-size: 24px; margin: 5px 0 0 0; color: #dc2626;">${passivos}</h2>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin:0; color: #1e293b;">Liderança do Departamento</h3>
              <button onclick="DepartamentosModule.abrirModalEditarLideranca()" style="background: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">✏️ Editar Liderança</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
              <div><strong>Diretor:</strong> ${d.responsavel || 'N/A'}</div>
              <div><strong>Secretário(a):</strong> ${d.secretario || 'N/A'}</div>
              <div><strong>Financeiro:</strong> ${d.financeiro || 'N/A'}</div>
              <div><strong>Outro Líder:</strong> ${d.outroLider || 'N/A'}</div>
            </div>
            <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;">
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">${d.descricao || 'Sem descrição.'}</p>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
            <h3 style="margin-top:0; color: #1e293b;">Orçamento Anual</h3>
            <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 5px 0;">${(d.orcamentoAnual || 0).toLocaleString()} Kz</p>
          </div>
        </div>
      `;
    } 
    else if (this.activeTabPerfil === 'membros') {
      const membrosFiltrados = membrosAlocados.filter(m => 
        (m.nome && m.nome.toLowerCase().includes(this.filtroTexto)) ||
        (m.atividadesExercidas && m.atividadesExercidas.toLowerCase().includes(this.filtroTexto))
      );

      const linhasMembros = membrosFiltrados.length > 0 ? membrosFiltrados.map(m => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; color: #1e293b; font-weight: 600;">${m.nome}</td>
          <td style="padding: 12px; color: #64748b;">${m.atividadesExercidas || m.cargo || 'Membro'}</td>
          <td style="padding: 12px; color: #64748b;">${m.telefone || m.contacto || '—'}</td>
          <td style="padding: 12px;"><span style="color: #16a34a; font-weight: 600; background: rgba(22, 163, 74, 0.1); padding: 3px 8px; border-radius: 12px; font-size: 11px;">${m.estado || 'Activo'}</span></td>
        </tr>
      `).join('') : `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #64748b;">Nenhum membro encontrado.</td></tr>`;

      conteudoAba = `
        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin:0; color: #1e293b;">Membros do Departamento (${membrosFiltrados.length})</h3>
            <div style="display:flex; gap:10px;">
              <input type="text" id="filtro-pesquisa-input" placeholder="🔍 Pesquisar membro..." value="${this.filtroTexto}" oninput="DepartamentosModule.atualizarFiltro(this.value)" style="padding: 7px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 220px;">
              <button onclick="DepartamentosModule.imprimirSecaoPerfil('Membros do ${d.nome}')" style="background:#0284c7; color:#fff; border:none; padding:7px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600;">🖨️ Imprimir</button>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 10px;">Nome Completo</th>
                <th style="padding: 10px;">Função / Cargo</th>
                <th style="padding: 10px;">Contacto</th>
                <th style="padding: 10px;">Estado</th>
              </tr>
            </thead>
            <tbody>${linhasMembros}</tbody>
          </table>
        </div>
      `;
    } 
    else if (this.activeTabPerfil === 'equipas') {
      const equipasFiltradas = (d.equipas || []).filter(eq => 
        (eq.nome && eq.nome.toLowerCase().includes(this.filtroTexto)) ||
        (eq.descricao && eq.descricao.toLowerCase().includes(this.filtroTexto))
      );

      const equipasCards = equipasFiltradas.map((eq, idx) => {
        const linhasMembrosTabela = (eq.membrosDetalhes || []).map((m, mIdx) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding:8px; text-align:center;">${mIdx + 1}</td>
            <td style="padding:8px; font-weight:600;">${m.nome} ${m.isLider ? '⭐ (Líder)' : ''}</td>
            <td style="padding:8px;">${d.nome}</td>
            <td style="padding:8px;">${m.funcao || 'Membro'}</td>
          </tr>
        `).join('') || `<tr><td colspan="4" style="padding:10px; text-align:center; color:#94a3b8;">Nenhum membro na equipa.</td></tr>`;

        return `
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <h4 style="margin: 0; color: #1e293b; font-size:16px;">${eq.nome}</h4>
              <button onclick="DepartamentosModule.abrirModalEditarEquipa(${idx})" style="background: #0284c7; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">✏️ Editar</button>
            </div>
            <p style="font-size: 13px; color: #64748b; margin: 0 0 12px 0;">${eq.descricao || ''}</p>
            <table style="width:100%; border-collapse:collapse; font-size:13px; background:#f8fafc; border-radius:6px; overflow:hidden;">
              <thead>
                <tr style="background:#e2e8f0; color:#334155; font-size:11px; text-transform:uppercase;">
                  <th style="padding:8px; text-align:center; width:40px;">Nº</th>
                  <th style="padding:8px; text-align:left;">Nome Completo</th>
                  <th style="padding:8px; text-align:left;">Departamento</th>
                  <th style="padding:8px; text-align:left;">Função</th>
                </tr>
              </thead>
              <tbody>${linhasMembrosTabela}</tbody>
            </table>
          </div>
        `;
      }).join('');

      conteudoAba = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0; color:#1e293b;">Equipas de Trabalho</h3>
            <div style="display:flex; gap:10px;">
              <input type="text" id="filtro-pesquisa-input" placeholder="🔍 Pesquisar equipa..." value="${this.filtroTexto}" oninput="DepartamentosModule.atualizarFiltro(this.value)" style="padding: 7px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 220px;">
              <button onclick="DepartamentosModule.imprimirSecaoPerfil('Equipas do ${d.nome}')" style="background:#0284c7; color:#fff; border:none; padding:7px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600;">🖨️ Imprimir</button>
              <button onclick="DepartamentosModule.abrirModalEditarEquipa(null)" style="background:#2563eb; color:#fff; border:none; padding:7px 14px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">+ Nova Equipa</button>
            </div>
          </div>
          <div>${equipasCards || '<p style="color:#64748b;">Nenhuma equipa encontrada.</p>'}</div>
        </div>
      `;
    } 
    else if (this.activeTabPerfil === 'atividades') {
      const cultosGlobais = (typeof DB !== 'undefined' && DB.get) ? (DB.get('cultos') || []) : [];
      const atividadesDoDep = cultosGlobais.filter(c => {
        const depCulto = c.departamento || 'Geral';
        return this.corresponderDepartamento(depCulto, d.nome) || depCulto.toLowerCase() === 'geral';
      });

      const atividadesFiltradas = atividadesDoDep.filter(at => {
        const termo = this.filtroTexto;
        const matchTermo = !termo || (at.titulo && at.titulo.toLowerCase().includes(termo)) || (at.pregador && at.pregador.toLowerCase().includes(termo)) || (at.categoria && at.categoria.toLowerCase().includes(termo));
        return matchTermo;
      });

      const linhasAtividades = atividadesFiltradas.length > 0 ? atividadesFiltradas.map(at => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding:12px 16px;"><div style="font-weight:600; color:#1e293b;">${at.data}</div><small style="color:#64748b;">${at.hora || '--:--'}</small></td>
          <td style="padding:12px 16px;"><div style="font-weight:600; color:#1e293b;">${at.titulo}</div><small style="color:#64748b;">${at.categoria || 'Culto/Evento'}</small></td>
          <td style="padding:12px 16px;"><div><strong>Pregador:</strong> ${at.pregador || 'N/A'}</div><small style="color:#64748b;">Dirigente: ${at.dirigente || 'N/A'}</small></td>
          <td style="padding:12px 16px;">${at.local || 'N/A'}</td>
          <td style="padding:12px 16px;"><span style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; ${typeof CultosModule !== 'undefined' ? CultosModule.getStatusBadge(at.status) : 'background:#e2e8f0; color:#334155;'}">${at.status || 'Agendado'}</span></td>
          <td style="text-align: right; padding:12px 16px;">
            <div style="display:inline-flex; gap:4px; align-items:center; justify-content:flex-end;">
              <button onclick="DepartamentosModule.visualizarAtividade('${at.id}')" title="Visualizar" style="cursor:pointer; background:#f0f9ff; border:1px solid #bae6fd; color:#0284c7; padding:4px 8px; border-radius:4px; font-size:12px;">👁️</button>
              <button onclick="DepartamentosModule.imprimirAtividade('${at.id}')" title="Imprimir" style="cursor:pointer; background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; padding:4px 8px; border-radius:4px; font-size:12px;">🖨️</button>
              <button onclick="DepartamentosModule.abrirModalAtividade('${at.id}')" title="Editar" style="cursor:pointer; background:#eff6ff; border:1px solid #bfdbfe; color:#2563eb; padding:4px 8px; border-radius:4px; font-size:12px;">✏️</button>
              <button onclick="DepartamentosModule.eliminarAtividade('${at.id}')" title="Eliminar" style="cursor:pointer; background:#fef2f2; border:1px solid #fecaca; color:#ef4444; padding:4px 8px; border-radius:4px; font-size:12px;">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('') : `<tr><td colspan="6" style="padding:20px; text-align:center; color:#64748b;">Nenhuma atividade registada para este departamento.</td></tr>`;

      conteudoAba = `
        <div>
          <!-- Painel de Filtros Avançados na Aba Atividades do Departamento -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:15px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span style="font-weight:700; font-size:13px; color:#1e293b;">🔍 Filtros Avançados de Atividades</span>
              <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px; font-weight:600;">${atividadesFiltradas.length} de ${atividadesDoDep.length} registos</span>
            </div>
            <div style="display:flex; gap:10px;">
              <input type="text" id="filtro-pesquisa-input" placeholder="🔍 Pesquisar atividade por título, pregador..." value="${this.filtroTexto}" oninput="DepartamentosModule.atualizarFiltro(this.value)" style="flex:1; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
              <button onclick="DepartamentosModule.imprimirSecaoPerfil('Atividades do ${d.nome}')" style="background:#0284c7; color:#fff; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600;">🖨️ Imprimir</button>
              <button onclick="DepartamentosModule.abrirModalAtividade(null)" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600; font-size:13px;">+ Nova Atividade</button>
            </div>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:11px; text-transform:uppercase;">
                  <th style="padding:12px 16px;">Data / Hora</th>
                  <th style="padding:12px 16px;">Título / Categoria</th>
                  <th style="padding:12px 16px;">Pregador / Dirigente</th>
                  <th style="padding:12px 16px;">Local</th>
                  <th style="padding:12px 16px;">Status</th>
                  <th style="padding:12px 16px; text-align:right;">Ações</th>
                </tr>
              </thead>
              <tbody>${linhasAtividades}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    return `
      <div>
        <button onclick="DepartamentosModule.mudarVisao('dashboard')" style="background: none; border: none; color: #2563eb; font-weight: 600; cursor: pointer; margin-bottom: 15px; padding: 0;">← Voltar ao Dashboard</button>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #1e293b;">🏢 ${d.nome}</h2>
          <p style="margin: 0; font-size: 14px; color: #64748b;">Diretor: <strong>${d.responsavel || '—'}</strong> | 👥 <strong>${membrosAlocados.length}</strong> membros alocados | 🟢 ${d.estado}</p>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto;">
          ${['resumo', 'membros', 'equipas', 'atividades'].map(tab => `
            <button onclick="DepartamentosModule.mudarTabPerfil('${tab}')" style="background: ${this.activeTabPerfil === tab ? '#2563eb' : '#fff'}; border: 1px solid #e2e8f0; color: ${this.activeTabPerfil === tab ? '#fff' : '#1e293b'}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; text-transform: capitalize;">${tab}</button>
          `).join('')}
        </div>
        
        <div id="perfil-conteudo-imprimir">${conteudoAba}</div>
        ${this.renderModaisExtra(d)}
      </div>
    `;
  },

  mudarTabPerfil: function(tab) {
    this.activeTabPerfil = tab;
    this.filtroTexto = '';
    this.render();
  },

  renderModaisExtra: function(d) {
    const membrosGlobais = (typeof DB !== 'undefined' && DB.get) ? (DB.get('membros') || []) : [];
    const optionsMembros = membrosGlobais.map(m => `<option value="${m.nome}">${m.nome}</option>`).join('');

    return `
      <!-- Modal Editar Liderança -->
      <div id="modal-lideranca" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center;">
        <div style="background:#fff; border-radius:12px; width:450px; padding:25px;">
          <h3 style="margin-top:0; color:#1e293b; font-size:18px;">Editar Liderança do Departamento</h3>
          <form onsubmit="event.preventDefault(); DepartamentosModule.salvarLideranca(${d.id});">
            <div style="margin-bottom:12px;">
              <label style="font-size:12px; color:#64748b;">Diretor / Responsável (Membro do Sistema)</label>
              <select id="edit-diretor" style="width:100%; padding:9px; border-radius:6px; border:1px solid #cbd5e1;" required>
                <option value="">Selecione o membro...</option>
                ${optionsMembros}
              </select>
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:12px; color:#64748b;">Secretário(a)</label>
              <select id="edit-secretario" style="width:100%; padding:9px; border-radius:6px; border:1px solid #cbd5e1;">
                <option value="">Nenhum / Selecione...</option>
                ${optionsMembros}
              </select>
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:12px; color:#64748b;">Financeiro</label>
              <select id="edit-financeiro" style="width:100%; padding:9px; border-radius:6px; border:1px solid #cbd5e1;">
                <option value="">Nenhum / Selecione...</option>
                ${optionsMembros}
              </select>
            </div>
            <div style="margin-bottom:18px;">
              <label style="font-size:12px; color:#64748b;">Outro Líder / Cargo</label>
              <select id="edit-outro" style="width:100%; padding:9px; border-radius:6px; border:1px solid #cbd5e1;">
                <option value="">Nenhum / Selecione...</option>
                ${optionsMembros}
              </select>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button type="button" onclick="document.getElementById('modal-lideranca').style.display='none'" style="background:#f1f5f9; padding:8px 16px; border-radius:6px; cursor:pointer;">Cancelar</button>
              <button type="submit" style="background:#2563eb; color:#fff; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Salvar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Gerir Equipa -->
      <div id="modal-equipa" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center;">
        <div style="background:#fff; border-radius:12px; width:500px; padding:25px;">
          <h3 style="margin-top:0; color:#1e293b; font-size:18px;" id="titulo-modal-equipa">Gerir Equipa</h3>
          <form onsubmit="event.preventDefault(); DepartamentosModule.salvarEquipa(${d.id});">
            <div style="margin-bottom:10px;"><label style="font-size:12px; color:#64748b;">Nome da Equipa</label><input type="text" id="equipa-nome-input" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;" required></div>
            <div style="margin-bottom:10px;"><label style="font-size:12px; color:#64748b;">Descrição</label><input type="text" id="equipa-desc-input" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;"></div>
            <div style="margin-bottom:10px;">
              <label style="font-size:12px; color:#64748b;">Adicionar Membro (Cadastrado no Sistema)</label>
              <div style="display:flex; gap:8px;">
                <select id="equipa-membro-select" style="flex:1; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
                  <option value="">Selecione um membro...</option>
                  ${optionsMembros}
                </select>
                <button type="button" onclick="DepartamentosModule.adicionarMembroEquipaTemp()" style="background:#0284c7; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600;">Adicionar</button>
              </div>
            </div>
            <div style="margin-bottom:15px;">
              <label style="font-size:12px; color:#64748b;">Membros Integrantes:</label>
              <div id="lista-membros-temp" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; max-height:140px; overflow-y:auto; font-size:13px;"></div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button type="button" onclick="document.getElementById('modal-equipa').style.display='none'" style="background:#f1f5f9; padding:8px 16px; border-radius:6px; cursor:pointer;">Cancelar</button>
              <button type="submit" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Guardar Equipa</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Criar / Editar Atividade do Departamento -->
      <div id="modal-atividade-dep" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); z-index:9999; align-items:center; justify-content:center; overflow-y:auto; padding:20px;">
        <div style="background:#fff; border-radius:12px; width:520px; padding:25px; max-height:90vh; overflow-y:auto;">
          <h3 id="titulo-modal-atv" style="margin-top:0; color:#1e293b; font-size:18px;">Atividade do Departamento</h3>
          <form onsubmit="event.preventDefault(); DepartamentosModule.salvarAtividadeDepartamento();">
            <div style="margin-bottom:10px;"><label style="font-size:12px; color:#64748b;">Título da Atividade</label><input type="text" id="atv-titulo" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;" required></div>
            <div style="margin-bottom:10px;">
              <label style="font-size:12px; color:#64748b;">Categoria</label>
              <select id="atv-categoria" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
                <option value="Culto Normal">Culto Normal</option>
                <option value="Culto de Ensino / Doutrina">Culto de Ensino / Doutrina</option>
                <option value="Culto de Oração">Culto de Oração</option>
                <option value="Conferência / Festividade">Conferência / Festividade</option>
                <option value="Reunião">Reunião</option>
              </select>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div><label style="font-size:12px; color:#64748b;">Data</label><input type="date" id="atv-data" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;" required></div>
              <div><label style="font-size:12px; color:#64748b;">Hora</label><input type="time" id="atv-hora" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;" required></div>
            </div>
            <div style="margin-bottom:10px;"><label style="font-size:12px; color:#64748b;">Local</label><input type="text" id="atv-local" value="Templo Sede - Luanda/Sapú2" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;"></div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div><label style="font-size:12px; color:#64748b;">Pregador / Ministro</label><input type="text" id="atv-pregador" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;"></div>
              <div><label style="font-size:12px; color:#64748b;">Dirigente</label><input type="text" id="atv-dirigente" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;"></div>
            </div>
            <div style="margin-bottom:15px;">
              <label style="font-size:12px; color:#64748b;">Status</label>
              <select id="atv-status" onchange="DepartamentosModule.handleStatusChangeDep()" style="width:100%; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
                <option value="Agendado">Agendado</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <!-- Secção Concluído em Departamento -->
            <div id="secao-concluido-dep" style="display:none; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-bottom:15px;">
              <h4 style="margin:0 0 10px 0; font-size:13px; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">📋 Ordem do Culto & Estatística de Presença</h4>
              <div style="margin-bottom:10px;">
                <label style="display:block; font-size:11px; font-weight:bold; color:#475569; margin-bottom:3px;">ORDEM DO CULTO / PROGRAMAÇÃO LITÚRGICA</label>
                <textarea id="atv-ordem" rows="3" placeholder="1. Louvor&#10;2. Oração&#10;3. Mensagem" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;"></textarea>
              </div>
              <div>
                <label style="display:block; font-size:11px; font-weight:bold; color:#475569; margin-bottom:3px;">ESTATÍSTICA DE PRESENÇA</label>
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px;">
                  <div>
                    <label style="font-size:9px; color:#64748b;">Total</label>
                    <input type="number" id="atv-presenca-total" value="0" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px; font-size:11px;">
                  </div>
                  <div>
                    <label style="font-size:9px; color:#64748b;">Homens</label>
                    <input type="number" id="atv-presenca-homens" value="0" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px; font-size:11px;">
                  </div>
                  <div>
                    <label style="font-size:9px; color:#64748b;">Mulheres</label>
                    <input type="number" id="atv-presenca-mulheres" value="0" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px; font-size:11px;">
                  </div>
                  <div>
                    <label style="font-size:9px; color:#64748b;">Crianças</label>
                    <input type="number" id="atv-presenca-criancas" value="0" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px; font-size:11px;">
                  </div>
                </div>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button type="button" onclick="DepartamentosModule.fecharModalAtividade()" style="background:#f1f5f9; padding:8px 16px; border-radius:6px; cursor:pointer;">Cancelar</button>
              <button type="submit" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Salvar Atividade</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  abrirModalEditarLideranca: function() {
    const d = this.departamentos.find(item => item.id === this.activeDepartamentoId);
    if (!d) return;
    document.getElementById('modal-lideranca').style.display = 'flex';
    if (document.getElementById('edit-diretor')) document.getElementById('edit-diretor').value = d.responsavel || '';
    if (document.getElementById('edit-secretario')) document.getElementById('edit-secretario').value = d.secretario || '';
    if (document.getElementById('edit-financeiro')) document.getElementById('edit-financeiro').value = d.financeiro || '';
    if (document.getElementById('edit-outro')) document.getElementById('edit-outro').value = d.outroLider || '';
  },

  salvarLideranca: function(depId) {
    const d = this.departamentos.find(item => item.id === depId);
    if (!d) return;

    const diretor = document.getElementById('edit-diretor').value;
    if (diretor && !this.verificarMembroExiste(diretor)) {
      alert(`⚠️ Erro de Validação:\nO membro "${diretor}" não está cadastrado no sistema.`);
      return;
    }

    d.responsavel = diretor;
    d.secretario = document.getElementById('edit-secretario').value;
    d.financeiro = document.getElementById('edit-financeiro').value;
    d.outroLider = document.getElementById('edit-outro').value;
    
    this.salvarDados();
    document.getElementById('modal-lideranca').style.display = 'none';
    this.render();
  },

  abrirModalEditarEquipa: function(equipaIndex) {
    const d = this.departamentos.find(item => item.id === this.activeDepartamentoId);
    if (!d) return;
    this.editandoEquipaIndex = equipaIndex;
    document.getElementById('modal-equipa').style.display = 'flex';

    if (equipaIndex !== null && d.equipas && d.equipas[equipaIndex]) {
      const eq = d.equipas[equipaIndex];
      document.getElementById('titulo-modal-equipa').innerText = 'Editar Equipa';
      document.getElementById('equipa-nome-input').value = eq.nome || '';
      document.getElementById('equipa-desc-input').value = eq.descricao || '';
      this.membrosTempEquipa = JSON.parse(JSON.stringify(eq.membrosDetalhes || []));
    } else {
      document.getElementById('titulo-modal-equipa').innerText = 'Nova Equipa';
      document.getElementById('equipa-nome-input').value = '';
      document.getElementById('equipa-desc-input').value = '';
      this.membrosTempEquipa = [];
    }
    this.renderMembrosTempHTML();
  },

  adicionarMembroEquipaTemp: function() {
    const select = document.getElementById('equipa-membro-select');
    const nomeMembro = select.value;
    if (!nomeMembro) return;

    if (!this.verificarMembroExiste(nomeMembro)) {
      alert(`O membro "${nomeMembro}" não consta no cadastro do sistema.`);
      return;
    }

    if (this.membrosTempEquipa.some(m => m.nome === nomeMembro)) {
      alert('Este membro já está adicionado nesta equipa.');
      return;
    }

    this.membrosTempEquipa.push({ nome: nomeMembro, funcao: 'Membro', isLider: false });
    select.value = '';
    this.renderMembrosTempHTML();
  },

  removerMembroEquipaTemp: function(index) {
    this.membrosTempEquipa.splice(index, 1);
    this.renderMembrosTempHTML();
  },

  marcarLiderTemp: function(index) {
    this.membrosTempEquipa.forEach((m, idx) => {
      m.isLider = (idx === index);
      if (m.isLider) m.funcao = 'Líder da Equipa';
    });
    this.renderMembrosTempHTML();
  },

  renderMembrosTempHTML: function() {
    const container = document.getElementById('lista-membros-temp');
    if (!container) return;
    if (this.membrosTempEquipa.length === 0) {
      container.innerHTML = '<span style="color:#94a3b8;">Nenhum membro adicionado.</span>';
      return;
    }
    container.innerHTML = this.membrosTempEquipa.map((m, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding:4px 0; border-bottom:1px solid #f1f5f9;">
        <span><strong>${m.nome}</strong> ${m.isLider ? '⭐ [Líder]' : ''}</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <button type="button" onclick="DepartamentosModule.marcarLiderTemp(${idx})" style="background:${m.isLider ? '#16a34a' : '#cbd5e1'}; color:#fff; border:none; padding:3px 8px; border-radius:4px; font-size:11px; cursor:pointer;">${m.isLider ? 'Líder' : 'Tornar Líder'}</button>
          <button type="button" onclick="DepartamentosModule.removerMembroEquipaTemp(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold;">✕</button>
        </div>
      </div>
    `).join('');
  },

  salvarEquipa: function(depId) {
    const d = this.departamentos.find(item => item.id === depId);
    if (!d) return;
    const nome = document.getElementById('equipa-nome-input').value.trim();
    const descricao = document.getElementById('equipa-desc-input').value.trim();
    if (!nome) return alert('Insira o nome da equipa.');

    if (!d.equipas) d.equipas = [];

    const novaEquipa = {
      nome,
      descricao,
      membrosDetalhes: [...this.membrosTempEquipa]
    };

    if (this.editandoEquipaIndex !== null && d.equipas[this.editandoEquipaIndex]) {
      d.equipas[this.editandoEquipaIndex] = novaEquipa;
    } else {
      d.equipas.push(novaEquipa);
    }

    this.salvarDados();
    document.getElementById('modal-equipa').style.display = 'none';
    this.render();
  },

  renderModalNovoHTML: function() {
    const membrosGlobais = (typeof DB !== 'undefined' && DB.get) ? (DB.get('membros') || []) : [];
    const optionsMembros = membrosGlobais.map(m => `<option value="${m.nome}">${m.nome}</option>`).join('');

    return `
      <div id="modal-novo-dep" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
        <div style="background: #fff; border-radius: 12px; width: 450px; padding: 25px;">
          <h3 id="titulo-modal-dep" style="margin-top: 0; color: #1e293b;">Novo Departamento</h3>
          <form onsubmit="event.preventDefault(); DepartamentosModule.guardarNovo();">
            <div style="margin-bottom: 12px;"><label style="font-size:12px; color:#64748b;">Nome</label><input type="text" id="novo-nome" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1;" required></div>
            <div style="margin-bottom: 12px;">
              <label style="font-size:12px; color:#64748b;">Diretor / Responsável (Membro do Sistema)</label>
              <select id="novo-responsavel" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1;" required>
                <option value="">Selecione o membro...</option>
                ${optionsMembros}
              </select>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
              <button type="button" onclick="DepartamentosModule.fecharModalNovo()" style="background:#f1f5f9; padding:8px 16px; border-radius:6px; cursor:pointer;">Cancelar</button>
              <button type="submit" style="background:#2563eb; color:#fff; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  abrirModalNovo: function(id = null) {
    this.editandoDepartamentoId = id;
    const modal = document.getElementById('modal-novo-dep');
    if (!modal) return;
    modal.style.display = 'flex';

    if (id !== null) {
      document.getElementById('titulo-modal-dep').innerText = 'Editar Departamento';
      const d = this.departamentos.find(item => item.id === id);
      if (d) {
        document.getElementById('novo-nome').value = d.nome || '';
        document.getElementById('novo-responsavel').value = d.responsavel || '';
      }
    } else {
      document.getElementById('titulo-modal-dep').innerText = 'Novo Departamento';
      document.getElementById('novo-nome').value = '';
      document.getElementById('novo-responsavel').value = '';
    }
  },

  fecharModalNovo: function() { 
    this.editandoDepartamentoId = null;
    document.getElementById('modal-novo-dep').style.display = 'none'; 
  },

  guardarNovo: function() {
    const nome = document.getElementById('novo-nome').value.trim();
    const responsavel = document.getElementById('novo-responsavel').value;

    if (!nome) return;
    if (responsavel && !this.verificarMembroExiste(responsavel)) {
      alert(`⚠️ O membro "${responsavel}" não está cadastrado no módulo de Membros.`);
      return;
    }

    if (this.editandoDepartamentoId !== null) {
      const d = this.departamentos.find(item => item.id === this.editandoDepartamentoId);
      if (d) {
        d.nome = nome;
        d.responsavel = responsavel;
      }
    } else {
      const novoId = this.departamentos.length > 0 ? Math.max(...this.departamentos.map(d => d.id)) + 1 : 1;
      this.departamentos.push({ id: novoId, nome, responsavel, estado: 'Ativo', equipas: [], atividades: [] });
    }

    this.salvarDados();
    this.fecharModalNovo();
    this.render();
  },

  eliminarDepartamento: function(id) {
    if (confirm('Tem certeza que deseja eliminar este departamento?')) {
      this.departamentos = this.departamentos.filter(d => d.id !== id);
      this.salvarDados();
      this.render();
    }
  }
};

if (window.AppRouter && typeof window.AppRouter.register === 'function') {
  window.AppRouter.register('departamentos', DepartamentosModule);
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof DepartamentosModule !== 'undefined' && DepartamentosModule.init) {
    DepartamentosModule.init();
  }
});