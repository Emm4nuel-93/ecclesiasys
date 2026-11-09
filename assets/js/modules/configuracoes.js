// Módulo de Configurações do EcclesiaSys - Com Gestão Integrada e Correções de Persistência
window.ConfiguracoesModule = {
  init() {
    this.render();
  },

  obterUsuariosDB() {
    let raw = localStorage.getItem('ecclesia_usuarios') || localStorage.getItem('usuarios');
    let lista = [];
    try { lista = JSON.parse(raw) || []; } catch(e) { lista = []; }
    if (!lista || lista.length === 0) {
      lista = [
        { id: 1, nome: "Emanuel Miguel Capitango Manuel", usuario: "admin", senha: "123", perfil: "Administrador", estado: "Ativo" },
        { id: 2, nome: "Maria Emilia", usuario: "tesouraria", senha: "123", perfil: "Tesouraria", estado: "Ativo" },
        { id: 3, nome: "Secretário Geral", usuario: "secretaria", senha: "123", perfil: "Secretário", estado: "Ativo" },
        { id: 4, nome: "Membro Geral", usuario: "membro", senha: "123", perfil: "Membro", estado: "Ativo" }
      ];
      this.salvarUsuariosDB(lista);
    }
    return lista;
  },

  salvarUsuariosDB(lista) {
    const json = JSON.stringify(lista);
    localStorage.setItem('ecclesia_usuarios', json);
    localStorage.setItem('usuarios', json);
    if (window.DB && window.DB.save) {
      DB.save('usuarios', lista);
      DB.save('ecclesia_usuarios', lista);
    }
  },

  render() {
    const container = document.getElementById('view-configuracoes');
    if (!container) return;

    const temaAtual = localStorage.getItem('ecclesia_theme') || 'light';
    const sessaoUser = JSON.parse(localStorage.getItem('ecclesia_usuario_logado') || '{}');

    container.innerHTML = `
      <div style="padding: 20px;">
        <div style="margin-bottom: 25px;">
          <h1 style="font-size: 24px; margin-bottom: 5px; color: var(--text-main);">Configurações do Sistema</h1>
          <p style="color: var(--text-muted); font-size: 14px;">Gerencie os perfis de acesso, parametrizações e identidade da igreja.</p>
        </div>

        <!-- Grelha Principal de Cartões -->
        <div id="config-cards-grid" class="config-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="config-card" onclick="ConfiguracoesModule.openPanel('meu-perfil')" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-main); display: flex; align-items: center; gap: 10px;">👤 Meu Perfil</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Gerencie os seus dados pessoais, foto e palavra-passe.</p>
          </div>
          <div class="config-card" onclick="ConfiguracoesModule.openPanel('igreja')" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-main); display: flex; align-items: center; gap: 10px;">🏛️ Igreja</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Dados institucionais e identidade visual.</p>
          </div>
          ${sessaoUser.perfil === 'Administrador' ? `
          <div class="config-card" onclick="ConfiguracoesModule.openPanel('utilizadores')" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-main); display: flex; align-items: center; gap: 10px;">👥 Utilizadores & Acessos</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Controlo de utilizadores, perfis e bloqueios.</p>
          </div>` : ''}
          <div class="config-card" onclick="ConfiguracoesModule.openPanel('aparencia')" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-main); display: flex; align-items: center; gap: 10px;">🎨 Aparência</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Temas, cores e preferências visuais.</p>
          </div>
          <div class="config-card" onclick="ConfiguracoesModule.openPanel('backup')" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; cursor: pointer;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-main); display: flex; align-items: center; gap: 10px;">💾 Dados & Backup</h3>
            <p style="color: var(--text-muted); font-size: 13px; margin: 0;">Exportação e importação de cópias de segurança.</p>
          </div>
        </div>

        <!-- PAINEL: MEU PERFIL -->
        <div id="config-panel-meu-perfil" class="config-detail-panel" style="display: none; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
            <h2 style="margin: 0; font-size: 20px; color: var(--text-main);">👤 Gestão do Meu Perfil</h2>
            <button onclick="ConfiguracoesModule.closePanel()" style="background: none; border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 12px; border-radius: 6px; cursor: pointer;">← Voltar</button>
          </div>
          <form onsubmit="ConfiguracoesModule.salvarMeuPerfil(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>
              <label style="color: var(--text-main);"><b>Nome Completo:</b></label>
              <input type="text" id="perfil-nome" required style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
            </div>
            <div>
              <label style="color: var(--text-main);"><b>Telefone de Contacto:</b></label>
              <input type="text" id="perfil-telefone" placeholder="Ex: +244 920 000 000" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
            </div>
            <div>
              <label style="color: var(--text-main);"><b>URL da Foto de Perfil:</b></label>
              <input type="text" id="perfil-foto" placeholder="URL da foto de perfil" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
            </div>
            <div>
              <label style="color: var(--text-main);"><b>Nova Palavra-passe:</b></label>
              <input type="password" id="perfil-nova-senha" placeholder="Deixe em branco se não quiser alterar" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
            </div>
            <div style="grid-column: 1 / -1; margin-top: 10px;">
              <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">Atualizar Perfil</button>
            </div>
          </form>
        </div>

        <!-- PAINEL: IGREJA -->
        <div id="config-panel-igreja" class="config-detail-panel" style="display: none; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
            <h2 style="margin: 0; font-size: 20px; color: var(--text-main);">🏛️ Dados da Igreja</h2>
            <button onclick="ConfiguracoesModule.closePanel()" style="background: none; border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 12px; border-radius: 6px; cursor: pointer;">← Voltar</button>
          </div>
          <form id="form-igreja" onsubmit="ConfiguracoesModule.salvarIgreja(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>
              <label style="color: var(--text-main);"><b>Nome da Igreja:</b></label>
              <input type="text" id="igreja-nome" placeholder="Ex: Igreja Cristã" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
            </div>
            <div>
              <label style="color: var(--text-main);"><b>NIF:</b></label>
              <input type="text" id="igreja-nif" placeholder="Ex: 500000000" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
            </div>
            <div style="grid-column: 1 / -1; margin-top: 10px;">
              <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Guardar Dados</button>
            </div>
          </form>
        </div>

        <!-- PAINEL: UTILIZADORES & ACESSOS -->
        <div id="config-panel-utilizadores" class="config-detail-panel" style="display: none; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px;">
            <h2 style="margin: 0; font-size: 20px; color: var(--text-main);">👥 Gestão de Utilizadores e Acessos</h2>
            <button onclick="ConfiguracoesModule.closePanel()" style="background: none; border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 12px; border-radius: 6px; cursor: pointer;">← Voltar</button>
          </div>

          <div style="background: var(--bg-surface); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 25px;">
            <h3 id="form-title-user" style="color: var(--text-main); margin-top:0;">Adicionar / Editar Utilizador</h3>
            <form id="form-user" onsubmit="ConfiguracoesModule.salvarUtilizador(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
              <input type="hidden" id="user-id">
              <div>
                <label style="color: var(--text-main);"><b>Nome Completo:</b></label>
                <input type="text" id="user-nome" required placeholder="Ex: João Paulo" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
              </div>
              <div>
                <label style="color: var(--text-main);"><b>Utilizador (Login):</b></label>
                <input type="text" id="user-username" required placeholder="Ex: jpaulo" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
              </div>
              <div>
                <label style="color: var(--text-main);"><b>Palavra-passe:</b></label>
                <input type="text" id="user-senha" required placeholder="Digite a nova palavra-passe" style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
              </div>
              <div>
                <label style="color: var(--text-main);"><b>Perfil de Acesso:</b></label>
                <select id="user-perfil" required style="width: 100%; padding: 8px; margin-top: 5px; background: var(--bg-surface); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px;">
                  <option value="Administrador">Administrador</option>
                  <option value="Pastor Presidente">Pastor Presidente</option>
                  <option value="Tesouraria">Tesouraria</option>
                  <option value="Secretário">Secretário</option>
                  <option value="Membro">Membro</option>
                </select>
              </div>
              <div style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 10px;">
                <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Guardar Utilizador</button>
                <button type="button" onclick="ConfiguracoesModule.limparFormulario()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancelar</button>
              </div>
            </form>
          </div>

          <div style="background: var(--bg-surface); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);">
            <h3 style="color: var(--text-main); margin-top:0;">Utilizadores Registados</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; text-align: left;">
              <thead>
                <tr style="background: var(--bg-table-header); border-bottom: 2px solid var(--border-color); color: var(--text-main);">
                  <th style="padding: 10px;">Nome</th>
                  <th style="padding: 10px;">Utilizador</th>
                  <th style="padding: 10px;">Perfil</th>
                  <th style="padding: 10px;">Estado</th>
                  <th style="padding: 10px; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody id="lista-usuarios-body"></tbody>
            </table>
          </div>
        </div>

        <!-- PAINEL: APARÊNCIA -->
        <div id="config-panel-aparencia" class="config-detail-panel" style="display: none; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: var(--text-main);">🎨 Aparência</h2>
            <button onclick="ConfiguracoesModule.closePanel()" style="background: none; border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 12px; border-radius: 6px;">← Voltar</button>
          </div>
          <button onclick="ThemeManager.toggleTema(); ConfiguracoesModule.render();" style="padding: 10px 18px; background: var(--bg-table-header); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-weight: 600; cursor: pointer;">
            ${temaAtual === 'dark' ? '☀️ Ativar Modo Claro' : '🌙 Ativar Modo Escuro'}
          </button>
        </div>

        <!-- PAINEL: BACKUP -->
        <div id="config-panel-backup" class="config-detail-panel" style="display: none; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: var(--text-main);">💾 Backup</h2>
            <button onclick="ConfiguracoesModule.closePanel()" style="background: none; border: 1px solid var(--border-color); color: var(--text-main); padding: 6px 12px; border-radius: 6px;">← Voltar</button>
          </div>
          <button onclick="ConfiguracoesModule.exportarBackup()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Exportar Backup (JSON)</button>
        </div>

      </div>
    `;

    this.carregarTabela();
    this.carregarDadosPerfil();
  },

  openPanel(moduleName) {
    const grid = document.getElementById('config-cards-grid');
    if (grid) grid.style.display = 'none';

    document.querySelectorAll('.config-detail-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    const target = document.getElementById('config-panel-' + moduleName);
    if (target) target.style.display = 'block';
  },

  closePanel() {
    document.querySelectorAll('.config-detail-panel').forEach(panel => {
      panel.style.display = 'none';
    });
    const grid = document.getElementById('config-cards-grid');
    if (grid) grid.style.display = 'grid';
  },

  carregarTabela() {
    const tbody = document.getElementById('lista-usuarios-body');
    if (!tbody) return;

    const usuarios = this.obterUsuariosDB();
    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const isBloqueado = u.estado === 'Bloqueado';
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding: 10px; color: var(--text-main); font-weight: 600;">${u.nome}</td>
        <td style="padding: 10px; color: var(--text-main);">${u.usuario}</td>
        <td style="padding: 10px;"><span style="background: var(--bg-table-header); color: var(--text-main); padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${u.perfil}</span></td>
        <td style="padding: 10px;">
          <!-- ESTADO BLOQUEADO PINTADO COM COR LARANJA -->
          <span style="background: ${isBloqueado ? '#f59e0b' : '#10b981'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
            ${isBloqueado ? '🔒 Bloqueado' : '✅ Ativo'}
          </span>
        </td>
        <td style="padding: 10px; text-align: right;">
          <button onclick="ConfiguracoesModule.editarUtilizador(${u.id})" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; margin-right: 4px;">Editar</button>
          
          <!-- BOTÃO ALTERNAR ESTADO BLOQUEAR / DESBLOQUEAR -->
          <button onclick="ConfiguracoesModule.alternarBloqueioUtilizador(${u.id})" style="background: ${isBloqueado ? '#10b981' : '#f59e0b'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: 600; margin-right: 4px;">
            ${isBloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>

          <button onclick="ConfiguracoesModule.eliminarUtilizador(${u.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: 600;">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  salvarUtilizador(event) {
    event.preventDefault();
    const id = document.getElementById('user-id').value;
    const nome = document.getElementById('user-nome').value.trim();
    const usuario = document.getElementById('user-username').value.trim().toLowerCase();
    const senha = document.getElementById('user-senha').value;
    const perfil = document.getElementById('user-perfil').value;

    let usuarios = this.obterUsuariosDB();

    if (id) {
      const idx = usuarios.findIndex(u => Number(u.id) === Number(id));
      if (idx !== -1) {
        usuarios[idx].nome = nome;
        usuarios[idx].usuario = usuario;
        usuarios[idx].senha = senha; // GARANTE A ATUALIZAÇÃO DA SENHA PELO ADMIN
        usuarios[idx].perfil = perfil;
      }
      alert('Utilizador e palavra-passe atualizados com sucesso!');
    } else {
      const novoUser = {
        id: Date.now(),
        nome,
        usuario,
        senha,
        perfil,
        estado: 'Ativo'
      };
      usuarios.push(novoUser);
      alert('Novo utilizador criado com sucesso!');
    }

    this.salvarUsuariosDB(usuarios);
    this.limparFormulario();
    this.carregarTabela();
  },

  editarUtilizador(id) {
    this.openPanel('utilizadores');
    const usuarios = this.obterUsuariosDB();
    const u = usuarios.find(item => Number(item.id) === Number(id));
    if (!u) return;

    document.getElementById('user-id').value = u.id;
    document.getElementById('user-nome').value = u.nome;
    document.getElementById('user-username').value = u.usuario;
    document.getElementById('user-senha').value = u.senha;
    document.getElementById('user-perfil').value = u.perfil;
    document.getElementById('form-title-user').innerText = 'Editar Utilizador';
  },

  alternarBloqueioUtilizador(id) {
    let usuarios = this.obterUsuariosDB();
    const u = usuarios.find(item => Number(item.id) === Number(id));
    if (!u) return;

    const novoEstado = (u.estado === 'Bloqueado') ? 'Ativo' : 'Bloqueado';
    if (confirm(`Tem certeza que deseja alterar o estado de "${u.nome}" para ${novoEstado}?`)) {
      u.estado = novoEstado;
      this.salvarUsuariosDB(usuarios);
      this.carregarTabela();
      alert(`Utilizador "${u.nome}" está agora ${novoEstado.toUpperCase()}!`);
    }
  },

  eliminarUtilizador(id) {
    let usuarios = this.obterUsuariosDB();
    if (confirm('Tem certeza que deseja eliminar este utilizador?')) {
      usuarios = usuarios.filter(u => Number(u.id) !== Number(id));
      this.salvarUsuariosDB(usuarios);
      this.carregarTabela();
    }
  },

  limparFormulario() {
    document.getElementById('form-user').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('form-title-user').innerText = 'Adicionar / Editar Utilizador';
  },

  carregarDadosPerfil() {
    const sessaoUser = JSON.parse(localStorage.getItem('ecclesia_usuario_logado') || '{}');
    if (!sessaoUser.usuario) return;

    if (document.getElementById('perfil-nome')) document.getElementById('perfil-nome').value = sessaoUser.nome || '';
    if (document.getElementById('perfil-telefone')) document.getElementById('perfil-telefone').value = sessaoUser.telefone || '';
    if (document.getElementById('perfil-foto')) document.getElementById('perfil-foto').value = sessaoUser.foto || '';
  },

  salvarMeuPerfil(event) {
    event.preventDefault();
    let sessaoUser = JSON.parse(localStorage.getItem('ecclesia_usuario_logado') || '{}');
    if (!sessaoUser.usuario) return;

    const nome = document.getElementById('perfil-nome').value.trim();
    const telefone = document.getElementById('perfil-telefone').value.trim();
    const foto = document.getElementById('perfil-foto').value.trim();
    const novaSenha = document.getElementById('perfil-nova-senha').value;

    sessaoUser.nome = nome;
    sessaoUser.telefone = telefone;
    sessaoUser.foto = foto;
    if (novaSenha && novaSenha.trim() !== '') {
      sessaoUser.senha = novaSenha.trim();
    }

    // Persiste no localStorage do utilizador logado
    localStorage.setItem('ecclesia_usuario_logado', JSON.stringify(sessaoUser));
    
    // Atualiza a lista principal de utilizadores no DB
    let usuarios = this.obterUsuariosDB();
    const idx = usuarios.findIndex(u => u.usuario.toLowerCase() === sessaoUser.usuario.toLowerCase());
    if (idx !== -1) {
      usuarios[idx] = sessaoUser;
      this.salvarUsuariosDB(usuarios);
    }

    alert('O seu perfil foi atualizado com sucesso!');
    if (window.sincronizarPerfilEmTempoReal) window.sincronizarPerfilEmTempoReal();
  },

  exportarBackup() {
    const backupData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      backupData[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecclesiasys_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }
};