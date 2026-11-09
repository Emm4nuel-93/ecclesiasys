const MembrosModule = {
  streamCam: null,

  init() {
    this.render();
  },

  gerarCodigoAutomatico(isBatizado) {
    const membros = DB.get('membros') || [];
    const prefixo = isBatizado ? 'Mb_' : 'Mc_';
    
    const codigosExistentes = membros
      .map(m => m.codigo)
      .filter(c => c && c.startsWith(prefixo))
      .map(c => parseInt(c.replace(prefixo, ''), 10))
      .filter(n => !isNaN(n));

    const proximoNumero = codigosExistentes.length > 0 ? Math.max(...codigosExistentes) + 1 : 1;
    return `${prefixo}${String(proximoNumero).padStart(3, '0')}`;
  },

  calcularIdade(dataNasc) {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade < 0 ? 0 : idade;
  },

  definirDepartamento(dataNasc, genero) {
    const idade = this.calcularIdade(dataNasc);
    
    if (idade <= 11) return 'Departamento de Crianças';
    if (idade >= 12 && idade <= 17) return 'Departamento de Adolescentes';
    if (idade >= 18 && idade <= 39) return 'Departamento da Juventude';
    
    if (idade >= 40) {
      return genero === 'Feminino' ? 'Departamento das Mulheres' : 'Departamento dos Papás';
    }

    return 'Geral';
  },

  render() {
    const container = document.getElementById('view-membros');
    if (!container) return;

    const membros = DB.get('membros') || [];

    const totalMembros = membros.length;
    const totalBatizados = membros.filter(m => m.isBatizado).length;
    const totalNaoBatizados = totalMembros - totalBatizados;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h2 style="font-size:22px; font-weight:800; color:var(--text-main);">👥 Gestão de Membros</h2>
          <p style="color:var(--text-muted); font-size:13px;">Registo, ficha espiritual, disciplinas, transferências e histórico evolutivo.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button onclick="MembrosModule.imprimirListaMembros()" class="btn-primary" style="background:#0284c7; width:auto; padding:10px 16px; display:flex; align-items:center; gap:6px;">🖨️ Imprimir Lista</button>
          <button onclick="MembrosModule.openModal()" class="btn-primary" style="width:auto; padding:10px 18px; display:flex; align-items:center; gap:6px;">➕ Cadastrar Novo Membro</button>
        </div>
      </div>

      <!-- CARDS DE MÉTRICAS PROFISSIONAIS COM ÍCONES À DIREITA (AMARELO) -->
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:24px;">
        <div style="background:var(--bg-surface); padding:20px; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:space-between; transition:all 0.2s ease;">
          <div>
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">TOTAL DE MEMBROS</span>
            <h3 style="font-size:28px; font-weight:800; color:var(--primary); margin:6px 0 0 0;">${totalMembros}</h3>
          </div>
          <div style="width:48px; height:48px; border-radius:12px; background:rgba(37,99,235,0.12); display:flex; align-items:center; justify-content:center; font-size:22px; color:#2563eb; flex-shrink:0;">👥</div>
        </div>

        <div style="background:var(--bg-surface); padding:20px; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:space-between; transition:all 0.2s ease;">
          <div>
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">BATIZADOS (MB)</span>
            <h3 style="font-size:28px; font-weight:800; color:#16a34a; margin:6px 0 0 0;">${totalBatizados}</h3>
          </div>
          <div style="width:48px; height:48px; border-radius:12px; background:rgba(22,163,74,0.12); display:flex; align-items:center; justify-content:center; font-size:22px; color:#16a34a; flex-shrink:0;">💧</div>
        </div>

        <div style="background:var(--bg-surface); padding:20px; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:space-between; transition:all 0.2s ease;">
          <div>
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">NÃO BATIZADOS (MC)</span>
            <h3 style="font-size:28px; font-weight:800; color:#ea580c; margin:6px 0 0 0;">${totalNaoBatizados}</h3>
          </div>
          <div style="width:48px; height:48px; border-radius:12px; background:rgba(234,88,12,0.12); display:flex; align-items:center; justify-content:center; font-size:22px; color:#ea580c; flex-shrink:0;">📋</div>
        </div>
      </div>

      <!-- PAINEL DE FILTROS & PESQUISA -->
      <div style="background:var(--bg-surface); padding:16px; border-radius:var(--radius); border:1px solid var(--border-color); margin-bottom:20px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--text-main); margin:0;">Filtros & Pesquisa</h4>
          <span id="mb-filtro-contador" style="font-size:12px; font-weight:600; color:var(--primary); background:var(--bg-light); padding:4px 10px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            Exibindo: ${membros.length} de ${membros.length} membros
          </span>
        </div>
        <div style="display:grid; grid-template-columns: 2fr 1.2fr 1fr 1fr 1fr; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Pesquisar por nome, BI ou telefone</label>
            <input type="text" id="mb-filter-search" oninput="MembrosModule.aplicarFiltros()" placeholder="Digite para buscar..." style="width:100%; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); font-size:13px;">
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Departamento</label>
            <select id="mb-filter-dept" onchange="MembrosModule.aplicarFiltros()" style="width:100%; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); font-size:13px;">
              <option value="">Todos os Departamentos</option>
              <option value="Departamento de Crianças">Departamento de Crianças</option>
              <option value="Departamento de Adolescentes">Departamento de Adolescentes</option>
              <option value="Departamento da Juventude">Departamento da Juventude</option>
              <option value="Departamento dos Papás">Departamento dos Papás</option>
              <option value="Departamento das Mulheres">Departamento das Mulheres</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Género</label>
            <select id="mb-filter-genero" onchange="MembrosModule.aplicarFiltros()" style="width:100%; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); font-size:13px;">
              <option value="">Todos os Géneros</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Status Batismo</label>
            <select id="mb-filter-batismo" onchange="MembrosModule.aplicarFiltros()" style="width:100%; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); font-size:13px;">
              <option value="">Todos</option>
              <option value="sim">Batizado (MB)</option>
              <option value="nao">Não Batizado (MC)</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Estado</label>
            <select id="mb-filter-estado" onchange="MembrosModule.aplicarFiltros()" style="width:100%; padding:8px 12px; border:1px solid var(--border-color); border-radius:var(--radius-sm); font-size:13px;">
              <option value="">Todos os Estados</option>
              <option value="Activo">Activo</option>
              <option value="Passivo">Passivo</option>
              <option value="Transferido">Transferido</option>
              <option value="Sob Disciplina">Sob Disciplina</option>
              <option value="Falecido">Falecido</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TABELA DE MEMBROS -->
      <div style="background:var(--bg-surface); border-radius:var(--radius); border:1px solid var(--border-color); overflow:hidden; box-shadow:var(--shadow-sm);">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid var(--border-color); text-align:left; font-size:11px; color:var(--text-muted); text-transform:uppercase;">
              <th style="padding:12px;">FOTO</th>
              <th style="padding:12px;">CÓDIGO</th>
              <th style="padding:12px;">NOME COMPLETO</th>
              <th style="padding:12px;">TELEFONE</th>
              <th style="padding:12px;">DEPARTAMENTO</th>
              <th style="padding:12px;">ESTADO</th>
              <th style="padding:12px; text-align:right;">AÇÕES</th>
            </tr>
          </thead>
          <tbody id="tb-membros-body">
            ${this.renderTabelaLinhas(membros)}
          </tbody>
        </table>
      </div>
    `;
  },

  renderAvatar(membro) {
    if (membro && membro.foto) {
      return `<img src="${membro.foto}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    const isFeminino = membro && membro.genero === 'Feminino';
    const bgGradient = isFeminino 
      ? 'linear-gradient(135deg, #ec4899, #db2777)' 
      : 'linear-gradient(135deg, #2563eb, #1d4ed8)';
    
    const svgIcon = isFeminino 
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M12 15v7"/><path d="M9 19h6"/></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M19 5l-5.4 5.4"/><path d="M19 5h-5"/><path d="M19 5v5"/></svg>`;

    return `<div style="width:100%; height:100%; background:${bgGradient}; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 6px rgba(0,0,0,0.2);">${svgIcon}</div>`;
  },

  renderTabelaLinhas(lista) {
    if (lista.length === 0) {
      return `<tr><td colspan="7" style="padding:30px; text-align:center; color:var(--text-muted);">Nenhum membro encontrado.</td></tr>`;
    }

    return lista.map(m => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding:10px 12px;">
          <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; border:2px solid #e2e8f0; display:flex; align-items:center; justify-content:center;">
            ${this.renderAvatar(m)}
          </div>
        </td>
        <td style="padding:10px 12px; font-weight:700; color:var(--primary);">${m.codigo}</td>
        <td style="padding:10px 12px;">
          <div style="font-weight:600; color:var(--text-main);">${m.nome}</div>
          <small style="color:var(--text-muted); font-size:11px;">${m.bi || 'Sem BI'}</small>
        </td>
        <td style="padding:10px 12px;">${m.fone || '---'}</td>
        <td style="padding:10px 12px;"><span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600;">${m.departamento}</span></td>
        <td style="padding:10px 12px;">
          <span style="padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; ${this.getBadgeStyle(m.estado)}">
            ${m.estado || 'Activo'}
          </span>
        </td>
        <td style="text-align: right;">
          <div class="action-buttons">
            <button class="btn-action view" title="Visualizar Ficha" onclick="MembrosModule.verFichaIndividual('${m.id}')">👁️</button>
            <button class="btn-action print" title="Imprimir Ficha" onclick="MembrosModule.imprimirFichaIndividual('${m.id}')">🖨️</button>
            ${m.estado === 'Transferido' ? `<button class="btn-action print" title="Imprimir Carta de Transferência" onclick="MembrosModule.imprimirDocumentoOficial('${m.id}', 'transferencia')" style="background:#0284c7; color:#fff;">📄</button>` : ''}
            <button class="btn-action edit" title="Editar" onclick="MembrosModule.openModal('${m.id}')">✏️</button>
            <button class="btn-action delete" title="Eliminar" onclick="MembrosModule.delete('${m.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  getBadgeStyle(estado) {
    switch (estado) {
      case 'Activo': return 'background:#dcfce7; color:#15803d;';
      case 'Passivo': return 'background:#fef3c7; color:#b45309;';
      case 'Falecido': return 'background:#fee2e2; color:#b91c1c;';
      case 'Sob Disciplina': return 'background:#ffedd5; color:#c2410c;';
      case 'Transferido': return 'background:#e0f2fe; color:#0369a1;';
      default: return 'background:#f1f5f9; color:#475569;';
    }
  },

  aplicarFiltros() {
    const search = document.getElementById('mb-filter-search')?.value.toLowerCase().trim();
    const dept = document.getElementById('mb-filter-dept')?.value;
    const genero = document.getElementById('mb-filter-genero')?.value;
    const batismo = document.getElementById('mb-filter-batismo')?.value;
    const estado = document.getElementById('mb-filter-estado')?.value;

    let membros = DB.get('membros') || [];
    const totalGeral = membros.length;

    membros = membros.filter(m => {
      const matchSearch = !search || m.nome.toLowerCase().includes(search) || (m.bi && m.bi.toLowerCase().includes(search)) || (m.fone && m.fone.includes(search));
      const matchDept = !dept || m.departamento === dept;
      const matchGenero = !genero || m.genero === genero;
      const matchBatismo = !batismo || (batismo === 'sim' ? m.isBatizado : !m.isBatizado);
      const matchEstado = !estado || m.estado === estado;

      return matchSearch && matchDept && matchGenero && matchBatismo && matchEstado;
    });

    document.getElementById('tb-membros-body').innerHTML = this.renderTabelaLinhas(membros);
    
    const contadorEl = document.getElementById('mb-filtro-contador');
    if (contadorEl) {
      contadorEl.innerText = `Exibindo: ${membros.length} de ${totalGeral} membros`;
    }
  },

  verFichaIndividual(id) {
    const membros = DB.get('membros') || [];
    const m = membros.find(x => x.id === id || x.id === parseInt(id, 10));
    if (!m) return;

    const ministros = DB.get('ministerio') || [];
    const ministro = ministros.find(min => 
      (min.membroId && String(min.membroId) === String(m.id)) || 
      (min.nome && min.nome.toLowerCase().trim() === m.nome.toLowerCase().trim())
    );

    let funcoesTexto = m.atividadesExercidas || 'Nenhuma registrada';
    if (ministro) {
      const cargo = ministro.cargo || ministro.grau || 'Ministro';
      const dataCons = ministro.consagracao || ministro.dataConsagracao;
      funcoesTexto = `${cargo} ${dataCons ? `(Consagrado em: ${dataCons})` : ''}`;
      if (ministro.atribuicoes) {
        funcoesTexto += `<br><small style="color: #94a3b8;">Pelouros: ${ministro.atribuicoes}</small>`;
      }
    }

    let secEstadoHistorico = '';
    if (m.estado === 'Sob Disciplina') {
      secEstadoHistorico = `
        <div style="margin-top:12px; background:#431407; padding:10px; border-radius:6px; border:1px solid #9a3412;">
          <strong style="color:#fdba74; font-size:11px; display:block;">⚠️ DETALHES DA SANÇÃO DISCIPLINAR:</strong>
          <p style="margin:2px 0; font-size:11px; color:#ffedd5;"><strong>Data de Entrada:</strong> ${m.dataDisciplina || '—'}</p>
          <p style="margin:2px 0; font-size:11px; color:#ffedd5;"><strong>Previsão/Retorno:</strong> ${m.retornoDisciplina || '—'}</p>
          <p style="margin:2px 0; font-size:11px; color:#ffedd5;"><strong>Causa:</strong> ${m.causaDisciplina || '—'}</p>
          <button onclick="MembrosModule.imprimirDocumentoOficial('${m.id}', 'disciplina')" style="margin-top:8px; padding:6px 12px; background:#c2410c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">🖨️ Imprimir Notificação de Disciplina</button>
        </div>`;
    } else if (m.estado === 'Transferido') {
      secEstadoHistorico = `
        <div style="margin-top:12px; background:#0c4a6e; padding:10px; border-radius:6px; border:1px solid #0284c7;">
          <strong style="color:#7dd3fc; font-size:11px; display:block;">📄 HISTÓRICO DE TRANSFERÊNCIA:</strong>
          <p style="margin:2px 0; font-size:11px; color:#e0f2fe;"><strong>Igreja de Destino:</strong> ${m.igrejaDestino || '—'}</p>
          <p style="margin:2px 0; font-size:11px; color:#e0f2fe;"><strong>Data da Transferência:</strong> ${m.dataTransferencia || '—'}</p>
          <button onclick="MembrosModule.imprimirDocumentoOficial('${m.id}', 'transferencia')" style="margin-top:8px; padding:6px 12px; background:#0284c7; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold;">🖨️ Imprimir Carta de Transferência</button>
        </div>`;
    } else if (m.estado === 'Falecido') {
      secEstadoHistorico = `
        <div style="margin-top:12px; background:#451a1a; padding:10px; border-radius:6px; border:1px solid #7f1d1d;">
          <strong style="color:#fca5a5; font-size:11px; display:block;">🕊️ REGISTO DE FALECIMENTO:</strong>
          <p style="margin:2px 0; font-size:11px; color:#fee2e2;"><strong>Data do Óbito:</strong> ${m.dataMorte || '—'}</p>
          <p style="margin:2px 0; font-size:11px; color:#fee2e2;"><strong>Causa:</strong> ${m.causaMorte || '—'}</p>
          <p style="margin:2px 0; font-size:11px; color:#fee2e2;"><strong>Cemitério:</strong> ${m.cemiterio || '—'}</p>
        </div>`;
    } else if (m.estado === 'Passivo') {
      secEstadoHistorico = `
        <div style="margin-top:12px; background:#713f12; padding:10px; border-radius:6px; border:1px solid #ca8a04;">
          <strong style="color:#fef08a; font-size:11px; display:block;">🚗 ATENÇÃO PASTORAL:</strong>
          <p style="margin:2px 0; font-size:11px; color:#fef3c7;">Membro com acompanhamento recomendado pelo departamento pastoral.</p>
        </div>`;
    }

    let btnBatismoPrint = '';
    if (m.isBatizado) {
      btnBatismoPrint = `<button onclick="MembrosModule.imprimirDocumentoOficial('${m.id}', 'batismo')" style="margin-top:8px; padding:6px 12px; background:#16a34a; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold; display:block;">📜 Imprimir Certificado de Batismo</button>`;
    }

    let timelineHtml = '';
    if (m.historico && m.historico.length > 0) {
      const itensTimeline = m.historico.map(h => `
        <div style="background:#1e293b; padding:8px 12px; border-radius:6px; border-left:3px solid #0284c7; font-size:12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="display:flex; justify-content:space-between; color:#94a3b8; font-size:10px; margin-bottom:2px;">
              <span><strong>${h.tipo}</strong></span>
              <span style="margin-left: 10px;">${h.data}</span>
            </div>
            <div style="color:#e2e8f0;">${h.descricao}</div>
          </div>
        </div>
      `).join('');

      timelineHtml = `
        <div style="margin-top:16px; background:#0f172a; padding:14px; border-radius:8px; border:1px solid #334155; grid-column: span 2;">
          <h4 style="color:#38bdf8; font-size:12px; margin:0 0 10px 0; border-bottom:1px solid #334155; padding-bottom:4px;">⏱️ LINHA DO TEMPO / HISTÓRICO DE ALTERAÇÕES</h4>
          <div style="max-height:160px; overflow-y:auto; padding-right:4px;">
            ${itensTimeline}
          </div>
        </div>
      `;
    }

    let modal = document.getElementById('modal-ficha-individual');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-ficha-individual';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:#1e293b; color:#fff; padding:25px; border-radius:16px; width:700px; max-height:90vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:20px;">
          <h3 style="font-size:18px; font-weight:700; color:#fff;">📋 Ficha do Membro - ${m.codigo}</h3>
          <button onclick="document.getElementById('modal-ficha-individual').style.display='none'" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
        </div>

        <div style="display:flex; gap:20px; align-items:center; background:#0f172a; padding:16px; border-radius:12px; margin-bottom:20px; border:1px solid #334155;">
          <div style="width:90px; height:90px; border-radius:50%; overflow:hidden; border:3px solid #0284c7; flex-shrink:0;">
            ${this.renderAvatar(m)}
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:800; color:#f8fafc; margin:0 0 4px 0;">${m.nome}</h2>
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <span style="background:#0284c7; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">${m.codigo}</span>
              <span style="background:#334155; color:#cbd5e1; padding:2px 8px; border-radius:4px; font-size:11px;">${m.departamento}</span>
              <span style="padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700; ${this.getBadgeStyle(m.estado)}">${m.estado || 'Activo'}</span>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; font-size:13px; line-height:1.6; margin-bottom:10px;">
          <div style="background:#0f172a; padding:14px; border-radius:8px; border:1px solid #334155;">
            <h4 style="color:#38bdf8; font-size:12px; margin:0 0 8px 0; border-bottom:1px solid #334155; padding-bottom:4px;">👤 DADOS PESSOAIS</h4>
            <p style="margin:2px 0;"><strong>BI/Doc:</strong> ${m.bi || 'Não informado'}</p>
            <p style="margin:2px 0;"><strong>Gênero:</strong> ${m.genero || '—'}</p>
            <p style="margin:2px 0;"><strong>Data Nasc:</strong> ${m.dataNasc || '—'}</p>
            <p style="margin:2px 0;"><strong>Estado Civil:</strong> ${m.estadoCivil || '—'}</p>
            <p style="margin:2px 0;"><strong>Telefone:</strong> ${m.fone || '—'}</p>
            <p style="margin:2px 0;"><strong>Morada/Bairro:</strong> ${m.bairro || '—'}</p>
            <p style="margin:2px 0;"><strong>Pai:</strong> ${m.nomePai || '—'}</p>
            <p style="margin:2px 0;"><strong>Mãe:</strong> ${m.nomeMae || '—'}</p>
          </div>

          <div style="background:#0f172a; padding:14px; border-radius:8px; border:1px solid #334155;">
            <h4 style="color:#38bdf8; font-size:12px; margin:0 0 8px 0; border-bottom:1px solid #334155; padding-bottom:4px;">✝ DADOS ESPIRITUAIS</h4>
            <p style="margin:2px 0;"><strong>Ano de Conversão:</strong> ${m.anoConversao || '—'}</p>
            <p style="margin:2px 0;"><strong>Batizado nas Águas:</strong> ${m.isBatizado ? 'Sim' : 'Não'}</p>
            ${m.isBatizado ? `<p style="margin:2px 0;"><strong>Data Batismo:</strong> ${m.dataBatismo || '—'}</p>` : ''}
            ${m.isBatizado ? `<p style="margin:2px 0;"><strong>Ministro Oficiante:</strong> ${m.ministroBatismo || '—'}</p>` : ''}
            ${btnBatismoPrint}
            <p style="margin:6px 0 2px 0;"><strong>Funções/Atividades:</strong></p>
            <div style="background:#1e293b; padding:8px 10px; border-radius:6px; font-size:12px; color:#60a5fa; border:1px solid #334155;">
              ${funcoesTexto}
            </div>

            ${secEstadoHistorico}
          </div>

          ${timelineHtml}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px; margin-top:20px;">
          <button onclick="document.getElementById('modal-ficha-individual').style.display='none'" style="padding:10px 18px; border:1px solid #334155; background:transparent; color:#94a3b8; border-radius:8px; cursor:pointer;">Fechar</button>
          <button onclick="MembrosModule.imprimirFichaIndividual('${m.id}')" style="padding:10px 20px; background:#0284c7; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:6px;">🖨️ Imprimir Ficha</button>
        </div>

      </div>
    `;

    modal.style.display = 'flex';
  },

  imprimirFichaIndividual(id) {
    const membros = DB.get('membros') || [];
    const m = membros.find(x => x.id === id || x.id === parseInt(id, 10));
    if (!m) return;

    const ministros = DB.get('ministerio') || [];
    const ministro = ministros.find(min => 
      (min.membroId && String(min.membroId) === String(m.id)) || 
      (min.nome && min.nome.toLowerCase().trim() === m.nome.toLowerCase().trim())
    );

    let funcoesTexto = m.atividadesExercidas || 'Nenhuma registrada';
    if (ministro) {
      const cargo = ministro.cargo || ministro.grau || 'Ministro';
      const dataCons = ministro.consagracao || ministro.dataConsagracao;
      funcoesTexto = `${cargo} ${dataCons ? `(Consagrado em: ${dataCons})` : ''}`;
    }

    let historicoPrint = '';
    if (m.historico && m.historico.length > 0) {
      historicoPrint = `
        <div class="section" style="grid-column: span 2; margin-top: 15px;">
          <div class="section-title">Histórico de Alterações / Linha do Tempo</div>
          ${m.historico.map(h => `<div class="field" style="font-size:9.5pt; margin-bottom:6px; border-bottom:1px dashed #e2e8f0; padding-bottom:4px;"><strong>[${h.data}] ${h.tipo}:</strong> ${h.descricao}</div>`).join('')}
        </div>
      `;
    }

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Ficha do Membro - ${m.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20pt; color: #0f172a; }
            .header p { margin: 4px 0 0 0; color: #64748b; font-size: 10pt; }
            .profile { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; border: 2px solid #0284c7; overflow: hidden; }
            .avatar img { width: 100%; height: 100%; object-fit: cover; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .section { border: 1px solid #cbd5e1; padding: 14px; border-radius: 6px; background: #fff; }
            .section-title { font-weight: bold; color: #0284c7; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .field { font-size: 10.5pt; margin-bottom: 4px; }
            .field strong { color: #334155; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CENTRO MISSIONÁRIO ATOS DOS APÓSTOLOS</h1>
            <p>Ficha Individual do Membro</p>
            <p>Relatório Cadastral, Espiritual e Histórico Evolutivo</p>
          </div>

          <div class="profile">
            <div class="avatar">${this.renderAvatar(m)}</div>
            <div>
              <h2 style="margin: 0; font-size: 16pt;">${m.nome}</h2>
              <p style="margin: 4px 0;"><strong>Código:</strong> ${m.codigo} | <strong>Membro:</strong> ${m.estado || 'Activo'}</p>
              <p style="margin: 0;"><strong>Departamento:</strong> ${m.departamento}</p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Dados Pessoais</div>
              <div class="field"><strong>BI / Documento:</strong> ${m.bi || 'N/A'}</div>
              <div class="field"><strong>Género:</strong> ${m.genero || '—'}</div>
              <div class="field"><strong>Data Nasc:</strong> ${m.dataNasc || '—'}</div>
              <div class="field"><strong>Estado Civil:</strong> ${m.estadoCivil || '—'}</div>
              <div class="field"><strong>Telefone:</strong> ${m.fone || '—'}</div>
              <div class="field"><strong>Morada / Bairro:</strong> ${m.bairro || '—'}</div>
              <div class="field"><strong>Nome do Pai:</strong> ${m.nomePai || '—'}</div>
              <div class="field"><strong>Nome da Mãe:</strong> ${m.nomeMae || '—'}</div>
            </div>

            <div class="section">
              <div class="section-title">Dados Espirituais & Histórico</div>
              <div class="field"><strong>Ano de Conversão:</strong> ${m.anoConversao || '—'}</div>
              <div class="field"><strong>Batizado nas Águas:</strong> ${m.isBatizado ? 'Sim' : 'Não'}</div>
              ${m.isBatizado ? `<div class="field"><strong>Data Batismo:</strong> ${m.dataBatismo || '—'}</div>` : ''}
              ${m.isBatizado ? `<div class="field"><strong>Ministro Oficiante:</strong> ${m.ministroBatismo || '—'}</div>` : ''}
              <div class="field" style="margin-top: 10px;"><strong>Funções / Atividades:</strong><br>${funcoesTexto}</div>
              ${m.estado === 'Sob Disciplina' ? `<div class="field" style="margin-top: 6px; color: #c2410c;"><strong>Disciplina:</strong> Entrada em ${m.dataDisciplina || '—'} | Previsão: ${m.retornoDisciplina || '—'}<br>Motivo: ${m.causaDisciplina || '—'}</div>` : ''}
              ${m.estado === 'Transferido' ? `<div class="field" style="margin-top: 6px; color: #0369a1;"><strong>Transferência:</strong> Destino: ${m.igrejaDestino || '—'} | Data: ${m.dataTransferencia || '—'}</div>` : ''}
              ${m.estado === 'Falecido' ? `<div class="field" style="margin-top: 6px; color: #b91c1c;"><strong>Óbito:</strong> ${m.dataMorte || '—'} | Causa: ${m.causaMorte || '—'} | Cemitério: ${m.cemiterio || '—'}</div>` : ''}
            </div>

            ${historicoPrint}
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  },

  imprimirListaMembros(listaMembros = []) {
    const dados = listaMembros.length > 0 ? listaMembros : (DB.get('membros') || []);

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Lista de Membros - EcclesiaSys</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18pt; text-transform: uppercase; color: #0f172a; }
            .header p { margin: 4px 0 0 0; font-size: 10pt; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; text-transform: uppercase; font-size: 9pt; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .total { margin-top: 15px; text-align: right; font-size: 10pt; font-weight: bold; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CENTRO MISSIONÁRIO ATOS DOS APÓSTOLOS</h1>
            <p>Lista Geral de Membros | Emissão: ${new Date().toLocaleDateString('pt-PT')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 12%;">Código</th>
                <th>Nome Completo</th>
                <th style="width: 15%;">Telefone</th>
                <th style="width: 22%;">Departamento</th>
                <th style="width: 12%;">Estado</th>
                <th style="width: 12%;">Batizado</th>
              </tr>
            </thead>
            <tbody>
              ${dados.length === 0 ? '<tr><td colspan="7" style="text-align:center;">Nenhum membro cadastrado.</td></tr>' : 
                dados.map((m, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${m.codigo}</strong></td>
                    <td>${m.nome}</td>
                    <td>${m.fone || '—'}</td>
                    <td>${m.departamento || '—'}</td>
                    <td>${m.estado || 'Activo'}</td>
                    <td>${m.isBatizado ? 'Sim' : 'Não'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>

          <div class="total">Total de Membros Cadastrados: ${dados.length}</div>

          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  },

  imprimirDocumentoOficial(idMembro, tipoDoc) {
    const membros = DB.get('membros') || [];
    const m = membros.find(x => x.id === idMembro || x.id === parseInt(idMembro, 10));
    if (!m) return;

    const win = window.open('', '_blank');
    let titulo = '';
    let conteudoHtml = '';

    if (tipoDoc === 'transferencia') {
      titulo = `Carta de Transferência - ${m.nome}`;
      conteudoHtml = `
        <div class="header">
          <h1>CARTA OFICIAL DE TRANSFERÊNCIA</h1>
          <p>CENTRO MISSIONÁRIO ATOS DOS APÓSTOLOS - SECRETARIA GERAL</p>
        </div>
        <div class="content" style="font-size: 14px; text-align: justify; margin-top: 20px;">
          <p>Saudações no Senhor Jesus Cristo,</p>
          <p>Pela presente carta, recomendamos às vossas orações e comunhão o(a) irmão(ã) <strong>${m.nome}</strong>, inscrito(a) sob o código <strong>${m.codigo}</strong>, que se encontra transferido(a) para a vossa digna congregação <strong>${m.igrejaDestino || 'Igreja de Destino'}</strong>.</p>
          
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Nome Completo:</strong> ${m.nome}</td><td><strong>Nº BI:</strong> ${m.bi || 'N/A'}</td></tr>
              <tr><td><strong>Gênero:</strong> ${m.genero}</td><td><strong>Estado Civil:</strong> ${m.estadoCivil || 'N/A'}</td></tr>
              <tr><td><strong>Filiação:</strong> ${m.nomePai || 'N/A'} & ${m.nomeMae || 'N/A'}</td><td><strong>Telefone:</strong> ${m.fone || 'N/A'}</td></tr>
              <tr><td><strong>Ano de Conversão:</strong> ${m.anoConversao || 'N/A'}</td><td><strong>Batizado(a):</strong> ${m.isBatizado ? 'Sim (' + (m.dataBatismo || '') + ')' : 'Não'}</td></tr>
              <tr><td><strong>Departamento:</strong> ${m.departamento}</td><td><strong>Data Transferência:</strong> ${m.dataTransferencia || 'N/A'}</td></tr>
              <tr><td colspan="2" style="padding-top:10px;"><strong>Funções / Atividades Exercidas na Igreja Local:</strong><br>${m.atividadesExercidas || 'Membro Comungante'}</td></tr>
            </table>
          </div>

          <p>Atestamos que até à data da sua transferência, o(a) referido(a) irmão(ã) manteve uma conduta exemplar e em inteira comunhão com a nossa igreja local.</p>
          <p>Luanda, ${new Date().toLocaleDateString('pt-PT')}.</p>
        </div>
        <div style="margin-top: 60px; text-align: center; display: flex; justify-content: space-between;">
          <div style="width: 45%; border-top: 1px solid #0f172a; padding-top: 8px; font-size: 12px;">O Pastor Presidente</div>
          <div style="width: 45%; border-top: 1px solid #0f172a; padding-top: 8px; font-size: 12px;">O Secretário Geral</div>
        </div>
      `;
    } else if (tipoDoc === 'disciplina') {
      titulo = `Notificação Disciplinar - ${m.nome}`;
      conteudoHtml = `
        <div class="header">
          <h1>REGISTO DE SANÇÃO DISCIPLINAR</h1>
          <p>CENTRO MISSIONÁRIO ATOS DOS APÓSTOLOS - CONSELHO PASTORAL</p>
        </div>
        <div class="content" style="font-size: 14px; text-align: justify; margin-top: 20px;">
          <p>Notifica-se por este documento que o(a) membro <strong>${m.nome}</strong>, inscrito(a) sob o código <strong>${m.codigo}</strong>, portador(a) do BI nº <strong>${m.bi || 'N/A'}</strong>, encontra-se sob medida de disciplina eclesiástica desde <strong>${m.dataDisciplina || '—'}</strong>.</p>
          
          <div style="background: #fff7ed; border: 1px solid #fdba74; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Causa / Motivo:</strong> ${m.causaDisciplina || 'Não especificada'}</p>
            <p style="margin: 4px 0;"><strong>Previsão de Reavaliação / Retorno:</strong> ${m.retornoDisciplina || 'A definir'}</p>
          </div>

          <p>Esta medida visa o acompanhamento pastoral, edificação espiritual e restabelecimento da comunhão nos termos estatutários da igreja.</p>
          <p>Luanda, ${new Date().toLocaleDateString('pt-PT')}.</p>
        </div>
        <div style="margin-top: 60px; text-align: center; display: flex; justify-content: space-between;">
          <div style="width: 45%; border-top: 1px solid #0f172a; padding-top: 8px; font-size: 12px;">O Conselho Pastoral</div>
          <div style="width: 45%; border-top: 1px solid #0f172a; padding-top: 8px; font-size: 12px;">O Pastor Presidente</div>
        </div>
      `;
    } else if (tipoDoc === 'batismo') {
      titulo = `Certificado de Batismo - ${m.nome}`;
      conteudoHtml = `
        <div style="text-align:center; border: 6px double #0284c7; padding: 40px; background: #fff;">
          <h2 style="font-size:14pt; color:#64748b; margin:0; text-transform:uppercase;">Centro Missionário Atos dos Apóstolos</h2>
          <h1 style="color:#0284c7; font-size:24pt; margin: 15px 0 5px 0; text-transform:uppercase;">Certificado de Batismo nas Águas</h1>
          <p style="font-size:11pt; color:#64748b; font-style:italic;">"Portanto fostes sepultados com ele juntamente pelo batismo na morte..."</p>
          <div style="margin: 40px 0; font-size: 14pt; line-height: 1.8; text-align: justify;">
            Certificamos para os devidos efeitos que <strong>${m.nome}</strong>, portador(a) do BI nº <strong>${m.bi || 'N/A'}</strong>, professou publicamente a sua fé em Senhor Jesus Cristo e foi batizado(a) nas águas em <strong>${m.dataBatismo || '—'}</strong>, oficiado pelo Ministro <strong>${m.ministroBatismo || '—'}</strong>, encontrando-se registado(a) sob o código <strong>${m.codigo}</strong>.
          </div>
          <div style="margin-top:60px; display:flex; justify-content:space-around;">
            <div style="border-top:1px solid #000; width:220px; padding-top:6px; font-size:11pt; font-weight:bold;">O Batizando(a)</div>
            <div style="border-top:1px solid #000; width:220px; padding-top:6px; font-size:11pt; font-weight:bold;">O Ministro Oficiante</div>
          </div>
        </div>
      `;
    }

    win.document.write(`
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; color: #0f172a; }
            .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          ${conteudoHtml}
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  },

  openModal(id = null) {
    const membros = DB.get('membros') || [];
    const m = id ? membros.find(x => x.id === id || x.id === parseInt(id, 10)) : null;

    let modal = document.getElementById('modal-membro');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-membro';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;';
      document.body.appendChild(modal);
    }

    const deptAtual = m ? m.departamento : 'Departamento de Crianças';

    modal.innerHTML = `
      <div style="background:#1e293b; color:#fff; padding:25px; border-radius:16px; width:750px; max-height:90vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:18px; font-weight:700; color:#fff;">📌 ${m ? 'Editar Ficha do Membro' : 'Cadastrar Ficha de Membro'}</h3>
          <button onclick="MembrosModule.closeModal()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
        </div>

        <input type="hidden" id="mb-id" value="${m ? m.id : ''}">
        <input type="hidden" id="mb-foto-data" value="${m ? m.foto || '' : ''}">

        <!-- ÁREA DE FOTOGRAFIA DO MEMBRO -->
        <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px; background:#0f172a; padding:16px; border-radius:12px; border:1px solid #334155;">
          <div id="mb-preview-container" style="width:80px; height:80px; border-radius:50%; overflow:hidden; border:2px solid #38bdf8; background:#1e293b; display:flex; align-items:center; justify-content:center;">
            ${m ? this.renderAvatar(m) : this.renderAvatar({ genero: 'Masculino' })}
          </div>
          <video id="mb-video" autoplay style="display:none; width:100px; height:80px; border-radius:8px; object-fit:cover; border:1px solid #38bdf8;"></video>
          <canvas id="mb-canvas" style="display:none;"></canvas>

          <div style="display:flex; gap:10px;">
            <input type="file" id="mb-input-foto" accept="image/*" onchange="MembrosModule.carregarFotoFicheiro(event)" style="display:none;">
            <button onclick="document.getElementById('mb-input-foto').click()" style="padding:8px 14px; background:#0284c7; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;">📁 Carregar Foto</button>
            <button id="btn-tirar-foto" onclick="MembrosModule.iniciarCamara()" style="padding:8px 14px; background:#16a34a; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;">📷 Tirar Foto</button>
          </div>
        </div>

        <!-- DADOS PESSOAIS -->
        <h4 style="font-size:13px; font-weight:700; color:#38bdf8; margin-bottom:12px;">👤 Dados Pessoais</h4>
        
        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Nome Completo *</label>
          <input type="text" id="mb-nome" value="${m ? m.nome : ''}" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Nº BI / Documento</label>
            <input type="text" id="mb-bi" value="${m ? m.bi || '' : ''}" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Género *</label>
            <select id="mb-genero" onchange="MembrosModule.atualizarAvatarEModulo()" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
              <option value="Masculino" ${m && m.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
              <option value="Feminino" ${m && m.genero === 'Feminino' ? 'selected' : ''}>Feminino</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Data de Nasc. *</label>
            <input type="date" id="mb-nasc" value="${m ? m.dataNasc || '' : ''}" onchange="MembrosModule.atualizarDepartamentoAuto()" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Estado Civil</label>
            <select id="mb-estado-civil" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
              <option value="Solteiro(a)" ${m && m.estadoCivil === 'Solteiro(a)' ? 'selected' : ''}>Solteiro(a)</option>
              <option value="Casado(a)" ${m && m.estadoCivil === 'Casado(a)' ? 'selected' : ''}>Casado(a)</option>
              <option value="Divorciado(a)" ${m && m.estadoCivil === 'Divorciado(a)' ? 'selected' : ''}>Divorciado(a)</option>
              <option value="Viúvo(a)" ${m && m.estadoCivil === 'Viúvo(a)' ? 'selected' : ''}>Viúvo(a)</option>
            </select>
          </div>
        </div>

        <!-- FILIAÇÃO -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Nome do Pai</label>
            <input type="text" id="mb-pai" value="${m ? m.nomePai || '' : ''}" placeholder="Nome completo do pai" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Nome da Mãe</label>
            <input type="text" id="mb-mae" value="${m ? m.nomeMae || '' : ''}" placeholder="Nome completo da mãe" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1.2fr; gap:12px; margin-bottom:16px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Telefone</label>
            <input type="text" id="mb-fone" value="${m ? m.fone || '' : ''}" placeholder="Ex: 923000000" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Morada / Bairro</label>
            <input type="text" id="mb-bairro" value="${m ? m.bairro || '' : ''}" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#38bdf8; margin-bottom:4px;">Departamento (Auto / Editável)</label>
            <select id="mb-dept" style="width:100%; padding:10px; background:#0f172a; border:1px solid #38bdf8; border-radius:8px; color:#38bdf8; font-weight:700; font-size:13px;">
              <option value="Departamento de Crianças" ${deptAtual === 'Departamento de Crianças' ? 'selected' : ''}>Departamento de Crianças</option>
              <option value="Departamento de Adolescentes" ${deptAtual === 'Departamento de Adolescentes' ? 'selected' : ''}>Departamento de Adolescentes</option>
              <option value="Departamento da Juventude" ${deptAtual === 'Departamento da Juventude' ? 'selected' : ''}>Departamento da Juventude</option>
              <option value="Departamento dos Papás" ${deptAtual === 'Departamento dos Papás' ? 'selected' : ''}>Departamento dos Papás</option>
              <option value="Departamento das Mulheres" ${deptAtual === 'Departamento das Mulheres' ? 'selected' : ''}>Departamento das Mulheres</option>
              <option value="Geral" ${deptAtual === 'Geral' ? 'selected' : ''}>Geral</option>
            </select>
          </div>
        </div>

        <!-- ÁREA ESPIRITUAL E ESTADO -->
        <h4 style="font-size:13px; font-weight:700; color:#38bdf8; margin-bottom:12px;">✝ Área Espiritual & Estado</h4>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Ano de Conversão</label>
            <input type="number" id="mb-ano-conversao" value="${m ? m.anoConversao || '' : ''}" placeholder="Ex: 2018" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">É Batizado nas Águas?</label>
            <select id="mb-batizado" onchange="MembrosModule.toggleCamposBatismo()" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
              <option value="nao" ${m && !m.isBatizado ? 'selected' : ''}>Não</option>
              <option value="sim" ${m && m.isBatizado ? 'selected' : ''}>Sim</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Estado do Membro</label>
            <select id="mb-estado" onchange="MembrosModule.toggleCamposEstado()" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
              <option value="Activo" ${m && m.estado === 'Activo' ? 'selected' : ''}>Activo</option>
              <option value="Passivo" ${m && m.estado === 'Passivo' ? 'selected' : ''}>Passivo</option>
              <option value="Transferido" ${m && m.estado === 'Transferido' ? 'selected' : ''}>Transferido</option>
              <option value="Sob Disciplina" ${m && m.estado === 'Sob Disciplina' ? 'selected' : ''}>Sob Disciplina</option>
              <option value="Falecido" ${m && m.estado === 'Falecido' ? 'selected' : ''}>Falecido</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:11px; font-weight:600; color:#94a3b8; margin-bottom:4px;">Atividades / Funções Exercidas na Igreja</label>
          <input type="text" id="mb-atividades" value="${m ? m.atividadesExercidas || '' : ''}" placeholder="Ex: Diácono, Líder do Louvor, Professor da EBD, Vocalista" style="width:100%; padding:10px; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#fff; font-size:13px;">
        </div>

        <!-- CAMPOS DINÂMICOS DE BATISMO -->
        <div id="sec-batismo-campos" style="display:${m && m.isBatizado ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px; background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#38bdf8; margin-bottom:4px;">Data do Batismo *</label>
            <input type="date" id="mb-data-batismo" value="${m ? m.dataBatismo || '' : ''}" style="width:100%; padding:8px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#38bdf8; margin-bottom:4px;">Ministro Oficiante *</label>
            <input type="text" id="mb-ministro-batismo" value="${m ? m.ministroBatismo || '' : ''}" placeholder="Ex: Pr. João Silva" style="width:100%; padding:8px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff; font-size:13px;">
          </div>
        </div>

        <!-- CAMPOS DINÂMICOS DE DISCIPLINA -->
        <div id="sec-disciplina-campos" style="display:${m && m.estado === 'Sob Disciplina' ? 'block' : 'none'}; margin-bottom:12px; background:#431407; padding:14px; border-radius:8px; border:1px solid #9a3412;">
          <h5 style="color:#fdba74; font-size:12px; font-weight:700; margin-bottom:10px;">⚠️ Registo de Sanção Disciplinar</h5>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:10px;">
            <div>
              <label style="display:block; font-size:11px; font-weight:600; color:#fdba74; margin-bottom:4px;">Data de Entrada em Disciplina *</label>
              <input type="date" id="mb-data-disciplina" value="${m ? m.dataDisciplina || '' : ''}" style="width:100%; padding:8px; background:#0f172a; border:1px solid #9a3412; border-radius:6px; color:#fff; font-size:13px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; font-weight:600; color:#fdba74; margin-bottom:4px;">Previsão / Descrição de Retorno *</label>
              <input type="text" id="mb-retorno-disciplina" value="${m ? m.retornoDisciplina || '' : ''}" placeholder="Ex: 6 Meses / Reavaliação Pastoral" style="width:100%; padding:8px; background:#0f172a; border:1px solid #9a3412; border-radius:6px; color:#fff; font-size:13px;">
            </div>
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#fdba74; margin-bottom:4px;">Descrição da Causa da Sanção *</label>
            <textarea id="mb-causa-disciplina" rows="2" placeholder="Descreva os motivos espirituais/disciplinares..." style="width:100%; padding:8px; background:#0f172a; border:1px solid #9a3412; border-radius:6px; color:#fff; font-size:13px;">${m ? m.causaDisciplina || '' : ''}</textarea>
          </div>
        </div>

        <!-- CAMPOS DINÂMICOS DE TRANSFERÊNCIA -->
        <div id="sec-transferencia-campos" style="display:${m && m.estado === 'Transferido' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px; background:#0c4a6e; padding:12px; border-radius:8px; border:1px solid #0284c7;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#7dd3fc; margin-bottom:4px;">Igreja / Congregação de Destino *</label>
            <input type="text" id="mb-igreja-destino" value="${m ? m.igrejaDestino || '' : ''}" placeholder="Ex: Igreja Evangélica - Sede" style="width:100%; padding:8px; background:#0f172a; border:1px solid #0284c7; border-radius:6px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#7dd3fc; margin-bottom:4px;">Data da Transferência *</label>
            <input type="date" id="mb-data-transferencia" value="${m ? m.dataTransferencia || '' : ''}" style="width:100%; padding:8px; background:#0f172a; border:1px solid #0284c7; border-radius:6px; color:#fff; font-size:13px;">
          </div>
        </div>

        <!-- CAMPOS DINÂMICOS DE PASSIVO -->
        <div id="sec-passivo-campos" style="display:${m && m.estado === 'Passivo' ? 'block' : 'none'}; margin-bottom:12px; background:#713f12; padding:12px; border-radius:8px; border:1px solid #ca8a04;">
          <p style="color:#fef08a; font-size:12px; margin:0 0 8px 0;">🚗 <strong>Atenção Pastoral:</strong> Membro com estado Passivo. Recomenda-se o agendamento de uma visita de acompanhamento.</p>
          <button type="button" onclick="MembrosModule.solicitarVisitaPastoral(${m ? m.id : null})" style="background:#f59e0b; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:700; font-size:12px; cursor:pointer;">Registar / Agendar Visita Pastoral</button>
        </div>

        <!-- CAMPOS DINÂMICOS DE FALECIMENTO -->
        <div id="sec-falecido-campos" style="display:${m && m.estado === 'Falecido' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px; background:#451a1a; padding:12px; border-radius:8px; border:1px solid #7f1d1d;">
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#fca5a5; margin-bottom:4px;">Data da Morte *</label>
            <input type="date" id="mb-data-morte" value="${m ? m.dataMorte || '' : ''}" style="width:100%; padding:8px; background:#0f172a; border:1px solid #7f1d1d; border-radius:6px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#fca5a5; margin-bottom:4px;">Causa da Morte *</label>
            <input type="text" id="mb-causa-morte" value="${m ? m.causaMorte || '' : ''}" placeholder="Ex: Doença" style="width:100%; padding:8px; background:#0f172a; border:1px solid #7f1d1d; border-radius:6px; color:#fff; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:11px; font-weight:600; color:#fca5a5; margin-bottom:4px;">Cemitério *</label>
            <input type="text" id="mb-cemiterio" value="${m ? m.cemiterio || '' : ''}" placeholder="Ex: Cemitério do Camama" style="width:100%; padding:8px; background:#0f172a; border:1px solid #7f1d1d; border-radius:6px; color:#fff; font-size:13px;">
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">
          <button onclick="MembrosModule.closeModal()" style="padding:10px 18px; border:1px solid #334155; background:transparent; color:#94a3b8; border-radius:8px; cursor:pointer;">Cancelar</button>
          <button onclick="MembrosModule.save()" style="padding:10px 20px; background:var(--primary); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700;">Guardar Membro</button>
        </div>

      </div>
    `;

    modal.style.display = 'flex';
  },

  closeModal() {
    this.pararCamara();
    const modal = document.getElementById('modal-membro');
    if (modal) modal.style.display = 'none';
  },

  atualizarAvatarEModulo() {
    this.atualizarDepartamentoAuto();

    const fotoData = document.getElementById('mb-foto-data')?.value;
    const container = document.getElementById('mb-preview-container');

    if (container && !fotoData) {
      const genero = document.getElementById('mb-genero')?.value || 'Masculino';
      container.innerHTML = this.renderAvatar({ genero, foto: null });
    }
  },

  carregarFotoFicheiro(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionamento e compressão via Canvas para evitar erro de cota no LocalStorage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Comprimido = canvas.toDataURL('image/jpeg', 0.8);
        const fotoInput = document.getElementById('mb-foto-data');
        const container = document.getElementById('mb-preview-container');
        
        if (fotoInput) fotoInput.value = base64Comprimido;
        if (container) container.innerHTML = `<img src="${base64Comprimido}" style="width:100%; height:100%; object-fit:cover;">`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  iniciarCamara() {
    const video = document.getElementById('mb-video');
    const container = document.getElementById('mb-preview-container');
    const btn = document.getElementById('btn-tirar-foto');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('A câmara não é suportada neste navegador.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.streamCam = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        container.style.display = 'none';
        btn.innerText = '📸 Capturar';
        btn.onclick = () => this.tirarFoto();
      })
      .catch(err => {
        console.error('Erro ao aceder à câmara:', err);
        alert('Não foi possível aceder à câmara.');
      });
  },

  tirarFoto() {
    const video = document.getElementById('mb-video');
    const canvas = document.getElementById('mb-canvas');
    const container = document.getElementById('mb-preview-container');
    const fotoInput = document.getElementById('mb-foto-data');
    const btn = document.getElementById('btn-tirar-foto');

    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    if (fotoInput) fotoInput.value = base64;
    if (container) {
      container.innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:cover;">`;
      container.style.display = 'flex';
    }

    this.pararCamara();
    btn.innerText = '📷 Tirar Foto';
    btn.onclick = () => this.iniciarCamara();
  },

  pararCamara() {
    if (this.streamCam) {
      this.streamCam.getTracks().forEach(track => track.stop());
      this.streamCam = null;
    }
    const video = document.getElementById('mb-video');
    if (video) video.style.display = 'none';
  },

  atualizarDepartamentoAuto() {
    const dataNasc = document.getElementById('mb-nasc')?.value;
    const genero = document.getElementById('mb-genero')?.value || 'Masculino';
    const deptSelect = document.getElementById('mb-dept');

    if (deptSelect && dataNasc) {
      deptSelect.value = this.definirDepartamento(dataNasc, genero);
    }
  },

  toggleCamposBatismo() {
    const isBatizado = document.getElementById('mb-batizado')?.value === 'sim';
    const sec = document.getElementById('sec-batismo-campos');
    if (sec) sec.style.display = isBatizado ? 'grid' : 'none';
  },

  toggleCamposEstado() {
    const estado = document.getElementById('mb-estado')?.value;
    
    const secDisciplina = document.getElementById('sec-disciplina-campos');
    const secTransf = document.getElementById('sec-transferencia-campos');
    const secPassivo = document.getElementById('sec-passivo-campos');
    const secFalecido = document.getElementById('sec-falecido-campos');

    if (secDisciplina) secDisciplina.style.display = estado === 'Sob Disciplina' ? 'block' : 'none';
    if (secTransf) secTransf.style.display = estado === 'Transferido' ? 'grid' : 'none';
    if (secPassivo) secPassivo.style.display = estado === 'Passivo' ? 'block' : 'none';
    if (secFalecido) secFalecido.style.display = estado === 'Falecido' ? 'grid' : 'none';
  },

  solicitarVisitaPastoral(membroId) {
    alert('Solicitação de visita pastoral registada. Recomendado acompanhamento directo.');
  },

  save() {
    const idEl = document.getElementById('mb-id')?.value;
    const nome = document.getElementById('mb-nome')?.value.trim();
    const bi = document.getElementById('mb-bi')?.value.trim();
    const genero = document.getElementById('mb-genero')?.value;
    const dataNasc = document.getElementById('mb-nasc')?.value;
    const estadoCivil = document.getElementById('mb-estado-civil')?.value;
    const nomePai = document.getElementById('mb-pai')?.value.trim();
    const nomeMae = document.getElementById('mb-mae')?.value.trim();
    const fone = document.getElementById('mb-fone')?.value.trim();
    const bairro = document.getElementById('mb-bairro')?.value.trim();
    const departamento = document.getElementById('mb-dept')?.value;
    
    const anoConversao = document.getElementById('mb-ano-conversao')?.value;
    const isBatizado = document.getElementById('mb-batizado')?.value === 'sim';
    const estado = document.getElementById('mb-estado')?.value;
    const atividadesExercidas = document.getElementById('mb-atividades')?.value.trim();
    const foto = document.getElementById('mb-foto-data')?.value;

    const dataBatismo = document.getElementById('mb-data-batismo')?.value;
    const ministroBatismo = document.getElementById('mb-ministro-batismo')?.value;

    const dataDisciplina = document.getElementById('mb-data-disciplina')?.value;
    const retornoDisciplina = document.getElementById('mb-retorno-disciplina')?.value;
    const causaDisciplina = document.getElementById('mb-causa-disciplina')?.value;

    const igrejaDestino = document.getElementById('mb-igreja-destino')?.value;
    const dataTransferencia = document.getElementById('mb-data-transferencia')?.value;

    const dataMorte = document.getElementById('mb-data-morte')?.value;
    const causaMorte = document.getElementById('mb-causa-morte')?.value;
    const cemiterio = document.getElementById('mb-cemiterio')?.value;

    if (!nome) {
      alert('Por favor, preencha o Nome Completo.');
      return;
    }

    let membros = DB.get('membros') || [];
    const agora = new Date().toLocaleDateString('pt-PT');

    if (idEl) {
      // Edição
      const idx = membros.findIndex(x => String(x.id) === String(idEl));
      if (idx !== -1) {
        const mAntigo = membros[idx];
        const alterouBatismo = mAntigo.isBatizado !== isBatizado;
        let novoCodigo = mAntigo.codigo;

        if (alterouBatismo) {
          novoCodigo = this.gerarCodigoAutomatico(isBatizado);
        }

        const historico = mAntigo.historico || [];
        historico.push({
          data: agora,
          tipo: 'Edição de Dados',
          descricao: `Ficha atualizada. Estado: ${estado}`
        });

        membros[idx] = {
          ...mAntigo,
          codigo: novoCodigo,
          nome, bi, genero, dataNasc, estadoCivil, nomePai, nomeMae, fone, bairro, departamento,
          anoConversao, isBatizado, estado, atividadesExercidas, foto,
          dataBatismo, ministroBatismo, dataDisciplina, retornoDisciplina, causaDisciplina,
          igrejaDestino, dataTransferencia, dataMorte, causaMorte, cemiterio,
          historico
        };
      }
    } else {
      // Novo Cadastro
      const codigo = this.gerarCodigoAutomatico(isBatizado);
      const novoId = Date.now().toString();

      const novoMembro = {
        id: novoId,
        codigo, nome, bi, genero, dataNasc, estadoCivil, nomePai, nomeMae, fone, bairro, departamento,
        anoConversao, isBatizado, estado, atividadesExercidas, foto,
        dataBatismo, ministroBatismo, dataDisciplina, retornoDisciplina, causaDisciplina,
        igrejaDestino, dataTransferencia, dataMorte, causaMorte, cemiterio,
        historico: [{
          data: agora,
          tipo: 'Cadastro Inicial',
          descricao: `Registo efetuado com código ${codigo}`
        }]
      };

      membros.push(novoMembro);
    }

    try {
      DB.set('membros', membros);
    } catch (e) {
      alert('Erro ao guardar: O armazenamento local está cheio. Tente carregar uma imagem menor.');
      return;
    }

    this.closeModal();
    this.render();

    if (typeof DepartamentosModule !== 'undefined' && DepartamentosModule.sincronizarMembros) {
      DepartamentosModule.sincronizarMembros();
    }
  },

  delete(id) {
    if (confirm('Tem certeza que deseja eliminar este membro?')) {
      let membros = DB.get('membros') || [];
      membros = membros.filter(x => String(x.id) !== String(id));
      DB.set('membros', membros);
      this.render();

      if (typeof DepartamentosModule !== 'undefined' && DepartamentosModule.sincronizarMembros) {
        DepartamentosModule.sincronizarMembros();
      }
    }
  }
};

if (window.AppRouter && typeof window.AppRouter.register === 'function') {
  window.AppRouter.register('membros', MembrosModule);
} else if (window.router) {
  window.router.membros = MembrosModule;
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof MembrosModule !== 'undefined' && MembrosModule.init) {
    MembrosModule.init();
  }
});