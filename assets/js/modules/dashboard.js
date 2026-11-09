// ============================================================================
// Módulo Dashboard Principal - EcclesiaSys (Design Atualizado Conforme Modelo)
// ============================================================================

const DashboardModule = {
  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('view-dashboard') || document.getElementById('main-content');
    if (!container) return;

    // Buscar dados reais das bases de dados locais ou valores padrão
    const membros = (typeof DB !== 'undefined' && DB.get) ? (DB.get('membros') || []) : [];
    const cultos = (typeof DB !== 'undefined' && DB.get) ? (DB.get('cultos') || []) : [];
    const patrimonio = (typeof DB !== 'undefined' && DB.get) ? (DB.get('patrimonio') || []) : [];
    const financeiro = (typeof DB !== 'undefined' && DB.get) ? (DB.get('financeiro') || []) : [];

    // Cálculos dos indicadores
    const totalMembrosAtivos = membros.filter(m => !m.estado || m.estado === 'Activo' || m.estado === 'Ativo').length || 1;
    
    // Cálculo do Saldo em Caixa
    let entradas = 0;
    let saidas = 0;
    financeiro.forEach(f => {
      const valor = parseFloat(f.valor) || 0;
      if (f.tipo === 'Entrada' || f.tipo === 'Dízimo' || f.tipo === 'Oferta') {
        entradas += valor;
      } else if (f.tipo === 'Saída' || f.tipo === 'Despesa') {
        saidas += valor;
      }
    });
    const saldoCaixa = entradas - saidas;

    const totalPatrimonio = patrimonio.length || 0;
    const totalCultosEventos = cultos.length || 0;

    const dataHoje = new Date().toLocaleDateString('pt-PT');

    container.innerHTML = `
      <style>
        .dashboard-container {
          padding: 10px 0;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .dashboard-header h1 {
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
        }
        .dashboard-header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        
        /* Grelha dos 4 Cartões Superiores */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }
        @media (max-width: 1024px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Card Estilizado idêntico ao modelo */
        .kpi-card-model {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .kpi-card-model:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .kpi-info-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .kpi-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .kpi-value-purple {
          font-size: 26px;
          font-weight: 800;
          color: #5b21b6;
          line-height: 1.1;
        }
        .kpi-value-green {
          font-size: 24px;
          font-weight: 800;
          color: #16a34a;
          line-height: 1.1;
        }
        .kpi-value-magenta {
          font-size: 24px;
          font-weight: 800;
          color: #9333ea;
          line-height: 1.1;
        }
        .kpi-value-blue {
          font-size: 26px;
          font-weight: 800;
          color: #0284c7;
          line-height: 1.1;
        }

        /* Contentores dos Ícones */
        .kpi-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .icon-bg-purple {
          background-color: #f0f3ff;
          color: #4f46e5;
        }
        .icon-bg-green {
          background-color: #e6f7ed;
          color: #16a34a;
        }
        .icon-bg-magenta {
          background-color: #f7edff;
          color: #9333ea;
        }
        .icon-bg-blue {
          background-color: #e0f2fe;
          color: #0284c7;
        }
      </style>

      <div class="dashboard-container">
        <!-- Top Header -->
        <div class="dashboard-header">
          <div>
            <h1>🏠 Painel Principal</h1>
            <p>Visão geral de membros, finanças e atividades da igreja.</p>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:600; color:#64748b; display:flex; align-items:center; gap:6px;">
            📅 Hoje: ${dataHoje}
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- NOVOS CARTÕES DOS INDICADORES SUPERIORES (CONFORME IMAGEM MODELO) -->
        <!-- ================================================================= -->
        <div class="kpi-grid">
          
          <!-- Card 1: Membros Activos -->
          <div class="kpi-card-model">
            <div class="kpi-info-left">
              <span class="kpi-label">MEMBROS ACTIVOS</span>
              <span class="kpi-value-purple">${totalMembrosAtivos}</span>
            </div>
            <div class="kpi-icon-box icon-bg-purple">
              👥
            </div>
          </div>

          <!-- Card 2: Saldo em Caixa -->
          <div class="kpi-card-model">
            <div class="kpi-info-left">
              <span class="kpi-label">SALDO EM CAIXA</span>
              <span class="kpi-value-green">${saldoCaixa.toLocaleString()} Kz</span>
            </div>
            <div class="kpi-icon-box icon-bg-green">
              💰
            </div>
          </div>

          <!-- Card 3: Total no Património -->
          <div class="kpi-card-model">
            <div class="kpi-info-left">
              <span class="kpi-label">TOTAL NO PATRIMÓNIO</span>
              <span class="kpi-value-magenta">${totalPatrimonio} bens</span>
            </div>
            <div class="kpi-icon-box icon-bg-magenta">
              🏛️
            </div>
          </div>

          <!-- Card 4: Cultos & Eventos -->
          <div class="kpi-card-model">
            <div class="kpi-info-left">
              <span class="kpi-label">CULTOS & EVENTOS</span>
              <span class="kpi-value-blue">${totalCultosEventos}</span>
            </div>
            <div class="kpi-icon-box icon-bg-blue">
              ⛪
            </div>
          </div>

        </div>
        <!-- ================================================================= -->

        <!-- Restante conteúdo do Dashboard (Cultos, Ações Rápidas, Resumo de Caixa e Aniversariantes) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          
          <!-- Coluna Esquerda -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Próximos Cultos -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 700;">📌 Próximos Cultos e Agenda</h3>
                <a href="#cultos" style="font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 600;">Ver Tudo →</a>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 8px;">Data</th>
                    <th style="padding: 8px;">Evento / Culto</th>
                    <th style="padding: 8px;">Pregador</th>
                    <th style="padding: 8px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${cultos.length > 0 ? cultos.slice(0, 4).map(c => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 8px; color: #64748b;">${c.data}</td>
                      <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">${c.titulo}</td>
                      <td style="padding: 10px 8px; color: #64748b;">${c.pregador || 'N/A'}</td>
                      <td style="padding: 10px 8px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">${c.status || 'Agendado'}</span></td>
                    </tr>
                  `).join('') : '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8;">Nenhum evento agendado.</td></tr>'}
                </tbody>
              </table>
            </div>

            <!-- Últimos Cadastros -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 700;">👤 Últimos Cadastros</h3>
                <a href="#membros" style="font-size: 12px; color: #2563eb; text-decoration: none; font-weight: 600;">Ver todos</a>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase;">
                    <th style="padding: 8px;">Nome</th>
                    <th style="padding: 8px;">Cargo / Função</th>
                    <th style="padding: 8px;">Data</th>
                  </tr>
                </thead>
                <tbody>
                  ${membros.length > 0 ? membros.slice(-4).reverse().map(m => `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 8px; font-weight: 600; color: #1e293b;">${m.nome}</td>
                      <td style="padding: 10px 8px; color: #64748b;">${m.atividadesExercidas || 'Membro'}</td>
                      <td style="padding: 10px 8px; color: #64748b;">${m.dataAdmissao || 'N/A'}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="3" style="padding: 15px; text-align: center; color: #94a3b8;">Nenhum membro cadastrado.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Coluna Direita -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Ações Rápidas -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <h3 style="margin: 0 0 15px 0; font-size: 15px; color: #1e293b; font-weight: 700;">⚡ Ações Rápidas</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button onclick="location.hash='#membros'" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">👥 Gerir Membros</button>
                <button onclick="location.hash='#financeiro'" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">💰 Registo Dízimo</button>
                <button onclick="location.hash='#cultos'" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">📅 Agendar Culto</button>
                <button onclick="location.hash='#relatorios'" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">📊 Relatórios</button>
              </div>
            </div>

            <!-- Resumo de Caixa -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <h3 style="margin: 0 0 15px 0; font-size: 15px; color: #1e293b; font-weight: 700;">📊 Resumo de Caixa</h3>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                <span style="color: #64748b;">Entradas:</span>
                <span style="color: #16a34a; font-weight: 700;">+ ${entradas.toLocaleString()} Kz</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
                <span style="color: #64748b;">Saídas:</span>
                <span style="color: #dc2626; font-weight: 700;">- ${saidas.toLocaleString()} Kz</span>
              </div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800;">
                <span style="color: #1e293b;">Saldo Atual:</span>
                <span style="color: #16a34a;">${saldoCaixa.toLocaleString()} Kz</span>
              </div>
            </div>

            <!-- Aniversariantes do Mês -->
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;">
              <h3 style="margin: 0 0 15px 0; font-size: 15px; color: #1e293b; font-weight: 700; text-align: left;">🎂 Aniversariantes do Mês</h3>
              <div style="font-size: 30px; margin-bottom: 8px;">🎂</div>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Sem aniversariantes este mês.</p>
            </div>
          </div>

        </div>
      </div>
    `;
  }
};

if (window.AppRouter && typeof window.AppRouter.register === 'function') {
  window.AppRouter.register('dashboard', DashboardModule);
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof DashboardModule !== 'undefined' && DashboardModule.init) {
    DashboardModule.init();
  }
});