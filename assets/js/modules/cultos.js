// ============================================================================
// Módulo de Cultos e Eventos - EcclesiaSys (Versão Completa com Filtros e Ordem/Presença)
// ============================================================================

const CultosModule = {
  formVisible: false,
  editandoId: null,

  init() {
    this.verificarAtividadesVencidas();
    this.render();
  },

  verificarAtividadesVencidas() {
    const cultos = DB.get('cultos') || [];
    const hojeStr = new Date().toISOString().split('T')[0];
    
    const vencidos = cultos.filter(c => {
      if (!c.data) return false;
      return (c.status === 'Agendado' || c.status === 'Em Andamento') && c.data < hojeStr;
    });

    if (vencidos.length > 0) {
      const titulos = vencidos.map(c => `• ${c.titulo} (${c.data})`).join('\n');
      setTimeout(() => {
        alert(`⚠️ Lembrete do Sistema:\n\nExistem ${vencidos.length} atividade(s)/culto(s) cuja data agendada já expirou e ainda constam como "Agendado" ou "Em Andamento":\n\n${titulos}\n\nPor favor, edite os respetivos registos para atualizar o seu status.`);
      }, 500);
    }
  },

  render() {
    const container = document.getElementById('view-cultos');
    if (!container) return;

    const cultos = DB.get('cultos') || [];
    const hojeStr = new Date().toISOString().split('T')[0];
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const temPermissaoEdicao = typeof Auth !== 'undefined' && Auth.isAdminSecOrPastor();

    const totalRegistados = cultos.length;
    const cultosHoje = cultos.filter(c => c.data === hojeStr).length;
    const eventosMes = cultos.filter(c => {
      if (!c.data) return false;
      const d = new Date(c.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    }).length;

    container.innerHTML = `
      <style>
        .sticky-header-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #f8fafc;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        @media print {
          body * { visibility: hidden !important; }
          #culto-modal-visualizar, #culto-modal-visualizar * { visibility: visible !important; }
          #culto-modal-visualizar {
            position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; background: #fff !important; display: flex !important; z-index: 99999 !important; padding: 0 !important; margin: 0 !important;
          }
          .no-print { display: none !important; }
          .a4-sheet { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; padding: 10mm !important; margin: 0 !important; }
        }
      </style>

      <div class="sticky-header-container">
        <div class="no-print" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
          <div>
            <h2 style="margin:0 0 5px 0; font-size:22px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:8px;">
              📅 Cultos e Eventos
            </h2>
            <p style="margin:0; font-size:13px; color:#64748b;">Registo, programação litúrgica, agenda e histórico de atividades.</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button onclick="window.print()" style="background:#0284c7; color:#fff; border:none; padding:10px 18px; border-radius:6px; font-weight:600; cursor:pointer; font-size:14px; display:flex; align-items:center; gap:6px;">
              🖨️ Imprimir Agenda
            </button>
            ${temPermissaoEdicao ? `
              <button onclick="CultosModule.toggleForm()" style="background:#2563eb; color:#fff; border:none; padding:10px 18px; border-radius:6px; font-weight:600; cursor:pointer; font-size:14px;">
                ${this.formVisible ? '✖ Fechar Formulário' : '＋ Novo Culto / Evento'}
              </button>
            ` : ''}
          </div>
        </div>

        <div class="no-print" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:20px;">
          <div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">TOTAL REGISTADOS</div>
            <div style="font-size:32px; font-weight:800; color:#2563eb; margin-top:8px;">${totalRegistados}</div>
          </div>
          <div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">CULTOS HOJE</div>
            <div style="font-size:32px; font-weight:800; color:#16a34a; margin-top:8px;">${cultosHoje}</div>
          </div>
          <div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">EVENTOS ESTE MÊS</div>
            <div style="font-size:32px; font-weight:800; color:#0284c7; margin-top:8px;">${eventosMes}</div>
          </div>
        </div>

        ${temPermissaoEdicao ? `
          <div id="culto-form-panel" class="no-print" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:20px; margin-bottom:20px; display:${this.formVisible ? 'block' : 'none'};">
            <h3 id="form-titulo-modo" style="font-size:15px; font-weight:700; color:#1e293b; margin-bottom:15px;">${this.editandoId ? 'Editar Culto ou Evento' : 'Registar Novo Culto ou Evento'}</h3>
            
            <form onsubmit="event.preventDefault(); CultosModule.save();">
              <div style="display:grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr; gap:12px; margin-bottom:15px;">
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Título do Culto / Evento</label>
                  <input type="text" id="culto-titulo" placeholder="Ex: Culto de Doutrina" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Categoria</label>
                  <select id="culto-categoria" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
                    <option value="Culto Normal">Culto Normal</option>
                    <option value="Culto de Ensino / Doutrina">Culto de Ensino / Doutrina</option>
                    <option value="Culto de Oração">Culto de Oração</option>
                    <option value="Conferência / Festividade">Conferência / Festividade</option>
                    <option value="Vigílias">Vigílias</option>
                    <option value="Culto da Juventude">Culto da Juventude</option>
                    <option value="Casamento">Casamento</option>
                    <option value="Celebrações Fúnebres">Celebrações Fúnebres</option>
                    <option value="Reunião de Liderança">Reunião de Liderança</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Data</label>
                  <input type="date" id="culto-data" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Hora de Início</label>
                  <input type="time" id="culto-hora" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;" required>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Local / Espaço</label>
                  <select id="culto-local" onchange="CultosModule.handleLocalChange()" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
                    <option value="Templo Sede - Luanda/Sapú2">Templo Sede - Luanda/Sapú2</option>
                    <option value="Templo Cambango K. Sul/Waku Kungo">Templo Cambango K. Sul/Waku Kungo</option>
                    <option value="Gabinete Pastoral">Gabinete Pastoral</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="OUTRO">➕ Outro Local...</option>
                  </select>
                  <input type="text" id="culto-local-custom" placeholder="Digite o local..." style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; margin-top:6px; display:none;">
                </div>
              </div>

              <div style="display:grid; grid-template-columns: 2fr 2fr 1.5fr 1fr; gap:12px; margin-bottom:15px;">
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Encaminhar para Departamento</label>
                  <select id="culto-departamento" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
                    <option value="Geral">Geral (Toda a Igreja)</option>
                    <option value="Departamento da Juventude">Departamento da Juventude</option>
                    <option value="Departamento dos Papás">Departamento dos Papás</option>
                    <option value="Departamento das Mulheres">Departamento das Mulheres</option>
                    <option value="Departamento de Crianças">Departamento de Crianças</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Pregador / Ministro</label>
                  <input type="text" id="culto-pregador" placeholder="Ex: Pr. Carlos" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Dirigente</label>
                  <input type="text" id="culto-dirigente" placeholder="Ex: Diácono João" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
                </div>
                <div>
                  <label style="display:block; font-size:12px; color:#475569; margin-bottom:5px;">Status</label>
                  <select id="culto-status" onchange="CultosModule.handleStatusChange()" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
                    <option value="Agendado">Agendado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <!-- Secção Dinâmica para Concluído: Ordem do Culto & Estatística de Presença -->
              <div id="secao-concluido-detalhes" style="display:none; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:15px; margin-bottom:15px;">
                <h4 style="margin:0 0 10px 0; font-size:14px; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">📋 Informações de Conclusão (Ordem do Culto & Presença)</h4>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:12px;">
                  <div>
                    <label style="display:block; font-size:11px; font-weight:bold; color:#475569; margin-bottom:4px;">ORDEM DO CULTO / PROGRAMAÇÃO LITÚRGICA</label>
                    <textarea id="culto-ordem" rows="4" placeholder="1. Louvor Inicial&#10;2. Oração de Abertura&#10;3. Leitura Bíblica&#10;4. Mensagem" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;"></textarea>
                  </div>
                  <div>
                    <label style="display:block; font-size:11px; font-weight:bold; color:#475569; margin-bottom:4px;">ESTATÍSTICA DE PRESENÇA</label>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                      <div>
                        <label style="font-size:10px; color:#64748b;">Total Presentes</label>
                        <input type="number" id="culto-presenca-total" value="0" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;">
                      </div>
                      <div>
                        <label style="font-size:10px; color:#64748b;">Homens</label>
                        <input type="number" id="culto-presenca-homens" value="0" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;">
                      </div>
                      <div>
                        <label style="font-size:10px; color:#64748b;">Mulheres</label>
                        <input type="number" id="culto-presenca-mulheres" value="0" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;">
                      </div>
                      <div>
                        <label style="font-size:10px; color:#64748b;">Crianças</label>
                        <input type="number" id="culto-presenca-criancas" value="0" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style="display:flex; gap:10px;">
                <button type="submit" style="background:#2563eb; color:#fff; border:none; padding:9px 18px; border-radius:6px; font-weight:600; cursor:pointer;">Guardar Alterações</button>
                <button type="button" onclick="CultosModule.cancelarEdicao()" style="background:#64748b; color:#fff; border:none; padding:9px 18px; border-radius:6px; font-weight:600; cursor:pointer;">Cancelar</button>
              </div>
            </form>
          </div>
        ` : ''}

        <!-- Painel de Filtros Avançados & Pesquisa (Conforme imagem indicada) -->
        <div class="no-print" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:15px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-weight:700; font-size:13px; color:#1e293b;">🔍 Filtros Avançados & Pesquisa</span>
            <span id="contador-registos-filtro" style="font-size:11px; background:#f1f5f9; color:#475569; padding:3px 8px; border-radius:4px; font-weight:600;">A mostrar todos</span>
          </div>
          <div style="display:grid; grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr 1fr; gap:10px;">
            <input type="text" id="filtro-termo" placeholder="Título, pregador, local..." oninput="CultosModule.filter()" style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;">
            <select id="filtro-categoria" onchange="CultosModule.filter()" style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;">
              <option value="">Todas as Categorias</option>
              <option value="Culto Normal">Culto Normal</option>
              <option value="Culto de Ensino / Doutrina">Culto de Ensino / Doutrina</option>
              <option value="Culto de Oração">Culto de Oração</option>
              <option value="Conferência / Festividade">Conferência / Festividade</option>
              <option value="Vigílias">Vigílias</option>
              <option value="Culto da Juventude">Culto da Juventude</option>
              <option value="Casamento">Casamento</option>
              <option value="Celebrações Fúnebres">Celebrações Fúnebres</option>
              <option value="Reunião de Liderança">Reunião de Liderança</option>
            </select>
            <select id="filtro-status" onchange="CultosModule.filter()" style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;">
              <option value="">Todos os Status</option>
              <option value="Agendado">Agendado</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <select id="filtro-departamento" onchange="CultosModule.filter()" style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;">
              <option value="">Todos os Departamentos</option>
              <option value="Geral">Geral</option>
              <option value="Departamento da Juventude">Departamento da Juventude</option>
              <option value="Departamento dos Papás">Departamento dos Papás</option>
              <option value="Departamento das Mulheres">Departamento das Mulheres</option>
              <option value="Departamento de Crianças">Departamento de Crianças</option>
            </select>
            <input type="date" id="filtro-data-inicio" onchange="CultosModule.filter()" style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;" title="Data Inicial">
            <input type="date" id="filtro-data-fim" onchange="CultosModule.filter()" style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;" title="Data Final">
          </div>
        </div>
      </div>

      <div style="background:#fff; border-radius:10px; border:1px solid #e2e8f0; overflow:hidden; margin-top:10px;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:11px; text-transform:uppercase;">
              <th style="padding:12px 16px;">Data / Hora</th>
              <th style="padding:12px 16px;">Título / Categoria</th>
              <th style="padding:12px 16px;">Departamento</th>
              <th style="padding:12px 16px;">Pregador / Dirigente</th>
              <th style="padding:12px 16px;">Status</th>
              <th style="padding:12px 16px; text-align:right;">Ações</th>
            </tr>
          </thead>
          <tbody id="cultos-table-body">
            ${this.renderRows(cultos)}
          </tbody>
        </table>
      </div>

      <div id="culto-modal-visualizar" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; overflow-y:auto; padding:20px;">
        <div class="a4-sheet" style="background:#fff; width:210mm; min-height:297mm; padding:25mm; box-shadow:0 8px 24px rgba(0,0,0,0.2); border-radius:4px; box-sizing:border-box; position:relative; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="text-align:center; border-bottom:2px solid #2563eb; padding-bottom:15px; margin-bottom:25px;">
              <h2 style="margin:0; font-size:22px; color:#1e293b; text-transform:uppercase;">Sistema de Gestão Eclesiástica</h2>
              <p style="margin:5px 0 0 0; font-size:13px; color:#64748b;">Ficha de Detalhes de Culto ou Evento</p>
            </div>
            <div id="culto-modal-conteudo"></div>
          </div>
          <div class="no-print" style="margin-top:30px; border-top:1px solid #e2e8f0; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
            <button onclick="CultosModule.fecharModalVisualizar()" style="background:#64748b; color:#fff; border:none; padding:9px 18px; border-radius:6px; cursor:pointer; font-weight:600;">Fechar</button>
            <div style="display:flex; gap:10px;">
              <button onclick="window.print()" style="background:#0284c7; color:#fff; border:none; padding:9px 18px; border-radius:6px; cursor:pointer; font-weight:600;">🖨️ Imprimir Ficha A4</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderRows(list) {
    if (!list || list.length === 0) {
      return '<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8;">Nenhum culto ou evento encontrado.</td></tr>';
    }
    const temPermissaoEdicao = typeof Auth !== 'undefined' && Auth.isAdminSecOrPastor();
    return list.map(c => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding:12px 16px;"><strong>${c.data}</strong><br><small style="color:#64748b;">${c.hora || '--:--'}</small></td>
        <td style="padding:12px 16px;"><strong>${c.titulo}</strong><br><small style="color:#64748b;">${c.categoria}</small></td>
        <td style="padding:12px 16px;"><span style="background:#eff6ff; color:#1d4ed8; padding:3px 8px; border-radius:10px; font-size:11px; font-weight:600;">${c.departamento || 'Geral'}</span></td>
        <td style="padding:12px 16px;"><div>${c.pregador || 'N/A'}</div><small style="color:#64748b;">${c.dirigente || ''}</small></td>
        <td style="padding:12px 16px;"><span style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:bold; ${this.getStatusBadge(c.status)}">${c.status}</span></td>
        <td style="text-align: right; padding:12px 16px;">
          <div style="display:inline-flex; gap:4px; align-items:center;">
            <button onclick="CultosModule.visualizar('${c.id}')" title="Visualizar" style="cursor:pointer; background:#f0f9ff; border:1px solid #bae6fd; color:#0284c7; padding:4px 8px; border-radius:4px; font-size:12px;">👁️</button>
            ${temPermissaoEdicao ? `
              <button onclick="CultosModule.carregarEdicao('${c.id}')" title="Editar" style="cursor:pointer; background:#eff6ff; border:1px solid #bfdbfe; color:#2563eb; padding:4px 8px; border-radius:4px; font-size:12px;">✏️</button>
              <button onclick="DB.remove('cultos', '${c.id}'); CultosModule.render();" title="Eliminar" style="cursor:pointer; background:#fef2f2; border:1px solid #fecaca; color:#ef4444; padding:4px 8px; border-radius:4px; font-size:12px;">🗑️</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  },

  getStatusBadge(status) {
    if (status === 'Concluído') return 'background:#dcfce7; color:#15803d;';
    if (status === 'Em Andamento') return 'background:#dbeafe; color:#1e40af;';
    if (status === 'Cancelado') return 'background:#fee2e2; color:#b91c1c;';
    return 'background:#fef3c7; color:#b45309;';
  },

  handleLocalChange() {
    const sel = document.getElementById('culto-local');
    const custom = document.getElementById('culto-local-custom');
    if (!sel || !custom) return;
    if (sel.value === 'OUTRO') { custom.style.display = 'block'; custom.focus(); }
    else { custom.style.display = 'none'; custom.value = ''; }
  },

  handleStatusChange() {
    const status = document.getElementById('culto-status').value;
    const secao = document.getElementById('secao-concluido-detalhes');
    if (!secao) return;
    if (status === 'Concluído') {
      secao.style.display = 'block';
    } else {
      secao.style.display = 'none';
    }
  },

  visualizar(id) {
    const cultos = DB.get('cultos') || [];
    const culto = cultos.find(c => c.id == id);
    if (!culto) return;

    let htmlConcluido = '';
    if (culto.status === 'Concluído') {
      htmlConcluido = `
        <div style="margin-top:15px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:15px;">
          <h4 style="margin:0 0 10px 0; color:#1e293b; font-size:15px; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">📋 Ordem do Culto & Estatística de Presença</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; font-size:13px;">
            <div>
              <strong>Ordem / Programação Litúrgica:</strong>
              <p style="white-space:pre-wrap; background:#fff; padding:10px; border:1px solid #e2e8f0; border-radius:4px; margin-top:5px; color:#334155;">${culto.ordem || 'N/A'}</p>
            </div>
            <div>
              <strong>Estatística de Presença:</strong>
              <div style="background:#fff; padding:10px; border:1px solid #e2e8f0; border-radius:4px; margin-top:5px;">
                <div>👥 Total Presentes: <strong>${culto.presencaTotal || 0}</strong></div>
                <div>👨 Homens: <strong>${culto.presencaHomens || 0}</strong></div>
                <div>👩 Mulheres: <strong>${culto.presencaMulheres || 0}</strong></div>
                <div>🧒 Crianças: <strong>${culto.presencaCriancas || 0}</strong></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    document.getElementById('culto-modal-conteudo').innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px; font-size:14px; color:#334155;">
        <div style="background:#f8fafc; padding:15px; border-radius:6px; border-left:4px solid #2563eb;">
          <h3 style="margin:0 0 5px 0; font-size:18px; color:#1e293b;">${culto.titulo}</h3>
          <span style="font-size:12px; font-weight:bold; color:#2563eb; text-transform:uppercase;">${culto.categoria} | Departamento:${culto.departamento || 'Geral'}</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; background:#fff; border:1px solid #e2e8f0; padding:15px; border-radius:6px;">
          <div><strong>📅 Data:</strong> ${culto.data}</div>
          <div><strong>⏰ Hora:</strong> ${culto.hora || '--:--'}</div>
          <div><strong>📍 Local:</strong> ${culto.local}</div>
          <div><strong>📊 Status:</strong> ${culto.status}</div>
          <div><strong>🎤 Pregador:</strong> ${culto.pregador || 'N/A'}</div>
          <div><strong>👤 Dirigente:</strong> ${culto.dirigente || 'N/A'}</div>
        </div>
        ${htmlConcluido}
      </div>
    `;
    document.getElementById('culto-modal-visualizar').style.display = 'flex';
  },

  fecharModalVisualizar() {
    document.getElementById('culto-modal-visualizar').style.display = 'none';
  },

  toggleForm() {
    this.editandoId = null;
    this.formVisible = !this.formVisible;
    this.render();
  },

  carregarEdicao(id) {
    const cultos = DB.get('cultos') || [];
    const culto = cultos.find(c => c.id == id);
    if (!culto) return;

    this.editandoId = culto.id;
    this.formVisible = true;
    this.render();

    document.getElementById('culto-titulo').value = culto.titulo || '';
    document.getElementById('culto-categoria').value = culto.categoria || 'Culto Normal';
    document.getElementById('culto-data').value = culto.data || '';
    document.getElementById('culto-hora').value = culto.hora || '';
    document.getElementById('culto-departamento').value = culto.departamento || 'Geral';
    document.getElementById('culto-pregador').value = culto.pregador || '';
    document.getElementById('culto-dirigente').value = culto.dirigente || '';
    document.getElementById('culto-status').value = culto.status || 'Agendado';

    const secao = document.getElementById('secao-concluido-detalhes');
    if (culto.status === 'Concluído') {
      secao.style.display = 'block';
      document.getElementById('culto-ordem').value = culto.ordem || '';
      document.getElementById('culto-presenca-total').value = culto.presencaTotal || 0;
      document.getElementById('culto-presenca-homens').value = culto.presencaHomens || 0;
      document.getElementById('culto-presenca-mulheres').value = culto.presencaMulheres || 0;
      document.getElementById('culto-presenca-criancas').value = culto.presencaCriancas || 0;
    } else {
      secao.style.display = 'none';
    }
  },

  cancelarEdicao() {
    this.editandoId = null;
    this.formVisible = false;
    this.render();
  },

  save() {
    const titulo = document.getElementById('culto-titulo').value.trim();
    const categoria = document.getElementById('culto-categoria').value;
    const data = document.getElementById('culto-data').value;
    const hora = document.getElementById('culto-hora').value;
    const local = document.getElementById('culto-local').value;
    const departamento = document.getElementById('culto-departamento').value;
    const pregador = document.getElementById('culto-pregador').value.trim();
    const dirigente = document.getElementById('culto-dirigente').value.trim();
    const status = document.getElementById('culto-status').value;

    if (!titulo || !data) return alert('Preencha o título e a data.');

    let ordem = '';
    let presencaTotal = 0, presencaHomens = 0, presencaMulheres = 0, presencaCriancas = 0;

    if (status === 'Concluído') {
      ordem = document.getElementById('culto-ordem').value.trim();
      presencaTotal = parseInt(document.getElementById('culto-presenca-total').value) || 0;
      presencaHomens = parseInt(document.getElementById('culto-presenca-homens').value) || 0;
      presencaMulheres = parseInt(document.getElementById('culto-presenca-mulheres').value) || 0;
      presencaCriancas = parseInt(document.getElementById('culto-presenca-criancas').value) || 0;
    }

    const dados = { 
      titulo, categoria, data, hora, local, departamento, pregador, dirigente, status,
      ordem, presencaTotal, presencaHomens, presencaMulheres, presencaCriancas
    };

    if (this.editandoId) {
      DB.update('cultos', this.editandoId, dados);
    } else {
      DB.add('cultos', { id: Date.now().toString(), ...dados });
    }

    this.editandoId = null;
    this.formVisible = false;
    this.render();
  },

  filter() {
    const termo = (document.getElementById('filtro-termo').value || '').toLowerCase();
    const cat = document.getElementById('filtro-categoria').value;
    const stat = document.getElementById('filtro-status').value;
    const dep = document.getElementById('filtro-departamento').value;
    const dataIni = document.getElementById('filtro-data-inicio').value;
    const dataFim = document.getElementById('filtro-data-fim').value;

    const cultos = DB.get('cultos') || [];
    const filtrados = cultos.filter(c => {
      const matchTermo = !termo || (c.titulo && c.titulo.toLowerCase().includes(termo)) || (c.pregador && c.pregador.toLowerCase().includes(termo)) || (c.local && c.local.toLowerCase().includes(termo));
      const matchCat = !cat || c.categoria === cat;
      const matchStat = !stat || c.status === stat;
      const matchDep = !dep || (c.departamento || 'Geral') === dep;
      const matchDataIni = !dataIni || (c.data && c.data >= dataIni);
      const matchDataFim = !dataFim || (c.data && c.data <= dataFim);

      return matchTermo && matchCat && matchStat && matchDep && matchDataIni && matchDataFim;
    });

    document.getElementById('cultos-table-body').innerHTML = this.renderRows(filtrados);
    const contador = document.getElementById('contador-registos-filtro');
    if (contador) {
      contador.innerText = `Mostrando ${filtrados.length} de${cultos.length} registos`;
    }
  }
};

if (window.AppRouter && typeof window.AppRouter.register === 'function') {
  window.AppRouter.register('cultos', CultosModule);
}