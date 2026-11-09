const MinisterioModule = {
  init() {
    this.render();
    this.setupModalListener();
  },

  setupModalListener() {
    // Configurações auxiliares de eventos se necessário
  },

  render() {
    const container = document.getElementById('view-ministerio');
    if (!container) return;

    const ministros = DB.get('ministerio') || [];

    const pastoresEvangelistas = ministros.filter(m => m.grau === 'Pastor' || m.grau === 'Evangelista').length;
    const presbiteros = ministros.filter(m => m.grau === 'Presbítero').length;
    const diaconosLideres = ministros.filter(m => ['Diácono', 'Diaconisa', 'Líder', 'Cooperador'].includes(m.grau)).length;

    container.innerHTML = `
      <!-- Cabeçalho com alinhamento vertical centralizado perfeito (align-items: center) -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap;">
        <div>
          <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px;">
            Corpo Ministerial
          </h2>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 0.875rem;">
            Registo e controlo de Pastores, Presbíteros, Diáconos, Evangelistas e Cooperadores.
          </p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button class="btn btn-secondary" onclick="MinisterioModule.imprimirListaGeral()" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background-color: #0284c7; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: background 0.15s; white-space: nowrap;">
            🖨️ Imprimir Lista
          </button>
          <button class="btn btn-primary" onclick="MinisterioModule.openModal()" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background-color: #2563eb; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: background 0.15s; white-space: nowrap;">
            + Novo Ministro
          </button>
        </div>
      </div>

      <!-- Grid de Métricas limpo -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <span style="color: #64748b; font-size: 0.85rem; font-weight: 500;">Pastores / Evangelistas</span>
          <div style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 8px;">${pastoresEvangelistas}</div>
        </div>
        <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <span style="color: #64748b; font-size: 0.85rem; font-weight: 500;">Presbíteros</span>
          <div style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 8px;">${presbiteros}</div>
        </div>
        <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <span style="color: #64748b; font-size: 0.85rem; font-weight: 500;">Diáconos / Líderes / Cooperadores</span>
          <div style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 8px;">${diaconosLideres}</div>
        </div>
      </div>

      <!-- Tabela Principal -->
      <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; color: #1e293b; font-size: 0.9rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">
                <th style="padding: 16px;">Nome Do Ministro</th>
                <th style="padding: 16px;">Cargo / Função</th>
                <th style="padding: 16px;">Contacto</th>
                <th style="padding: 16px;">Consagração</th>
                <th style="padding: 16px;">Estado</th>
                <th style="padding: 16px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${ministros.length === 0 ? `
                <tr>
                  <td colspan="6" style="padding: 32px; text-align: center; color: #64748b;">
                    Nenhum ministro registado no momento.
                  </td>
                </tr>
              ` : ministros.map(m => `
                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 16px; font-weight: 600; color: #2563eb;">${m.nome}</td>
                  <td style="padding: 16px;">
                    <span style="background: #f1f5f9; color: #334155; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; border: 1px solid #e2e8f0;">
                      ${m.grau || '—'}
                    </span>
                  </td>
                  <td style="padding: 16px; color: #475569;">${m.fone || '—'}</td>
                  <td style="padding: 16px; color: #475569;">${m.consagracao || '—'}</td>
                  <td style="padding: 16px;">
                    <span style="display: inline-flex; align-items: center; gap: 6px; background: ${m.estado === 'Inativo' ? '#ffeeef' : '#e6f4ea'}; color: ${m.estado === 'Inativo' ? '#d93025' : '#137333'}; padding: 4px 10px; border-radius: 12px; font-weight: 500; font-size: 0.8rem;">
                      <span style="width: 6px; height: 6px; background: ${m.estado === 'Inativo' ? '#d93025' : '#137333'}; border-radius: 50%;"></span>
                      ${m.estado || 'Ativo'}
                    </span>
                  </td>
                  <td style="padding: 16px; text-align: right;">
                    <div style="display: inline-flex; gap: 6px; justify-content: flex-end;">
                      <button onclick="MinisterioModule.verFicha('${m.id}')" title="Ver Ficha" style="background: #0284c7; border: none; color: #ffffff; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                        👁️ Ficha
                      </button>
                      <button onclick="MinisterioModule.imprimirFicha('${m.id}')" title="Imprimir" style="background: #7c3aed; border: none; color: #ffffff; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                        🖨️
                      </button>
                      <button onclick="MinisterioModule.openModal('${m.id}')" title="Editar" style="background: #2563eb; border: none; color: #ffffff; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                        ✏️
                      </button>
                      <button onclick="MinisterioModule.delete('${m.id}')" title="Eliminar" style="background: #dc2626; border: none; color: #ffffff; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Cadastro / Edição -->
      <div id="modal-ministerio" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 16px;">
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <h3 id="modal-min-title" style="margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 600;">
              Cadastrar Ministro
            </h3>
            <button onclick="MinisterioModule.closeModal()" style="background: none; border: none; color: #64748b; font-size: 1.25rem; cursor: pointer;">&times;</button>
          </div>

          <form id="form-ministerio" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;" onsubmit="MinisterioModule.save(event)">
            <input type="hidden" id="min-id" />

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Selecione o Membro (Apenas Batizados) *</label>
              <select id="min-membro-id" required onchange="MinisterioModule.onSelectMembro(this.value)" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; box-sizing: border-box;"></select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Cargo Ministerial *</label>
                <select id="min-grau" required style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; box-sizing: border-box;">
                  <option value="Pastor">Pastor</option>
                  <option value="Evangelista">Evangelista</option>
                  <option value="Presbítero">Presbítero</option>
                  <option value="Diácono">Diácono</option>
                  <option value="Diaconisa">Diaconisa</option>
                  <option value="Cooperador" selected>Cooperador</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Data Consagração</label>
                <input type="date" id="min-consagracao" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; box-sizing: border-box;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Telefone</label>
                <input type="text" id="min-fone" placeholder="+244 9..." style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Estado</label>
                <select id="min-estado" style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; box-sizing: border-box;">
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px;">Atribuições / Pelouros</label>
              <textarea id="min-atribuicoes" rows="3" placeholder="Ex: Liderança do Departamento de Evangelismo..." style="width: 100%; padding: 10px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; box-sizing: border-box; resize: vertical;"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
              <button type="button" onclick="MinisterioModule.closeModal()" style="padding: 10px 18px; background: #e2e8f0; color: #334155; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Cancelar</button>
              <button type="submit" style="padding: 10px 18px; background: #2563eb; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Guardar Ministro</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Visualizar Ficha do Membro -->
      <div id="modal-ficha-ministerio" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 16px;">
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; width: 100%; max-width: 600px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 600;">
              Ficha Ministerial do Membro
            </h3>
            <button onclick="MinisterioModule.closeFichaModal()" style="background: none; border: none; color: #64748b; font-size: 1.25rem; cursor: pointer;">&times;</button>
          </div>
          
          <div id="conteudo-ficha-membro" style="padding: 24px; color: #334155;"></div>

          <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
            <button onclick="MinisterioModule.closeFichaModal()" style="padding: 10px 18px; background: #e2e8f0; color: #334155; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Fechar</button>
            <button id="btn-print-modal" style="padding: 10px 18px; background: #2563eb; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              🖨️ Imprimir Ficha
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openModal(id = null) {
    const todosMembros = DB.get('membros') || [];
    const membrosBatizados = todosMembros.filter(m => m.isBatizado === true);
    const ministros = DB.get('ministerio') || [];

    // Identifica o membroId do ministro em edição (se houver)
    let membroIdAtual = null;
    if (id !== null && id !== undefined && String(id).trim() !== '') {
      const ministro = ministros.find(m => String(m.id) === String(id));
      if (ministro) {
        membroIdAtual = String(ministro.membroId);
      }
    }

    // Filtra membros batizados: exclui os que já são ministros, permitindo apenas se for o ministro atual em edição
    const membrosDisponiveis = membrosBatizados.filter(m => {
      const jaConsagrado = ministros.some(min => String(min.membroId) === String(m.id));
      const ehOAtual = membroIdAtual && String(m.id) === membroIdAtual;
      return !jaConsagrado || ehOAtual;
    });

    if (membrosDisponiveis.length === 0 && !id) {
      alert("Aviso de Validação:\nNão é possível consagrar novos ministros porque todos os membros batizados já se encontram consagrados ou não existem membros batizados disponíveis.");
      return;
    }

    const modal = document.getElementById('modal-ministerio');
    const title = document.getElementById('modal-min-title');
    const form = document.getElementById('form-ministerio');
    const selectMembro = document.getElementById('min-membro-id');

    if (!modal) return;
    form.reset();

    selectMembro.innerHTML = '<option value="">Selecione um membro batizado...</option>' + 
      membrosDisponiveis.map(m => `<option value="${m.id}">${m.nome} (${m.codigo || 'S/C'})</option>`).join('');

    if (id !== null && id !== undefined && String(id).trim() !== '') {
      title.innerText = 'Editar Ministro';
      const ministro = ministros.find(m => String(m.id) === String(id));
      
      if (ministro) {
        document.getElementById('min-id').value = ministro.id;
        selectMembro.value = ministro.membroId || '';
        document.getElementById('min-grau').value = ministro.grau || 'Cooperador';
        document.getElementById('min-consagracao').value = ministro.consagracao || '';
        document.getElementById('min-fone').value = ministro.fone || '';
        document.getElementById('min-estado').value = ministro.estado || 'Ativo';
        document.getElementById('min-atribuicoes').value = ministro.atribuicoes || '';
      }
    } else {
      title.innerText = 'Cadastrar Ministro';
      document.getElementById('min-id').value = '';
    }

    modal.style.display = 'flex';
  },

  onSelectMembro(membroId) {
    if (!membroId) return;
    const membros = DB.get('membros') || [];
    const membro = membros.find(m => String(m.id) === String(membroId));
    if (membro) {
      const foneInput = document.getElementById('min-fone');
      if (foneInput && membro.fone) {
        foneInput.value = membro.fone;
      }
    }
  },

  closeModal() {
    const modal = document.getElementById('modal-ministerio');
    if (modal) modal.style.display = 'none';
  },

  save(event) {
    event.preventDefault();

    const idInput = document.getElementById('min-id').value;
    const id = idInput ? (isNaN(idInput) ? idInput : Number(idInput)) : null;
    const membroId = document.getElementById('min-membro-id').value;
    const grau = document.getElementById('min-grau').value;
    const consagracao = document.getElementById('min-consagracao').value;
    const fone = document.getElementById('min-fone').value.trim();
    const estado = document.getElementById('min-estado').value;
    const atribuicoes = document.getElementById('min-atribuicoes').value.trim();

    if (!membroId) {
      alert('Por favor, selecione um membro válido.');
      return;
    }

    const ministros = DB.get('ministerio') || [];
    
    const jaExisteNoCargo = ministros.some(m => 
      String(m.membroId) === String(membroId) && 
      m.grau === grau && 
      String(m.id) !== String(id)
    );

    if (jaExisteNoCargo) {
      alert('Aviso: Este membro já se encontra consagrado/cadastrado com este mesmo Cargo / Função.');
      return;
    }

    const membros = DB.get('membros') || [];
    const membro = membros.find(m => String(m.id) === String(membroId));
    if (!membro || !membro.isBatizado) {
      alert('Erro: O membro selecionado não está registado como batizado.');
      return;
    }

    const dadosMinistro = {
      membroId: membro.id,
      nome: membro.nome,
      grau,
      consagracao,
      fone: fone || membro.fone,
      estado,
      atribuicoes
    };

    if (id !== null && id !== '' && String(id) !== 'undefined') {
      DB.update('ministerio', id, dadosMinistro);
    } else {
      DB.add('ministerio', dadosMinistro);
    }

    this.closeModal();
    this.render();
  },

  delete(id) {
    if (confirm('Tem a certeza que deseja remover este ministro?')) {
      const targetId = isNaN(id) ? id : Number(id);
      DB.remove('ministerio', targetId);
      this.render();
    }
  },

  verFicha(id) {
    const ministros = DB.get('ministerio') || [];
    const min = ministros.find(m => String(m.id) === String(id));
    if (!min) return;

    const membros = DB.get('membros') || [];
    const membroCompleto = membros.find(m => String(m.id) === String(min.membroId)) || {};

    const modal = document.getElementById('modal-ficha-ministerio');
    const conteudo = document.getElementById('conteudo-ficha-membro');
    const btnPrint = document.getElementById('btn-print-modal');

    if (!modal || !conteudo) return;

    conteudo.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.95rem;">
        <p><strong>Nome Completo:</strong> <span style="color: #2563eb;">${membroCompleto.nome || min.nome}</span></p>
        <p><strong>Código / Nº Membro:</strong> ${membroCompleto.codigo || '—'}</p>
        <p><strong>Cargo Ministerial:</strong> ${min.grau || '—'}</p>
        <p><strong>Data de Consagração:</strong> ${min.consagracao || '—'}</p>
        <p><strong>Contacto / Telefone:</strong> ${membroCompleto.fone || min.fone || '—'}</p>
        <p><strong>E-mail:</strong> ${membroCompleto.email || '—'}</p>
        <p><strong>Morada:</strong> ${membroCompleto.morada || '—'}</p>
        <p><strong>Estado Ministerial:</strong> ${min.estado || 'Ativo'}</p>
        <p><strong>Atribuições / Pelouros:</strong><br><span style="color: #475569;">${min.atribuicoes || 'Nenhuma atribuída'}</span></p>
      </div>
    `;

    btnPrint.onclick = () => this.imprimirFicha(id);
    modal.style.display = 'flex';
  },

  closeFichaModal() {
    const modal = document.getElementById('modal-ficha-ministerio');
    if (modal) modal.style.display = 'none';
  },

  imprimirFicha(id) {
    const ministros = DB.get('ministerio') || [];
    const min = ministros.find(m => String(m.id) === String(id));
    if (!min) return;

    const membros = DB.get('membros') || [];
    const membroCompleto = membros.find(m => String(m.id) === String(min.membroId)) || {};

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Ficha Ministerial - ${membroCompleto.nome || min.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
            .header h2 { margin: 5px 0; font-size: 13pt; font-weight: normal; color: #334155; }
            .header h3 { margin: 5px 0; font-size: 11pt; font-weight: normal; color: #64748b; }
            .content { font-size: 11pt; line-height: 1.6; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Igreja Evangélica Pentecostal Maranata</h1>
            <h2>Centro Missionário Atos Dos Apóstolos</h2>
            <h3>Secretariado da Direção Central</h3>
            <p style="margin-top: 15px; font-weight: bold; text-transform: uppercase;">Ficha Oficial do Corpo Ministerial</p>
          </div>
          <div class="content">
            <p><strong>Nome Completo:</strong> ${membroCompleto.nome || min.nome}</p>
            <p><strong>Código do Membro:</strong> ${membroCompleto.codigo || '—'}</p>
            <p><strong>Cargo Ministerial:</strong> ${min.grau}</p>
            <p><strong>Data de Consagração:</strong> ${min.consagracao || '—'}</p>
            <p><strong>Telefone / Contacto:</strong> ${membroCompleto.fone || min.fone || '—'}</p>
            <p><strong>E-mail:</strong> ${membroCompleto.email || '—'}</p>
            <p><strong>Morada:</strong> ${membroCompleto.morada || '—'}</p>
            <p><strong>Estado Ministerial:</strong> ${min.estado || 'Ativo'}</p>
            <p><strong>Atribuições / Pelouros:</strong><br>${min.atribuicoes || '—'}</p>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 300);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  },

  imprimirListaGeral() {
    const ministros = DB.get('ministerio') || [];
    const membros = DB.get('membros') || [];

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Lista Geral do Corpo Ministerial</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
            .header h2 { margin: 5px 0; font-size: 13pt; font-weight: normal; color: #334155; }
            .header h3 { margin: 5px 0; font-size: 11pt; font-weight: normal; color: #64748b; }
            .title-doc { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-size: 8.5pt; }
            tr:nth-child(even) { background-color: #f8fafc; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Igreja Evangélica Pentecostal Maranata</h1>
            <h2>Centro Missionário Atos Dos Apóstolos</h2>
            <h3>Secretariado da Direção Central</h3>
          </div>
          <div class="title-doc">Lista Geral do Corpo Ministerial</div>
          <table>
            <thead>
              <tr>
                <th>Nome do Ministro</th>
                <th>Cargo / Função</th>
                <th>Contacto</th>
                <th>Consagração</th>
                <th>Estado</th>
                <th>Atribuições</th>
              </tr>
            </thead>
            <tbody>
              ${ministros.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Nenhum ministro registado.</td>
                </tr>
              ` : ministros.map(m => {
                const membroCompleto = membros.find(x => String(x.id) === String(m.membroId)) || {};
                const telefone = membroCompleto.fone || m.fone || '—';
                return `
                  <tr>
                    <td><strong>${m.nome}</strong></td>
                    <td>${m.grau || '—'}</td>
                    <td>${telefone}</td>
                    <td>${m.consagracao || '—'}</td>
                    <td>${m.estado || 'Ativo'}</td>
                    <td>${m.atribuições || m.atribuicoes || '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <script>
            setTimeout(() => {
              window.print();
            }, 300);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }
};