const Auth = {
  usuarioAtual: null,

  // Definir permissões de acesso aos módulos por perfil
  permissoes: {
    'Administrador':    ['dashboard', 'membros', 'ministerio', 'cultos', 'financeiro', 'patrimonio', 'relatorios', 'configuracoes', 'departamentos'],
    'Pastor Presidente':['dashboard', 'membros', 'ministerio', 'cultos', 'financeiro', 'patrimonio', 'relatorios', 'configuracoes', 'departamentos'],
    'Secretário':       ['dashboard', 'membros', 'ministerio', 'cultos', 'relatorios', 'patrimonio', 'departamentos'],
    'Tesoureiro':       ['financeiro', 'patrimonio', 'relatorios'],
    'Membro':           ['cultos']
  },

  init() {
    this.verificarSessao();
  },

  verificarSessao() {
    const sessao = localStorage.getItem('ecclesia_session');
    if (sessao) {
      this.usuarioAtual = JSON.parse(sessao);
      this.aplicarDadosUtilizador(this.usuarioAtual);
      this.aplicarRestricoesMenu();

      document.getElementById('auth-screen')?.classList.add('hidden');
      document.getElementById('app-screen')?.classList.remove('hidden');

      if (typeof navigate === 'function') {
        if (this.canAccess('dashboard')) {
          navigate('dashboard');
        } else {
          const primeiroModulo = this.permissoes[this.usuarioAtual.perfil]?.[0] || 'cultos';
          navigate(primeiroModulo);
        }
      }
    } else {
      document.getElementById('app-screen')?.classList.add('hidden');
      document.getElementById('auth-screen')?.classList.remove('hidden');
    }
  },

  login() {
    const userField = document.getElementById('login-user');
    const passField = document.getElementById('login-pass');

    const username = userField ? userField.value.trim().toLowerCase() : '';
    const password = passField ? passField.value : '';

    if (!username || !password) {
      alert('Por favor, informe o utilizador e a palavra-passe.');
      return;
    }

    const usuarios = DB.get('usuarios') || [];
    const conta = usuarios.find(u => u.usuario.toLowerCase() === username && u.senha === password);

    // Validação estrita: se não encontrar o utilizador registado, bloqueia o acesso
    if (!conta) {
      alert('Acesso negado: Utilizador não registado ou palavra-passe incorreta.');
      return;
    }

    const userSession = {
      id: conta.id,
      nome: conta.nome,
      usuario: conta.usuario,
      perfil: conta.perfil,
      inicial: conta.nome.charAt(0).toUpperCase()
    };

    // Credenciais corretas: Dispara o ecrã de carregamento circular e limpa os campos
    this.exibirLoadingScreen(() => {
      localStorage.setItem('ecclesia_session', JSON.stringify(userSession));
      this.usuarioAtual = userSession;

      if (userField) userField.value = '';
      if (passField) passField.value = '';

      this.aplicarDadosUtilizador(userSession);
      this.aplicarRestricoesMenu();

      document.getElementById('auth-screen').classList.add('hidden');
      document.getElementById('app-screen')?.classList.remove('hidden');

      if (typeof navigate === 'function') {
        if (this.canAccess('dashboard')) {
          navigate('dashboard');
        } else {
          const primeiroModulo = this.permissoes[userSession.perfil]?.[0] || 'cultos';
          navigate(primeiroModulo);
        }
      }
    });
  },

  recuperarSenha() {
    const usernameInput = prompt('Insira o seu nome de utilizador (login) para iniciar a recuperação:');
    if (!usernameInput) return;

    const usuarios = DB.get('usuarios') || [];
    const index = usuarios.findIndex(u => u.usuario.toLowerCase() === usernameInput.trim().toLowerCase());

    if (index === -1) {
      alert('Utilizador não encontrado no sistema.');
      return;
    }

    const novaSenha = prompt('Utilizador encontrado. Insira a nova palavra-passe:');
    if (!novaSenha || novaSenha.trim() === '') {
      alert('A operação foi cancelada. A palavra-passe não pode estar vazia.');
      return;
    }

    // Atualiza a senha na base de dados local
    usuarios[index].senha = novaSenha.trim();
    if (typeof DB !== 'undefined' && DB.save) {
      DB.save('usuarios', usuarios);
      alert('Palavra-passe alterada com sucesso! Já pode iniciar sessão com a nova credencial.');
    } else {
      alert('Erro ao guardar a nova palavra-passe na base de dados.');
    }
  },

  exibirLoadingScreen(callback) {
    let loaderOverlay = document.getElementById('app-loader-overlay');
    if (!loaderOverlay) {
      loaderOverlay = document.createElement('div');
      loaderOverlay.id = 'app-loader-overlay';
      loaderOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #0f0c1b; display: flex; flex-direction: column;
        justify-content: center; align-items: center; z-index: 99999;
        transition: opacity 0.4s ease;
      `;
      loaderOverlay.innerHTML = `
        <div style="text-align: center; position: relative; width: 180px; height: 180px; display: flex; justify-content: center; align-items: center;">
          <div style="position: absolute; width: 160px; height: 160px; border-radius: 50%; border: 6px solid rgba(255,255,255,0.08); border-top-color: #00d2ff; border-left-color: #3a7bd5; animation: spinLoader 1s linear infinite;"></div>
          <div style="display: flex; flex-direction: column; align-items: center; z-index: 2;">
            <div id="loader-percentage" style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">0%</div>
            <div style="font-size: 11px; font-weight: 600; color: #00d2ff; text-transform: uppercase; margin-top: 4px; letter-spacing: 2px;">Loading...</div>
          </div>
        </div>
        <div style="font-size: 14px; font-weight: 500; color: #a0a0c0; margin-top: 25px; letter-spacing: 0.5px;">EcclesiaSys - A carregar sistema...</div>
        <style>
          @keyframes spinLoader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(loaderOverlay);
    } else {
      loaderOverlay.style.display = 'flex';
      loaderOverlay.style.opacity = '1';
    }

    let progresso = 0;
    const contadorEl = document.getElementById('loader-percentage');

    const intervalo = setInterval(() => {
      progresso += Math.floor(Math.random() * 8) + 3; 
      if (progresso >= 100) {
        progresso = 100;
        clearInterval(intervalo);
        setTimeout(() => {
          loaderOverlay.style.opacity = '0';
          setTimeout(() => {
            loaderOverlay.style.display = 'none';
            loaderOverlay.style.opacity = '1';
            if (callback) callback();
          }, 300);
        }, 250);
      }
      if (contadorEl) contadorEl.textContent = progresso + '%';
    }, 40);
  },

  logout() {
    if (confirm('Tem a certeza que pretende terminar a sessão?')) {
      localStorage.removeItem('ecclesia_session');
      this.usuarioAtual = null;

      const userField = document.getElementById('login-user');
      const passField = document.getElementById('login-pass');
      if (userField) userField.value = '';
      if (passField) passField.value = '';

      document.getElementById('app-screen').classList.add('hidden');
      document.getElementById('auth-screen')?.classList.remove('hidden');
    }
  },

  canAccess(viewName) {
    if (!this.usuarioAtual || !this.usuarioAtual.perfil) return false;
    const permitidos = this.permissoes[this.usuarioAtual.perfil] || [];
    return permitidos.includes(viewName);
  },

  isAdminSecOrPastor() {
    if (!this.usuarioAtual || !this.usuarioAtual.perfil) return false;
    const perfil = this.usuarioAtual.perfil;
    return perfil === 'Administrador' || perfil === 'Pastor Presidente' || perfil === 'Secretário';
  },

  aplicarRestricoesMenu() {
    if (!this.usuarioAtual) return;

    document.querySelectorAll('.menu-item').forEach(item => {
      const onclickAttr = item.getAttribute('onclick') || '';
      const match = onclickAttr.match(/navigate\('([^']+)'\)/);

      if (match && match[1]) {
        const viewName = match[1];
        if (this.canAccess(viewName)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      }
    });
  },

  aplicarDadosUtilizador(user) {
    const userDisplay = document.getElementById('current-user');
    if (userDisplay) {
      userDisplay.innerHTML = `
        <div style="text-align: right; line-height: 1.2;">
          <strong style="display: block; font-size: 14px; color: #333;">${user.nome}</strong>
          <span style="font-size: 11px; color: #666;">${user.perfil}</span>
        </div>
      `;
    }

    const membros = DB.get('membros') || [];
    const membroCadastrado = membros.find(m => m.nome.toLowerCase() === user.nome.toLowerCase());

    const avatar = document.querySelector('navbar div[style*="border-radius:50%"]') || document.querySelector('.user-profile-avatar');
    
    if (avatar) {
      if (membroCadastrado && membroCadastrado.foto) {
        avatar.innerHTML = `<img src="${membroCadastrado.foto}" alt="${user.nome}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        avatar.innerText = user.inicial;
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});