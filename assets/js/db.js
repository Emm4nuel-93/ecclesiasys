// Database Manager - Offline LocalStorage
const DB = {
  get(key) {
    return JSON.parse(localStorage.getItem(`es_${key}`)) || [];
  },

  set(key, data) {
    localStorage.setItem(`es_${key}`, JSON.stringify(data));
  },

  add(key, item) {
    const data = this.get(key);
    item.id = item.id || Date.now();
    
    if (!item.dataCadastro && !item.dataIngresso && !item.data) {
      item.dataCadastro = new Date().toISOString().split('T')[0];
    }

    data.push(item);
    this.set(key, data);
    return item;
  },

  update(key, id, updatedData) {
    const data = this.get(key);
    const index = data.findIndex(i => i.id === id);
    
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedData, id };
      this.set(key, data);
      return data[index];
    }
    return null;
  },

  remove(key, id) {
    const data = this.get(key).filter(i => i.id !== id);
    this.set(key, data);
  },

  // Inicializa dados base caso seja a primeira vez que o sistema abre
  seed() {
    // Utilizadores com Perfis de Acesso
    if (!localStorage.getItem('es_usuarios')) {
      this.set('usuarios', [
        { id: 1, usuario: 'admin', senha: '123', nome: 'Administrador Geral', perfil: 'Administrador' },
        { id: 2, usuario: 'tesouraria', senha: '123', nome: 'Tesoureiro Principal', perfil: 'Tesoureiro' },
        { id: 3, usuario: 'secretaria', senha: '123', nome: 'Secretário Geral', perfil: 'Secretário' },
        { id: 4, usuario: 'membro', senha: '123', nome: 'Membro Geral', perfil: 'Membro' }
      ]);
    }

    if (!localStorage.getItem('es_membros')) {
      this.set('membros', [
        { id: 1, nome: 'Emanuel Miguel C. Manuel', status: 'Ativo', dataCadastro: '2026-01-15' },
        { id: 2, nome: 'Paulina Manuel', status: 'Ativo', dataCadastro: '2026-02-01' }
      ]);
    }

    if (!localStorage.getItem('es_financeiro')) {
      this.set('financeiro', [
        { id: 1, tipo: 'Entrada', descricao: 'Oferta do Culto', valor: 25000, data: '2026-08-20' },
        { id: 2, tipo: 'Saída', descricao: 'Energia / Luz', valor: 10000, data: '2026-08-22' }
      ]);
    }

    if (!localStorage.getItem('es_cultos')) {
      this.set('cultos', [
        { id: 1, titulo: 'Culto de Celebração', categoria: 'Domingo', pregador: 'Pr. Carlos', data: '2026-08-30', status: 'Agendado' }
      ]);
    }
  }
};

// Executa a carga inicial de validação dos dados
DB.seed();