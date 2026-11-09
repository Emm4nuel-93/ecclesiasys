const PatrimonioModule = {
  filtroTexto: '',
  filtroCategoria: 'TODAS',
  filtroEstado: 'TODOS',
  mediaStream: null,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-patrimonio');
    if (!container) return;

    let patrimonio = DB.get('patrimonio') || [];

    // Cálculo dos indicadores dos cards
    const totalItens = patrimonio.reduce((acc, i) => acc + (parseInt(i.quantidade) || 1), 0);
    const bomEstado = patrimonio.filter(i => i.estado === 'Bom' || i.estado === 'Bom Estado').reduce((acc, i) => acc + (parseInt(i.quantidade) || 1), 0);
    const emManutencao = patrimonio.filter(i => i.estado === 'Em Manutenção').reduce((acc, i) => acc + (parseInt(i.quantidade) || 1), 0);
    const danificados = patrimonio.filter(i => i.estado === 'Danificado' || i.estado === 'Danificado / Trocar').reduce((acc, i) => acc + (parseInt(i.quantidade) || 1), 0);

    // Filtros
    if (this.filtroTexto.trim() !== '') {
      const txt = this.filtroTexto.toLowerCase();
      patrimonio = patrimonio.filter(p => p.nome.toLowerCase().includes(txt) || (p.codigo && p.codigo.toLowerCase().includes(txt)));
    }
    if (this.filtroCategoria !== 'TODAS') {
      patrimonio = patrimonio.filter(p => p.categoria === this.filtroCategoria);
    }
    if (this.filtroEstado !== 'TODOS') {
      patrimonio = patrimonio.filter(p => p.estado === this.filtroEstado);
    }

    const categoriasExistentes = [...new Set((DB.get('patrimonio') || []).map(p => p.categoria).filter(Boolean))];

    container.innerHTML = `
      <!-- Cabeçalho -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="margin:0; font-size:1.5rem; color:var(--text-main, #1e293b);">🏛 Gestão de Património e Inventário</h2>
          <p style="margin:4px 0 0 0; color:var(--text-muted, #64748b); font-size:13px;">Controlo detalhado de equipamentos de som, instrumentos, mobiliário e imóveis.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-primary" style="width:auto; padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer;" onclick="PatrimonioModule.imprimirInventario()">
            🖨️ Imprimir Inventário
          </button>
          <button class="btn-primary" style="width:auto; padding:10px 18px; background:#16a34a; color:#fff; border:none; border-radius:8px; font-weight:600; cursor:pointer;" onclick="PatrimonioModule.openModal()">
            ＋ Adicionar Item ao Património
          </button>
        </div>
      </div>

      <!-- CARDS INFORMATIVOS -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px;">
        <div style="background:#fff; padding:18px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">TOTAL DE ITENS</span>
          <h2 style="font-size:24px; margin-top:6px; color:#2563eb;">${totalItens}</h2>
        </div>
        <div style="background:#fff; padding:18px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:11px; font-weight:700; color:#16a34a; text-transform:uppercase;">EM BOM ESTADO</span>
          <h2 style="font-size:24px; margin-top:6px; color:#16a34a;">${bomEstado}</h2>
        </div>
        <div style="background:#fff; padding:18px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:11px; font-weight:700; color:#d97706; text-transform:uppercase;">EM MANUTENÇÃO</span>
          <h2 style="font-size:24px; margin-top:6px; color:#d97706;">${emManutencao}</h2>
        </div>
        <div style="background:#fff; padding:18px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0);">
          <span style="font-size:11px; font-weight:700; color:#dc2626; text-transform:uppercase;">DANIFICADO / TROCAR</span>
          <h2 style="font-size:24px; margin-top:6px; color:#dc2626;">${danificados}</h2>
        </div>
      </div>

      <!-- BARRA DE FILTROS -->
      <div style="background:#fff; padding:15px; border-radius:12px; border:1px solid var(--border-color, #e2e8f0); margin-bottom:20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <input type="text" placeholder="🔍 Pesquisar por nome ou código..." value="${this.filtroTexto}" oninput="PatrimonioModule.filtroTexto = this.value; PatrimonioModule.render();" style="flex:1; min-width:200px; padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">

        <select onchange="PatrimonioModule.filtroCategoria = this.value; PatrimonioModule.render();" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
          <option value="TODAS">Todas as Categorias</option>
          ${categoriasExistentes.map(c => `<option value="${c}" ${this.filtroCategoria === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>

        <select onchange="PatrimonioModule.filtroEstado = this.value; PatrimonioModule.render();" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
          <option value="TODOS">Todos os Estados</option>
          <option value="Bom" ${this.filtroEstado === 'Bom' ? 'selected' : ''}>Bom Estado</option>
          <option value="Em Manutenção" ${this.filtroEstado === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
          <option value="Danificado" ${this.filtroEstado === 'Danificado' ? 'selected' : ''}>Danificado / Trocar</option>
        </select>
      </div>

      <!-- TABELA DE PATRIMÓNIO -->
      <div style="background:#fff; border-radius:12px; border:1px solid var(--border-color, #e2e8f0); overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid var(--border-color, #e2e8f0); color:#64748b; font-size:11px; text-transform:uppercase;">
              <th style="padding:12px 16px;">FOTO / ITEM</th>
              <th style="padding:12px 16px;">CATEGORIA</th>
              <th style="padding:12px 16px;">QTD</th>
              <th style="padding:12px 16px;">LOCALIZAÇÃO</th>
              <th style="padding:12px 16px;">ESTADO</th>
              <th style="padding:12px 16px; text-align:right;">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            ${patrimonio.length === 0 ? `
              <tr><td colspan="6" style="padding:24px; text-align:center; color:#94a3b8;">Nenhum item patrimonial registado.</td></tr>
            ` : patrimonio.map(item => `
              <tr style="border-bottom: 1px solid var(--border-color, #e2e8f0);">
                <td style="padding:12px 16px; display:flex; align-items:center; gap:12px;">
                  <img src="${item.imagem || 'assets/img/default-item.png'}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\'/><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'/><path d=\'21 15l-5-5L5 21\'/></svg>'" style="width:42px; height:42px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0; background:#f8fafc;">
                  <div>
                    <strong style="display:block; color:#1e293b;">${item.nome}</strong>
                    <small style="color:#64748b; font-size:11px;">Cód: ${item.codigo || '#'+item.id}</small>
                  </div>
                </td>
                <td style="padding:12px 16px; font-weight:500;">${item.categoria || 'Geral'}</td>
                <td style="padding:12px 16px; font-weight:bold;">${item.quantidade || 1}</td>
                <td style="padding:12px 16px;">${item.localizacao || 'Igreja Sede'}</td>
                <td style="padding:12px 16px;">
                  <span style="padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; ${this.getBadgeStyle(item.estado)}">
                    ${item.estado || 'Bom'}
                  </span>
                </td>
                <td style="padding:12px 16px; text-align:right;">
                  <div style="display:inline-flex; gap:6px;">
                    <button onclick="PatrimonioModule.visualizar('${item.id}')" title="Ver Detalhes" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;">👁️ Ver</button>
                    <button onclick="PatrimonioModule.openModal('${item.id}')" title="Editar Item" style="background:#0ea5e9; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;">✏️ Editar</button>
                    <button onclick="PatrimonioModule.imprimirFicha('${item.id}')" title="Imprimir Ficha" style="background:#64748b; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;">🖨️</button>
                    <button onclick="PatrimonioModule.remover('${item.id}')" title="Remover Item" style="background:#ef4444; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  getBadgeStyle(estado) {
    if (estado === 'Em Manutenção') return 'background:#fef3c7; color:#d97706;';
    if (estado === 'Danificado' || estado === 'Danificado / Trocar') return 'background:#fee2e2; color:#dc2626;';
    return 'background:#dcfce7; color:#15803d;';
  },

  openModal(id = null) {
    let modal = document.getElementById('modal-patrimonio');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-patrimonio';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; padding:15px; overflow-y:auto;';
      document.body.appendChild(modal);
    }

    const patrimonio = DB.get('patrimonio') || [];
    const item = id ? patrimonio.find(p => String(p.id) === String(id)) : null;

    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:100%; max-width:550px; box-shadow:0 10px 25px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
        <h3 style="margin-bottom:15px; color:#1e293b;">${id ? 'Editar Item de Património' : 'Registar Item de Património'}</h3>
        
        <input type="hidden" id="pat-id" value="${id || ''}">
        <input type="hidden" id="pat-img-base64" value="${item ? (item.imagem || '') : ''}">

        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Nome do Item / Equipamento</label>
          <input type="text" id="pat-nome" value="${item ? item.nome : ''}" placeholder="Ex: Mesa de Som Yamaha 16 Canais" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;" required>
        </div>

        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Categoria</label>
          <select id="pat-categoria" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
            <option value="Equipamento de Som / Vídeo" ${item && item.categoria === 'Equipamento de Som / Vídeo' ? 'selected' : ''}>Equipamento de Som / Vídeo</option>
            <option value="Instrumentos Musicais" ${item && item.categoria === 'Instrumentos Musicais' ? 'selected' : ''}>Instrumentos Musicais</option>
            <option value="Mobiliário & Cadeiras" ${item && item.categoria === 'Mobiliário & Cadeiras' ? 'selected' : ''}>Mobiliário & Cadeiras</option>
            <option value="Climatização & Iluminação" ${item && item.categoria === 'Climatização & Iluminação' ? 'selected' : ''}>Climatização & Iluminação</option>
            <option value="Informática & Redes" ${item && item.categoria === 'Informática & Redes' ? 'selected' : ''}>Informática & Redes</option>
            <option value="Imóveis & Instalações" ${item && item.categoria === 'Imóveis & Instalações' ? 'selected' : ''}>Imóveis & Instalações</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Quantidade</label>
            <input type="number" id="pat-qtd" value="${item ? item.quantidade : 1}" min="1" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Estado do Item</label>
            <select id="pat-estado" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
              <option value="Bom" ${item && (item.estado === 'Bom' || item.estado === 'Bom Estado') ? 'selected' : ''}>Bom Estado</option>
              <option value="Em Manutenção" ${item && item.estado === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
              <option value="Danificado" ${item && (item.estado === 'Danificado' || item.estado === 'Danificado / Trocar') ? 'selected' : ''}>Danificado / Trocar</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Localização na Igreja</label>
          <input type="text" id="pat-localizacao" value="${item ? item.localizacao : ''}" placeholder="Ex: Púpito, Sala de Som, Gabinete Pastoral" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">
        </div>

        <div style="margin-bottom:12px;">
          <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">Descrição / Observações Técnicas</label>
          <textarea id="pat-descricao" rows="3" placeholder="Insira detalhes como número de série, especificações técnicas ou historial..." style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;">${item && item.descricao ? item.descricao : ''}</textarea>
        </div>

        <!-- ÁREA DE CAPTURA / UPLOAD DE IMAGEM -->
        <div style="margin-bottom:15px; border:1px dashed #cbd5e1; padding:12px; border-radius:8px; text-align:center;">
          <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:8px;">Fotografia do Equipamento</label>
          
          <div id="camera-preview-container" style="display:none; margin-bottom:10px;">
            <video id="webcam-video" autoplay playsinline style="width:100%; max-height:180px; border-radius:6px; background:#000;"></video>
            <button type="button" onclick="PatrimonioModule.capturarFotoCam()" style="margin-top:6px; padding:6px 12px; background:#16a34a; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px;">📸 Tirar Fotografia</button>
          </div>

          <div id="img-preview-wrapper" style="margin-bottom:8px;">
            <img id="pat-preview" src="${item && item.imagem ? item.imagem : ''}" style="max-height:120px; border-radius:6px; border:1px solid #e2e8f0; display:${item && item.imagem ? 'inline-block' : 'none'};">
          </div>

          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <label style="padding:7px 14px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; cursor:pointer;">
              📁 Carregar Imagem
              <input type="file" accept="image/*" onchange="PatrimonioModule.handleFileUpload(event)" style="display:none;">
            </label>
            <button type="button" onclick="PatrimonioModule.iniciarWebcam()" style="padding:7px 14px; background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; border-radius:6px; font-size:12px; cursor:pointer;">
              📷 Abrir Câmara
            </button>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button onclick="PatrimonioModule.fecharModal()" style="padding:10px 16px; border:1px solid #cbd5e1; background:#fff; border-radius:6px; cursor:pointer;">Cancelar</button>
          <button onclick="PatrimonioModule.save()" style="padding:10px 20px; background:#2563eb; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Guardar</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  },

  fecharModal() {
    this.pararWebcam();
    const modal = document.getElementById('modal-patrimonio');
    if (modal) modal.style.display = 'none';
  },

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        document.getElementById('pat-img-base64').value = base64;
        const imgPrev = document.getElementById('pat-preview');
        imgPrev.src = base64;
        imgPrev.style.display = 'inline-block';
      };
      reader.readAsDataURL(file);
    }
  },

  async iniciarWebcam() {
    const container = document.getElementById('camera-preview-container');
    const video = document.getElementById('webcam-video');
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = this.mediaStream;
      container.style.display = 'block';
    } catch (err) {
      alert('Não foi possível aceder à câmara do dispositivo.');
    }
  },

  capturarFotoCam() {
    const video = document.getElementById('webcam-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64 = canvas.toDataURL('image/jpeg');
    document.getElementById('pat-img-base64').value = base64;
    
    const imgPrev = document.getElementById('pat-preview');
    imgPrev.src = base64;
    imgPrev.style.display = 'inline-block';

    this.pararWebcam();
  },

  pararWebcam() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    const container = document.getElementById('camera-preview-container');
    if (container) container.style.display = 'none';
  },

  save() {
    const id = document.getElementById('pat-id').value;
    const nome = document.getElementById('pat-nome').value.trim();
    const categoria = document.getElementById('pat-categoria').value;
    const quantidade = parseInt(document.getElementById('pat-qtd').value) || 1;
    const estado = document.getElementById('pat-estado').value;
    const localizacao = document.getElementById('pat-localizacao').value.trim();
    const descricao = document.getElementById('pat-descricao').value.trim();
    const imagem = document.getElementById('pat-img-base64').value;

    if (!nome) return alert('Por favor, introduza o nome do equipamento.');

    const patrimonio = DB.get('patrimonio') || [];

    if (id) {
      const index = patrimonio.findIndex(p => String(p.id) === String(id));
      if (index !== -1) {
        patrimonio[index] = {
          ...patrimonio[index],
          nome,
          categoria,
          quantidade,
          estado,
          localizacao,
          descricao,
          imagem
        };
      }
    } else {
      const novoItem = {
        id: Date.now().toString(),
        codigo: '#' + Math.floor(100000000 + Math.random() * 900000000),
        nome,
        categoria,
        quantidade,
        estado,
        localizacao,
        descricao,
        imagem
      };
      patrimonio.push(novoItem);
    }

    DB.set('patrimonio', patrimonio);
    this.fecharModal();
    this.render();
  },

  remover(id) {
    if (confirm('Tem a certeza que deseja remover este item do património?')) {
      const patrimonio = DB.get('patrimonio') || [];
      const novoPatrimonio = patrimonio.filter(p => String(p.id) !== String(id));
      DB.set('patrimonio', novoPatrimonio);
      this.render();
    }
  },

  visualizar(id) {
    const patrimonio = DB.get('patrimonio') || [];
    const item = patrimonio.find(p => String(p.id) === String(id));
    if (!item) return;

    let modal = document.getElementById('modal-patrimonio-view');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-patrimonio-view';
      modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000; padding:15px;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:#fff; padding:25px; border-radius:12px; width:100%; max-width:480px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-top:0; color:#1e293b;">Detalhes do Equipamento</h3>
        
        ${item.imagem ? `<div style="text-align:center; margin-bottom:15px;"><img src="${item.imagem}" style="max-height:180px; border-radius:8px; border:1px solid #e2e8f0;"></div>` : ''}

        <table style="width:100%; font-size:13px; border-collapse:collapse; margin-bottom:15px;">
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Nome:</td><td>${item.nome}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Código:</td><td>${item.codigo || '#'+item.id}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Categoria:</td><td>${item.categoria}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Quantidade:</td><td>${item.quantidade}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Localização:</td><td>${item.localizacao}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Estado:</td><td>${item.estado}</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 0; font-weight:bold; color:#64748b;">Descrição:</td><td>${item.descricao || 'Sem observações.'}</td></tr>
        </table>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button onclick="PatrimonioModule.imprimirFicha('${item.id}')" style="padding:8px 14px; background:#64748b; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px;">🖨️ Imprimir Ficha</button>
          <button onclick="document.getElementById('modal-patrimonio-view').style.display='none'" style="padding:8px 14px; border:1px solid #cbd5e1; background:#fff; border-radius:6px; cursor:pointer; font-size:12px;">Fechar</button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  imprimirFicha(id) {
    const patrimonio = DB.get('patrimonio') || [];
    const item = patrimonio.find(p => String(p.id) === String(id));
    if (!item) return;

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Ficha de Equipamento - ${item.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            .card { border: 2px solid #2563eb; border-radius: 12px; padding: 25px; max-width: 500px; margin: 0 auto; }
            h2 { color: #1e3a8a; margin-top: 0; }
            img { max-width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            td { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
            td.label { font-weight: bold; color: #64748b; width: 35%; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>EcclesiaSys - Ficha de Inventário</h2>
            ${item.imagem ? `<img src="${item.imagem}">` : ''}
            <table>
              <tr><td class="label">Item:</td><td>${item.nome}</td></tr>
              <tr><td class="label">Código:</td><td>${item.codigo || '#'+item.id}</td></tr>
              <tr><td class="label">Categoria:</td><td>${item.categoria}</td></tr>
              <tr><td class="label">Quantidade:</td><td>${item.quantidade}</td></tr>
              <tr><td class="label">Localização:</td><td>${item.localizacao}</td></tr>
              <tr><td class="label">Estado:</td><td>${item.estado}</td></tr>
              <tr><td class="label">Descrição:</td><td>${item.descricao || 'N/A'}</td></tr>
            </table>
          </div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  },

  imprimirInventario() {
    let patrimonio = DB.get('patrimonio') || [];

    if (this.filtroTexto.trim() !== '') {
      const txt = this.filtroTexto.toLowerCase();
      patrimonio = patrimonio.filter(p => p.nome.toLowerCase().includes(txt) || (p.codigo && p.codigo.toLowerCase().includes(txt)));
    }
    if (this.filtroCategoria !== 'TODAS') {
      patrimonio = patrimonio.filter(p => p.categoria === this.filtroCategoria);
    }
    if (this.filtroEstado !== 'TODOS') {
      patrimonio = patrimonio.filter(p => p.estado === this.filtroEstado);
    }

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Relatório de Inventário - EcclesiaSys</title>
          <style>
             body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #1e3a8a; font-size: 22px; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 12px; }
            .summary { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CENTRO MISSIONÁRIO ATOS DOS APÓSTOLOS</h1>
            <a>Relatório Geral do Património</a>
            <p>Gerado em: ${new Date().toLocaleString('pt-AO')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Item</th>
                <th>Categoria</th>
                <th>Qtd</th>
                <th>Localização</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${patrimonio.map(item => `
                <tr>
                  <td>${item.codigo || '#'+item.id}</td>
                  <td>${item.nome}</td>
                  <td>${item.categoria}</td>
                  <td>${item.quantidade}</td>
                  <td>${item.localizacao}</td>
                  <td>${item.estado}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  }
};