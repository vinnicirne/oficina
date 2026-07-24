const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'frontend-v2', 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Clientes Table
content = content.replace(
  /<table className="data-table">([\s\S]*?)<\/table>/g,
  (match, p1) => {
    if (match.includes('<th>Nome</th>')) {
      return `<table className="data-table hide-on-mobile-table">${p1}</table>
      <div className="mobile-card-list show-on-mobile">
        {clients.map(client => (
          <div key={client._id || client.id} className="mobile-card-item" onClick={() => setSelectedClient(client)}>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Nome:</span>
              <span className="mobile-card-value">{client.nome}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Documento:</span>
              <span className="mobile-card-value">{client.documento}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Telefone:</span>
              <span className="mobile-card-value">{client.telefone}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Perfil:</span>
              <span className="mobile-card-value"><span className={\`badge \${client.creditoAprovado ? 'success' : 'pending'}\`}>{client.creditoAprovado ? 'Aprovado' : 'Em Análise'}</span></span>
            </div>
            <div className="mobile-card-actions" onClick={e => e.stopPropagation()}>
               <button className="btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#3b82f6', width: '100%'}} onClick={() => setEditingClient(client)}>Editar</button>
            </div>
          </div>
        ))}
      </div>`;
    }
    
    // 2. Estoque Table
    if (match.includes('<th>Descrição</th>') && match.includes('<th>Qtd</th>')) {
      return `<table className="data-table hide-on-mobile-table">${p1}</table>
      <div className="mobile-card-list show-on-mobile">
        {inventories.map(item => (
          <div key={item._id || item.id} className="mobile-card-item">
            <div className="mobile-card-row">
              <span className="mobile-card-label">Descrição:</span>
              <span className="mobile-card-value">{item.name || item.descricao}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Categoria:</span>
              <span className="mobile-card-value">{item.type || item.categoria}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Preço:</span>
              <span className="mobile-card-value">R$ {Number(item.price || item.valorVenda).toFixed(2)}</span>
            </div>
            <div className="mobile-card-actions">
               <button className="btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#ef4444', width: '100%'}} onClick={() => handleDelete(item._id || item.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>`;
    }

    // 3. Ordens Table
    if (match.includes('<th>Cliente</th>') && match.includes('<th>Placa/Equip</th>')) {
      return `<table className="data-table hide-on-mobile-table">${p1}</table>
      <div className="mobile-card-list show-on-mobile">
        {repairs.map(repair => {
          const c = clients.find(cl => cl.id === repair.clientId || cl._id === repair.clientId);
          const cName = c ? c.nome : 'Desconhecido';
          const eq = repair.equipmentId || repair.placa || '-';
          const dt = new Date(repair.createdAt).toLocaleDateString();
          return (
          <div key={repair._id || repair.id} className="mobile-card-item" onClick={() => setViewingOS(repair)}>
            <div className="mobile-card-row">
              <span className="mobile-card-label">OS:</span>
              <span className="mobile-card-value">#{String(repair._id || repair.id).slice(-4).toUpperCase()}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Cliente:</span>
              <span className="mobile-card-value">{cName}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Equipamento:</span>
              <span className="mobile-card-value">{eq}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Status:</span>
              <span className="mobile-card-value"><span className={\`badge \${repair.status === 'CONCLUIDO' ? 'success' : repair.status === 'EM_EXECUCAO' ? 'in-progress' : 'pending'}\`}>{repair.status}</span></span>
            </div>
            <div className="mobile-card-actions" onClick={e => e.stopPropagation()}>
               <button className="btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#3b82f6', width: '100%'}} onClick={() => setEditingOS(repair)}>Editar</button>
            </div>
          </div>
        )})}
      </div>`;
    }
    
    // Other tables (transactions, logs, users) can also be easily handled or just let them scroll
    // I'll add a wrapper class for horizontal scroll to all tables just in case
    return `<div style={{overflowX: 'auto'}}><table className="data-table hide-on-mobile-table">${p1}</table></div>`;
  }
);

// We should fix the width of forms/modals to be 100% on mobile.
// We can use the 'width' in styles, replace '500px', '600px', '700px' with '95%' where appropriate in glass-card modals
content = content.replace(/width: '500px'/g, "width: '100%', maxWidth: '500px'");
content = content.replace(/width: '600px'/g, "width: '100%', maxWidth: '600px'");
content = content.replace(/width: '700px'/g, "width: '100%', maxWidth: '700px'");
content = content.replace(/width: '800px'/g, "width: '100%', maxWidth: '800px'");
content = content.replace(/width: '900px'/g, "width: '100%', maxWidth: '900px'");

// Make inputs full width on mobile if they are in display:flex row
// To do this we just ensure flex-wrap in some places if needed, but CSS is usually enough if flex-wrap is added
content = content.replace(/display: 'flex', gap: '1rem'/g, "display: 'flex', gap: '1rem', flexWrap: 'wrap'");

fs.writeFileSync(appTsxPath, content, 'utf8');
console.log('App.tsx transformed for Mobile-First!');
