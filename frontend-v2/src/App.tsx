import React, { useState, useEffect } from 'react';
import api from './services/api';
import './index.css';

const Dashboard = ({ businessUnit, users, repairs, clients, onNavigate, onOpenOS }) => {
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const orcamentos = repairs.filter(r => r.status === 'ORCAMENTO' || r.status === 'AGUARDANDO_APROVACAO');
  const emExecucao = repairs.filter(r => r.status === 'EM_EXECUCAO');
  const getClient = (id) => clients.find(u => u.id === id || u._id === id) || {};

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
    if (parts.length !== 3) return null;
    if (dateStr.includes('/')) {
      return { day: parseInt(parts[0], 10), month: parseInt(parts[1], 10), year: parseInt(parts[2], 10) };
    } else {
      return { day: parseInt(parts[2], 10), month: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
    }
  };

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;

  const todaysBirthdays = clients.filter(u => {
    const b = parseDate(u.dataNascimento);
    return b && b.day === currentDay && b.month === currentMonth;
  });

  const getFilteredBirthdays = () => {
    return clients.filter(u => {
      const b = parseDate(u.dataNascimento);
      if (!b) return false;
      let match = true;
      if (filterDay && parseInt(filterDay, 10) !== b.day) match = false;
      if (filterMonth && parseInt(filterMonth, 10) !== b.month) match = false;
      if (filterYear && parseInt(filterYear, 10) !== b.year) match = false;
      return match;
    }).sort((a, b) => {
      const da = parseDate(a.dataNascimento);
      const db = parseDate(b.dataNascimento);
      if (da.month !== db.month) return da.month - db.month;
      return da.day - db.day;
    });
  };

  if (showBirthdays) {
    const list = getFilteredBirthdays();
    return (
      <div className="glass-card" style={{padding: '2rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom: '1.5rem'}}>
          <h3 className="section-title" style={{margin: 0}}>Lista de Aniversariantes</h3>
          <button className="btn-primary" style={{background: 'var(--text-secondary)'}} onClick={() => setShowBirthdays(false)}>⬅️ Voltar</button>
        </div>
        
        <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
          <div>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem'}}>Dia</label>
            <input type="number" placeholder="DD" value={filterDay} onChange={e => setFilterDay(e.target.value)} style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', width: '80px'}} />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem'}}>Mês</label>
            <input type="number" placeholder="MM" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', width: '80px'}} />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem'}}>Ano</label>
            <input type="number" placeholder="AAAA" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', width: '100px'}} />
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <button className="btn-primary" onClick={() => {setFilterDay(''); setFilterMonth(''); setFilterYear('');}}>Limpar</button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data de Nascimento</th>
              <th>Telefone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {list.map(u => {
              const b = parseDate(u.dataNascimento);
              const isToday = b.day === currentDay && b.month === currentMonth;
              return (
                <tr key={u._id} style={{background: isToday ? '#ecfdf5' : 'transparent'}}>
                  <td>
                    <div style={{fontWeight: 600, color: isToday ? 'var(--accent-success)' : 'inherit'}}>
                      {u.firstName} {u.lastName} {isToday && '🎉'}
                    </div>
                  </td>
                  <td>{`${String(b.day).padStart(2, '0')}/${String(b.month).padStart(2, '0')}/${b.year}`}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.email}</td>
                </tr>
              )
            })}
            {list.length === 0 && <tr><td colSpan={4}>Nenhum aniversariante encontrado para os filtros.</td></tr>}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="card-title">Faturamento Mês</div>
          <div className="card-value">R$ 0</div>
          <div className="card-trend trend-up">Integração pendente</div>
        </div>
        <div className="glass-card warning" style={{cursor: 'pointer', transition: 'transform 0.2s', ':hover': {transform: 'translateY(-2px)'}}} onClick={() => onNavigate && onNavigate('ordens')}>
          <div className="card-title">Ordens em Execução</div>
          <div className="card-value">{emExecucao.length}</div>
          <div className="card-trend" style={{color: 'var(--text-secondary)'}}>
            {orcamentos.length} orçamentos aguardando
          </div>
        </div>
        <div className="glass-card" style={{cursor: 'pointer', border: todaysBirthdays.length > 0 ? '1px solid var(--accent-success)' : 'none'}} onClick={() => setShowBirthdays(true)}>
          <div className="card-title">Aniversariantes do Dia</div>
          <div className="card-value" style={{color: todaysBirthdays.length > 0 ? 'var(--accent-success)' : 'var(--text-primary)'}}>{todaysBirthdays.length}</div>
          <div className="card-trend trend-up">Clique para ver e filtrar todos</div>
        </div>
      </div>

      <h3 className="section-title">Últimas Atividades ({businessUnit})</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Veículo</th>
            <th>Placa</th>
            <th>Serviço</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map(r => {
             const client = getClient(r.clientId);
             return (
              <tr key={r._id} style={{cursor: 'pointer'}} onClick={() => onOpenOS && onOpenOS(r)} title="Clique para ver detalhes">
                <td style={{color: 'var(--text-primary)', fontWeight: 600}}>{r._id.slice(-6)}</td>
                <td><div style={{fontWeight: 600}}>{client.firstName} {client.lastName}</div></td>
                <td><div style={{fontWeight: 500, color: 'var(--text-secondary)'}}>{r.equipmentId || '-'}</div></td>
                <td><div style={{fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase'}}>{r.defeitoInformado || '-'}</div></td>
                <td><div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={r.servicoSolicitado} onClick={() => alert(r.servicoSolicitado)}>{r.servicoSolicitado}</div></td>
                <td><span className={`badge ${r.status === 'EM_EXECUCAO' ? 'in-progress' : 'pending'}`}>{r.status}</span></td>
              </tr>
             )
          })}
          {repairs.length === 0 && <tr><td colSpan={4}>Nenhum registro encontrado.</td></tr>}
        </tbody>
      </table>
    </>
  );
};

const ClientCreditProfile = ({ client, onClose, onUpdateClient }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [client]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get(`/transactions?clientId=${client._id || client.id}`);
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (txId) => {
    try {
      await api.put(`/transactions/${txId}/pay`);
      fetchTransactions();
      onUpdateClient(); // refresh client data to update score
    } catch (e) {
      alert('Erro ao processar pagamento');
    }
  };

  const handleUnpay = async (txId) => {
    if(!window.confirm('Tem certeza que deseja desfazer este pagamento? O score do cliente será reajustado.')) return;
    try {
      await api.put(`/transactions/${txId}/unpay`);
      fetchTransactions();
      onUpdateClient();
    } catch (e) {
      alert('Erro ao desfazer pagamento');
    }
  };

  const handleDeleteTx = async (txId) => {
    if(!window.confirm('Tem certeza que deseja excluir esta fatura permanentemente?')) return;
    try {
      await api.delete(`/transactions/${txId}`);
      fetchTransactions();
      onUpdateClient();
    } catch (e) {
      alert('Erro ao excluir fatura');
    }
  };

  const score = client.creditScore || 500;
  const statusColor = score >= 700 ? 'var(--accent-success)' : score < 400 ? 'var(--accent-main)' : '#f59e0b';
  const statusText = score >= 700 ? 'BOM PAGADOR' : score < 400 ? 'MAL PAGADOR' : 'INTERMEDIÁRIO';
  
  const ltv = transactions.filter(t => t.status === 'PAID').reduce((acc, t) => acc + (t.valor || 0), 0);

  return (
    <div className="glass-card" style={{padding: '2rem'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom: '1.5rem'}}>
        <h3 className="section-title" style={{margin: 0}}>Perfil Financeiro: {client.firstName}</h3>
        <button className="btn-primary" style={{background: 'var(--text-secondary)'}} onClick={onClose}>⬅️ Voltar</button>
      </div>

      <div style={{display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 250px', textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: `2px solid ${statusColor}`}}>
          <div style={{fontSize: '3.5rem', fontWeight: 800, color: statusColor}}>{score}</div>
          <div style={{fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)'}}>Score de Crédito</div>
          <div style={{marginTop: '0.8rem', display: 'inline-block', padding: '0.4rem 1.2rem', background: statusColor, color: '#fff', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem'}}>
            {statusText}
          </div>
        </div>
        <div style={{flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.2rem', padding: '1rem'}}>
           <div style={{fontSize: '1.1rem'}}><strong>Status do Cliente:</strong> <span style={{color: client.creditStatus === 'BLOCKED' ? 'var(--accent-main)' : 'var(--accent-success)', fontWeight: 700}}>{client.creditStatus === 'BLOCKED' ? 'BLOQUEADO' : 'ATIVO'}</span></div>
           <div style={{fontSize: '1.1rem'}}><strong>Cliente Recorrente:</strong> {transactions.length > 2 ? 'Sim 🌟' : 'Não'}</div>
           <div style={{fontSize: '1.1rem'}}><strong>LTV (Total Gasto):</strong> R$ {ltv.toFixed(2)}</div>
           <div style={{fontSize: '1.1rem'}}><strong>Vencimento Padrão:</strong> Todo dia {client.diaVencimento || 10}</div>
           {score >= 700 && <div style={{color: 'var(--accent-success)', fontWeight: 600, marginTop: '0.5rem'}}>💡 Sugestão: Este é um excelente cliente, considere aumentar o limite de crédito dele a cada 3 meses!</div>}
           {score < 400 && <div style={{color: 'var(--accent-main)', fontWeight: 600, marginTop: '0.5rem'}}>⚠️ Cuidado: Este cliente possui histórico frequente de atrasos. Não ofereça limite alto.</div>}
        </div>
      </div>

      <h4 style={{marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--text-primary)'}}>Histórico de Faturas e Serviços</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Vencimento</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => {
            const isOverdue = new Date() > new Date(tx.dataVencimento) && tx.status === 'PENDING';
            return (
            <tr key={tx._id || tx.id}>
              <td>{new Date(tx.dataVencimento).toLocaleDateString('pt-BR')}</td>
              <td>{tx.descricao}</td>
              <td style={{fontWeight: 600}}>R$ {tx.valor}</td>
              <td>
                <span className={`badge ${tx.status === 'PAID' ? 'in-progress' : isOverdue ? 'pending' : ''}`} style={isOverdue ? {background: 'var(--accent-main)', color: '#fff'} : tx.status === 'PENDING' ? {background: '#f59e0b', color: '#fff'} : {}}>
                  {tx.status === 'PAID' ? 'PAGO' : isOverdue ? 'EM ATRASO' : 'A PAGAR'}
                </span>
              </td>
              <td style={{display: 'flex', gap: '0.4rem'}}>
                {tx.status === 'PENDING' && (
                  <button className="btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => handlePay(tx._id || tx.id)}>💳 Registrar Pagamento</button>
                )}
                {tx.status === 'PAID' && (
                  <button className="btn-primary" style={{background: '#f59e0b', padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => handleUnpay(tx._id || tx.id)} title="Desfazer Pagamento">↩️ Desfazer</button>
                )}
                <button className="btn-primary" style={{background: '#ef4444', padding: '0.4rem 0.6rem', fontSize: '0.9rem'}} onClick={() => handleDeleteTx(tx._id || tx.id)} title="Excluir Fatura">🗑️</button>
              </td>
            </tr>
          )})}
          {transactions.length === 0 && <tr><td colSpan={5}>Nenhuma movimentação encontrada.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const Clientes = ({ clients, fetchClients }) => {
  const [showModal, setShowModal] = useState(false);
  const [viewingCredit, setViewingCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    limiteCredito: '',
    cnpj: '',
    inscricaoEstadual: '',
    dataNascimento: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    uf: '',
    diaVencimento: '10',
    creditStatus: 'ACTIVE'
  });

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', limiteCredito: '',
      cnpj: '', inscricaoEstadual: '', dataNascimento: '', endereco: '',
      numero: '', complemento: '', bairro: '', cidade: '', cep: '', uf: ''
    });
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      limiteCredito: client.limiteCredito !== undefined ? client.limiteCredito : '',
      cnpj: client.cnpj || '',
      inscricaoEstadual: client.inscricaoEstadual || '',
      dataNascimento: client.dataNascimento || '',
      endereco: client.endereco || '',
      numero: client.numero || '',
      complemento: client.complemento || '',
      bairro: client.bairro || '',
      cidade: client.cidade || '',
      cep: client.cep || '',
      uf: client.uf || '',
      diaVencimento: client.diaVencimento || '10',
      creditStatus: client.creditStatus || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleDelete = async (client) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${client.firstName}?`)) {
      try {
        await api.delete(`/clients/${client.id || client._id}`);
        fetchClients();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir cliente.');
      }
    }
  };

  const handleCepChange = async (e) => {
    let cep = e.target.value.replace(/\D/g, '');
    setFormData({...formData, cep: e.target.value});
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || ''
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');
    try {
      const payload = {
        ...formData,
        limiteCredito: formData.limiteCredito !== '' ? Number(formData.limiteCredito) : 0,
        businessUnit: localStorage.getItem('unit') || 'OFICINA'
      };

      if (editingClient) {
        await api.put(`/clients/${editingClient.id || editingClient._id}`, payload);
        setMensagem('✅ Cliente atualizado com sucesso!');
      } else {
        await api.post('/clients', payload);
        setMensagem('✅ Cliente cadastrado com sucesso!');
      }
      
      fetchClients();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 2000);
    } catch (error) {
      setMensagem(editingClient ? '❌ Erro ao atualizar cliente.' : '❌ Erro ao cadastrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  if (viewingCredit) {
    return <ClientCreditProfile client={viewingCredit} onClose={() => setViewingCredit(null)} onUpdateClient={() => { fetchClients(); setViewingCredit(null); }} />;
  }

  if (showModal) {
    return (
      <div className="glass-card" style={{padding: '2rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom: '1.5rem'}}>
          <h3 className="section-title" style={{margin: 0}}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button className="btn-primary" style={{background: 'var(--text-secondary)'}} onClick={() => { setShowModal(false); resetForm(); }}>⬅️ Voltar</button>
        </div>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <h4 style={{margin: '0 0 -0.5rem 0', color: 'var(--text-secondary)'}}>Dados Pessoais / Contato</h4>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Nome da Empresa / Cliente</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} required />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Contato / Sobrenome</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} required />
            </div>
          </div>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} required />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Telefone / Celular</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>CNPJ / CPF</label>
              <input type="text" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Inscrição Estadual</label>
              <input type="text" value={formData.inscricaoEstadual} onChange={e => setFormData({...formData, inscricaoEstadual: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Data de Nascimento (DD/MM/AAAA)</label>
              <input type="text" placeholder="Ex: 20/05/1990" maxLength={10} value={formData.dataNascimento} onChange={e => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                if (val.length > 5) val = val.substring(0, 5) + '/' + val.substring(5, 9);
                setFormData({...formData, dataNascimento: val});
              }} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
          </div>

          <h4 style={{margin: '1rem 0 -0.5rem 0', color: 'var(--text-secondary)'}}>Endereço</h4>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>CEP</label>
              <input type="text" placeholder="Apenas números" maxLength="9" value={formData.cep} onChange={handleCepChange} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 2}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Cidade</label>
              <input type="text" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>UF</label>
              <input type="text" value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
          </div>
          <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
            <div style={{flex: 2}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Endereço / Logradouro</label>
              <input type="text" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Número</label>
              <input type="text" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
          </div>
          <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Complemento</label>
              <input type="text" value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Bairro</label>
              <input type="text" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
          </div>

          <h4 style={{margin: '1rem 0 -0.5rem 0', color: 'var(--text-secondary)'}}>Financeiro</h4>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Limite de Crédito Inicial (R$)</label>
              <input type="number" value={formData.limiteCredito} onChange={e => setFormData({...formData, limiteCredito: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Dia de Vencimento Padrão</label>
              <input type="number" min="1" max="31" value={formData.diaVencimento} onChange={e => setFormData({...formData, diaVencimento: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Status do Crédito</label>
              <select value={formData.creditStatus} onChange={e => setFormData({...formData, creditStatus: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                <option value="ACTIVE">ATIVO</option>
                <option value="BLOCKED">BLOQUEADO</option>
              </select>
            </div>
          </div>

          {mensagem && (
            <div style={{padding: '1rem', borderRadius: '8px', background: mensagem.includes('✅') ? '#ecfdf5' : '#fef2f2', color: mensagem.includes('✅') ? 'var(--accent-success)' : 'var(--accent-main)', fontWeight: 600}}>
              {mensagem}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{padding: '1rem', marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Salvando...' : editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <h3 className="section-title" style={{margin: 0}}>Gestão de Clientes e Crédito</h3>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Novo Cliente</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Limite de Crédito</th>
            <th style={{textAlign: 'right'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c._id || c.id}>
              <td><div style={{fontWeight: 600}}>{c.firstName} {c.lastName}</div></td>
              <td>{c.email}</td>
              <td>{c.phone || '-'}</td>
              <td style={{fontWeight: 600, color: 'var(--accent-success)'}}>R$ {c.limiteCredito || 0}</td>
              <td style={{textAlign: 'right'}}>
                <button onClick={() => setViewingCredit(c)} style={{background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '10px', fontSize: '1.2rem'}} title="Ver Crédito">💳</button>
                <button onClick={() => handleEdit(c)} style={{background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '10px', fontSize: '1.2rem'}} title="Editar">✏️</button>
                <button onClick={() => handleDelete(c)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem'}} title="Excluir">🗑️</button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && <tr><td colSpan={5}>Nenhum cliente cadastrado.</td></tr>}
        </tbody>
      </table>
    </>
  );
};

const NovaOSModal = ({ clients, inventories, businessUnit, fetchRepairs, onClose, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [novaOSForm, setNovaOSForm] = useState({ clientId: '', equipmentId: '', placa: '', servicos: [], observacao: '', status: 'ORCAMENTO' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateOS = async (e) => {
    e.preventDefault();
    if (!novaOSForm.clientId || novaOSForm.servicos.length === 0) {
      setMensagem('Preencha todos os campos e selecione pelo menos um serviço.');
      return;
    }
    setLoading(true);
    setMensagem('');
    const selectedInventories = (inventories || []).filter(i => novaOSForm.servicos.includes(i.descricao));
    const materiaisList = selectedInventories.map(i => ({
      descricao: i.descricao,
      quantidade: 1,
      precoUnitario: Number(i.valorVenda) || 0,
      total: Number(i.valorVenda) || 0
    }));

    try {
      await api.post(`/clients/${novaOSForm.clientId}/repairs`, {
        equipmentId: novaOSForm.equipmentId,
        defeitoInformado: novaOSForm.placa,
        servicoSolicitado: novaOSForm.servicos.join(', '),
        materiais: materiaisList,
        observacao: novaOSForm.observacao,
        status: novaOSForm.status,
        businessUnit
      });
      setMensagem('✅ Sucesso! Registro criado.');
      fetchRepairs();
      setTimeout(() => { 
        onClose();
        if (novaOSForm.status !== 'EM_EXECUCAO' && onNavigate) {
          onNavigate('orcamentos');
        } else if (novaOSForm.status === 'EM_EXECUCAO' && onNavigate) {
          onNavigate('ordens');
        }
      }, 2000);
    } catch (error) {
      setMensagem('❌ Erro ao criar.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="glass-card" style={{maxWidth: '600px', margin: '0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
           <h3 className="section-title">
             {novaOSForm.status === 'ORCAMENTO' ? 'Criar Novo Orçamento' : 'Criar Nova Ordem de Serviço'}
           </h3>
           <button onClick={onClose} style={{cursor:'pointer', border:'none', background:'none'}}>⬅️ Voltar</button>
        </div>
        <form onSubmit={handleCreateOS}>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Cliente</label>
            <select value={novaOSForm.clientId} onChange={e => setNovaOSForm({...novaOSForm, clientId: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <option value="">Selecione um Cliente</option>
              {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.firstName} {c.lastName}</option>)}
            </select>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Como deseja iniciar?</label>
            <select value={novaOSForm.status} onChange={e => setNovaOSForm({...novaOSForm, status: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              <option value="ORCAMENTO">Orçamento</option>
              <option value="EM_EXECUCAO">Ordem de Serviço</option>
            </select>
          </div>
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
            <div style={{flex: 2}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Veículo (Modelo)</label>
              <input type="text" placeholder="Ex: Toyota Corolla" value={novaOSForm.equipmentId} onChange={e => setNovaOSForm({...novaOSForm, equipmentId: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Placa</label>
              <input type="text" placeholder="DEF-5555" value={novaOSForm.placa} onChange={e => setNovaOSForm({...novaOSForm, placa: e.target.value})} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} />
            </div>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Serviços Solicitados (Pesquise e Adicione)</label>
            
            {/* Input de Busca */}
            <div style={{position: 'relative'}}>
              <input 
                type="text" 
                placeholder="🔍 Digite para buscar um serviço ou peça..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}
              />
              {/* Dropdown de Sugestões */}
              {searchTerm && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', 
                  border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', 
                  maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {(inventories || [])
                    .filter(i => i.descricao.toLowerCase().includes(searchTerm.toLowerCase()) && !novaOSForm.servicos.includes(i.descricao))
                    .map(i => (
                      <div 
                        key={i.id || i._id} 
                        style={{padding: '0.8rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9'}}
                        onClick={() => {
                          setNovaOSForm({...novaOSForm, servicos: [...novaOSForm.servicos, i.descricao]});
                          setSearchTerm('');
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {i.descricao}
                      </div>
                  ))}
                  {(inventories || []).filter(i => i.descricao.toLowerCase().includes(searchTerm.toLowerCase()) && !novaOSForm.servicos.includes(i.descricao)).length === 0 && (
                    <div style={{padding: '0.8rem', color: 'var(--text-secondary)'}}>Nenhum serviço não selecionado encontrado.</div>
                  )}
                </div>
              )}
            </div>

            {/* Pills Selecionados */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem'}}>
              {novaOSForm.servicos.map(s => (
                <div key={s} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                  background: 'var(--accent-main)', color: '#fff'
                }}>
                  {s}
                  <button 
                    type="button" 
                    onClick={() => setNovaOSForm({...novaOSForm, servicos: novaOSForm.servicos.filter(item => item !== s)})}
                    style={{background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', padding: 0, display: 'flex', alignItems: 'center'}}
                    title="Remover"
                  >
                    ×
                  </button>
                </div>
              ))}
              {novaOSForm.servicos.length === 0 && <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Nenhum serviço selecionado.</div>}
            </div>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Observação Escrita (Opcional)</label>
            <textarea value={novaOSForm.observacao} onChange={e => setNovaOSForm({...novaOSForm, observacao: e.target.value})} rows="3" style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} placeholder="Anotações sobre a OS..."></textarea>
          </div>
          {mensagem && (
            <div style={{padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: mensagem.includes('✅') ? '#ecfdf5' : '#fef2f2', color: mensagem.includes('✅') ? 'var(--accent-success)' : 'var(--accent-main)', fontWeight: 600}}>
              {mensagem}
            </div>
          )}
          <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={loading}>
            {loading ? 'Salvando...' : (novaOSForm.status === 'ORCAMENTO' ? 'Criar Orçamento' : 'Criar OS')}
          </button>
        </form>
      </div>
  );
};

const OrcamentoToOS = ({ clients, repairs, fetchRepairs, inventories, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [editingOS, setEditingOS] = useState(null);
  const [showNovaOS, setShowNovaOS] = useState(false);
  const [viewingService, setViewingService] = useState(null);
  const businessUnit = localStorage.getItem('unit') || 'OFICINA';

  const orcamentos = repairs.filter(r => r.status === 'ORCAMENTO');
  const getClient = (id) => clients.find(u => u.id === id || u._id === id) || {};

  const handleApprove = async () => {
    setLoading(true);
    setMensagem('');
    try {
      await api.post(`/clients/${selectedRepair.clientId}/repairs/${selectedRepair._id}/approve`);
      setMensagem('✅ Sucesso! Status alterado para "Em Execução". A cobrança será feita na finalização.');
      fetchRepairs();
    } catch (error) {
      setMensagem('❌ Erro na API: Não foi possível aprovar a OS.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOS = async (repair) => {
    if (window.confirm(`Tem certeza que deseja excluir a OS #${repair._id.slice(-6)}?`)) {
      try {
        await api.delete(`/clients/${repair.clientId}/repairs/${repair._id}`);
        fetchRepairs();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir OS.');
      }
    }
  };

  if (editingOS) {
    return <EditorDeOS repair={editingOS} fetchRepairs={fetchRepairs} inventories={inventories} onClose={() => setEditingOS(null)} />;
  }

  if (showNovaOS) {
    return <NovaOSModal clients={clients} inventories={inventories} businessUnit={businessUnit} fetchRepairs={fetchRepairs} onClose={() => setShowNovaOS(false)} onNavigate={onNavigate} />;
  }

  if (!selectedRepair) {
    return (
      <>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
          <h3 className="section-title" style={{margin: 0}}>Selecione um Orçamento para Aprovar</h3>
          <button className="btn-primary" onClick={() => setShowNovaOS(true)}>+ Novo Orçamento</button>
        </div>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Veículo</th><th>Placa</th><th>Serviço</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            {orcamentos.map(r => {
              const client = getClient(r.clientId);
              return (
                <tr key={r._id} onDoubleClick={() => setSelectedRepair(r)} style={{cursor: 'pointer'}} title="Dê 2 cliques para visualizar">
                  <td style={{fontWeight: 600}}>{r._id.slice(-6)}</td>
                  <td>{client.firstName} {client.lastName}</td>
                  <td style={{fontWeight: 500, color: 'var(--text-secondary)'}}>{r.equipmentId || '-'}</td>
                  <td style={{fontWeight: 700, textTransform: 'uppercase'}}>{r.defeitoInformado || '-'}</td>
                  <td><div className="truncate-cell" title={r.servicoSolicitado} onClick={(e) => { e.stopPropagation(); setViewingService(r); }}>{r.servicoSolicitado}</div></td>
                  <td>
                    <span style={{padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3'}}>
                      Orçamento
                    </span>
                  </td>
                  <td style={{display: 'flex', gap: '0.4rem', whiteSpace: 'nowrap'}}>
                    <button className="btn-primary" style={{background: '#f59e0b', padding: '0.3rem 0.6rem', fontSize: '0.75rem'}} onClick={() => setEditingOS(r)}>✏️ Editar</button>
                    <button className="btn-primary" style={{padding: '0.3rem 0.6rem', fontSize: '0.75rem'}} onClick={() => setSelectedRepair(r)}>👁️ Visualizar</button>
                    <button className="btn-primary" style={{background: '#ef4444', padding: '0.3rem 0.6rem', fontSize: '0.75rem'}} onClick={() => handleDeleteOS(r)} title="Excluir">🗑️</button>
                  </td>
                </tr>
              )
            })}
            {orcamentos.length === 0 && <tr><td colSpan={5}>Nenhum orçamento pendente.</td></tr>}
          </tbody>
        </table>
        
        {viewingService && (
          <div className="modal-overlay" onClick={() => setViewingService(null)}>
            <div className="glass-card" style={{maxWidth: '500px', width: '90%'}} onClick={e => e.stopPropagation()}>
              <h3 className="section-title">Informações do Serviço</h3>
              <div style={{background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem'}}>
                <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.5'}}>{viewingService.servicoSolicitado}</p>
              </div>
              <button className="btn-primary" style={{marginTop: '1.5rem', width: '100%'}} onClick={() => setViewingService(null)}>Fechar</button>
            </div>
          </div>
        )}
      </>
    )
  }

  const client = getClient(selectedRepair.clientId);
  const total = (selectedRepair.materiais || []).reduce((acc, m) => acc + (m.total || 0), 0);

  return (
    <>
      <div style={{display: 'flex', gap: '2rem'}}>
        <div className="glass-card" style={{flex: 1}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
             <h3 className="section-title">Aprovar Orçamento #{selectedRepair._id.slice(-6)}</h3>
             <button onClick={() => setSelectedRepair(null)} style={{cursor:'pointer', border:'none', background:'none'}}>⬅️ Voltar</button>
          </div>
          <div style={{background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
            <p><strong>Cliente:</strong> {client.firstName} {client.lastName}</p>
            <p><strong>Serviço Solicitado:</strong> {selectedRepair.servicoSolicitado}</p>
            <p style={{marginTop: '0.5rem'}}><strong>Valor Total do Orçamento:</strong> R$ {total.toFixed(2)}</p>
          </div>
          
          <div style={{padding: '1rem', border: '1px dashed var(--accent-success)', borderRadius: '8px', marginBottom: '1.5rem', background: '#ecfdf5'}}>
            <p style={{color: 'var(--accent-success)', fontWeight: 600}}>ℹ️ Informação: Nenhuma cobrança é feita nesta etapa.</p>
            <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>O cliente escolherá a forma de pagamento (Pix, Cartão, Dinheiro ou Crédito Interno) somente após a finalização do serviço.</p>
          </div>

          {mensagem && (
            <div style={{padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: mensagem.includes('✅') ? '#ecfdf5' : '#fef2f2', color: mensagem.includes('✅') ? 'var(--accent-success)' : 'var(--accent-main)', fontWeight: 600}}>
              {mensagem}
            </div>
          )}

          <button className="btn-primary" style={{width: '100%', opacity: loading ? 0.7 : 1}} onClick={handleApprove} disabled={loading}>
            {loading ? 'Aprovando no Servidor...' : 'Transformar em OS (Em Execução)'}
          </button>
        </div>
        
        <div className="glass-card" style={{flex: 1}}>
          <h3 className="section-title">Materiais e Mão de Obra</h3>
          <table className="data-table" style={{boxShadow: 'none'}}>
            <thead><tr><th>Item</th><th>Qtd</th><th>Valor Unit.</th></tr></thead>
            <tbody>
              {(selectedRepair.materiais || []).map((m, i) => (
                <tr key={i}>
                  <td>{m.descricao}</td>
                  <td>{m.quantidade}</td>
                  <td>R$ {m.precoUnitario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const PrintableOS = ({ os, client, onBack }) => {
  const total = (os.materiais || []).reduce((acc, m) => acc + (m.total || 0), 0);
  return (
    <div style={{background: '#fff', padding: '2rem', borderRadius: '8px'}}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .sidebar, .navbar { display: none !important; }
        }
      `}</style>
      <div className="no-print" style={{marginBottom: '2rem'}}>
        <button onClick={onBack} className="btn-primary" style={{marginRight: '1rem', background: '#94a3b8'}}>⬅️ Voltar</button>
        <button onClick={() => window.print()} className="btn-primary">🖨️ Imprimir OS</button>
      </div>
      <div className="print-area">
        <h2 style={{borderBottom: '2px solid #000', paddingBottom: '1rem', marginTop: 0}}>Ordem de Serviço #{os._id.slice(-6).toUpperCase()}</h2>
        <div style={{display: 'flex', justifyContent: 'space-between', margin: '2rem 0'}}>
          <div>
            <h4>Dados do Cliente</h4>
            <p style={{margin: '0.2rem 0'}}><strong>Nome:</strong> {client.firstName} {client.lastName}</p>
            <p style={{margin: '0.2rem 0'}}><strong>Email:</strong> {client.email}</p>
            <p style={{margin: '0.2rem 0'}}><strong>Telefone:</strong> {client.phone || '-'}</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <h4>Dados da OS</h4>
            <p style={{margin: '0.2rem 0'}}><strong>Status:</strong> {os.status.replace('_', ' ')}</p>
            <p style={{margin: '0.2rem 0'}}><strong>Data:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div style={{marginBottom: '2rem'}}>
          <h4>Serviço Solicitado</h4>
          <div style={{padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '60px', marginBottom: '1rem'}}>
            {os.servicoSolicitado}
          </div>
          {os.observacao && (
            <>
              <h4>Observação Escrita</h4>
              <div style={{padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '60px'}}>
                {os.observacao}
              </div>
            </>
          )}
        </div>
        <h4>Materiais e Mão de Obra</h4>
        <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '2rem'}}>
          <thead>
            <tr>
              <th style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'left'}}>Item</th>
              <th style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center'}}>Qtd</th>
              <th style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'right'}}>Valor Unit.</th>
              <th style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'right'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(os.materiais || []).map((m, i) => (
              <tr key={i}>
                <td style={{border: '1px solid #ccc', padding: '0.5rem'}}>{m.descricao}</td>
                <td style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center'}}>{m.quantidade}</td>
                <td style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'right'}}>R$ {m.precoUnitario}</td>
                <td style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'right'}}>R$ {m.total}</td>
              </tr>
            ))}
            {(!os.materiais || os.materiais.length === 0) && (
              <tr><td colSpan="4" style={{border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center'}}>Nenhum material adicionado</td></tr>
            )}
          </tbody>
        </table>
        <h3 style={{textAlign: 'right'}}>Total a Pagar: R$ {total.toFixed(2)}</h3>
        
        <div style={{marginTop: '6rem', display: 'flex', justifyContent: 'space-around'}}>
          <div style={{textAlign: 'center', width: '250px'}}>
            <div style={{borderTop: '1px solid #000', paddingTop: '0.5rem'}}>Assinatura do Cliente</div>
          </div>
          <div style={{textAlign: 'center', width: '250px'}}>
            <div style={{borderTop: '1px solid #000', paddingTop: '0.5rem'}}>Assinatura da Loja</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditorDeOS = ({ repair, fetchRepairs, inventories, onClose }) => {
  const [editingOS, setEditingOS] = useState(repair);
  const [novoMaterial, setNovoMaterial] = useState({ descricao: '', quantidade: 1, precoUnitario: '' });
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMaterial = () => {
    if (!novoMaterial.descricao || !novoMaterial.precoUnitario) return;
    const material = {
      ...novoMaterial,
      precoUnitario: Number(novoMaterial.precoUnitario),
      quantidade: Number(novoMaterial.quantidade),
      total: Number(novoMaterial.precoUnitario) * Number(novoMaterial.quantidade)
    };
    setEditingOS({
      ...editingOS,
      materiais: [...(editingOS.materiais || []), material]
    });
    setNovoMaterial({ descricao: '', quantidade: 1, precoUnitario: '' });
  };

  const handleRemoveMaterial = (index) => {
    const newMateriais = [...editingOS.materiais];
    newMateriais.splice(index, 1);
    setEditingOS({ ...editingOS, materiais: newMateriais });
  };

  const handleSaveOS = async () => {
    setLoading(true);
    setMensagem('');
    try {
      await api.put(`/clients/${editingOS.clientId}/repairs/${editingOS._id}`, {
        equipmentId: editingOS.equipmentId,
        defeitoInformado: editingOS.defeitoInformado,
        materiais: editingOS.materiais,
        status: editingOS.status,
        observacao: editingOS.observacao
      });
      setMensagem('✅ Sucesso! OS atualizada.');
      fetchRepairs();
      setTimeout(() => { onClose(); }, 1500);
    } catch (error) {
      setMensagem('❌ Erro ao atualizar OS.');
    } finally {
      setLoading(false);
    }
  };

  const total = (editingOS.materiais || []).reduce((acc, m) => acc + (m.total || 0), 0);
  return (
    <div className="glass-card" style={{maxWidth: '800px', margin: '0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
         <h3 className="section-title">Lançar Serviços / Peças - OS #{editingOS._id.slice(-6)}</h3>
         <button onClick={onClose} style={{cursor:'pointer', border:'none', background:'none'}}>⬅️ Voltar</button>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <p style={{marginBottom: '0.8rem'}}><strong>Serviço Solicitado:</strong> {editingOS.servicoSolicitado}</p>
          <div style={{display: 'flex', gap: '1rem', marginBottom: '0.8rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-secondary)'}}>Veículo (Modelo)</label>
              <input type="text" value={editingOS.equipmentId || ''} onChange={e => setEditingOS({...editingOS, equipmentId: e.target.value})} style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '100%'}} />
            </div>
            <div style={{width: '120px'}}>
              <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-secondary)'}}>Placa</label>
              <input type="text" value={editingOS.defeitoInformado || ''} onChange={e => setEditingOS({...editingOS, defeitoInformado: e.target.value})} style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '100%', textTransform: 'uppercase'}} />
            </div>
          </div>
          <p style={{marginTop: '0.5rem'}}>
            <strong>Observação Escrita:</strong>
          </p>
          <textarea value={editingOS.observacao || ''} onChange={e => setEditingOS({...editingOS, observacao: e.target.value})} rows="3" style={{width: '100%', minWidth: '400px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', marginTop: '0.2rem'}} placeholder="Anotações extras..."></textarea>
        </div>
        <div>
          <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem'}}>Status da OS</label>
          <select value={editingOS.status} onChange={e => setEditingOS({...editingOS, status: e.target.value})} style={{padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', fontWeight: 600}}>
            <option value="ORCAMENTO">Orçamento</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
            <option value="EM_EXECUCAO">Em Execução</option>
            <option value="FINALIZADO">Finalizado (Sem Pagar)</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>
      
      <div style={{background: '#f8fafc', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0'}}>
        <h4 style={{marginBottom: '1rem'}}>Adicionar Novo Item</h4>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
          <div style={{flex: 3}}>
            <label style={{display:'block', fontSize:'0.8rem', fontWeight:600}}>Item (Catálogo)</label>
            <select value={novoMaterial.descricao} onChange={e => {
              const selected = (inventories || []).find(i => i.descricao === e.target.value);
              if (selected) {
                setNovoMaterial({...novoMaterial, descricao: selected.descricao, precoUnitario: selected.valorVenda});
              } else {
                setNovoMaterial({...novoMaterial, descricao: e.target.value});
              }
            }} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}}>
              <option value="">Selecione um Serviço ou Peça...</option>
              {(inventories || []).map(i => (
                <option key={i.id || i._id} value={i.descricao}>{i.descricao} - R$ {i.valorVenda?.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div style={{flex: 1}}>
            <label style={{display:'block', fontSize:'0.8rem', fontWeight:600}}>Qtd</label>
            <input type="number" value={novoMaterial.quantidade} onChange={e => setNovoMaterial({...novoMaterial, quantidade: e.target.value})} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}} />
          </div>
          <div style={{flex: 1}}>
            <label style={{display:'block', fontSize:'0.8rem', fontWeight:600}}>Valor Unit. (R$)</label>
            <input type="number" value={novoMaterial.precoUnitario} onChange={e => setNovoMaterial({...novoMaterial, precoUnitario: e.target.value})} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}} />
          </div>
          <button type="button" onClick={handleAddMaterial} className="btn-primary" style={{padding: '0.6rem 1rem'}}>+ Add</button>
        </div>
      </div>

      <h4>Itens Lançados</h4>
      <table className="data-table">
        <thead><tr><th>Item</th><th>Qtd</th><th>Unit.</th><th>Total</th><th>Ação</th></tr></thead>
        <tbody>
          {(editingOS.materiais || []).map((m, i) => (
            <tr key={i}>
              <td>{m.descricao}</td><td>{m.quantidade}</td><td>R$ {m.precoUnitario}</td><td>R$ {m.total}</td>
              <td><button onClick={() => handleRemoveMaterial(i)} style={{background:'transparent', border:'none', color:'red', cursor:'pointer'}}>X</button></td>
            </tr>
          ))}
          {(!editingOS.materiais || editingOS.materiais.length === 0) && <tr><td colSpan="5">Nenhum item lançado.</td></tr>}
        </tbody>
      </table>
      <h3 style={{textAlign: 'right', marginTop: '1rem'}}>Total Geral: R$ {total.toFixed(2)}</h3>

      {mensagem && (
        <div style={{padding: '1rem', marginTop: '1rem', borderRadius: '8px', background: mensagem.includes('✅') ? '#ecfdf5' : '#fef2f2', color: mensagem.includes('✅') ? 'var(--accent-success)' : 'var(--accent-main)', fontWeight: 600}}>
          {mensagem}
        </div>
      )}

      <button onClick={handleSaveOS} className="btn-primary" style={{width: '100%', marginTop: '1.5rem'}} disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Ordem de Serviço'}
      </button>
    </div>
  );
};

const Ordens = ({ clients, repairs, fetchRepairs, businessUnit, inventories, onNavigate, initialOpenOS, onClearInitialOS }) => {
  const [selectedOS, setSelectedOS] = useState(null);
  const [printOS, setPrintOS] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  
  const [showNovaOS, setShowNovaOS] = useState(false);
  const [viewingService, setViewingService] = useState(null);

  const [editingOS, setEditingOS] = useState(null);

  useEffect(() => {
    if (initialOpenOS) {
      setPrintOS(initialOpenOS);
      if (onClearInitialOS) onClearInitialOS();
    }
  }, [initialOpenOS, onClearInitialOS]);

  const emExecucao = repairs.filter(r => ['EM_EXECUCAO', 'FINALIZADO', 'CONCLUIDO', 'PAGO', 'AGUARDANDO_APROVACAO'].includes(r.status));
  const getClient = (id) => clients.find(u => u.id === id || u._id === id) || {};

  if (printOS) {
    return <PrintableOS os={printOS} client={getClient(printOS.clientId)} onBack={() => setPrintOS(null)} />;
  }

  const handleCheckout = async () => {
    if (!paymentMethod) {
      setMensagem('Selecione uma forma de pagamento.');
      return;
    }
    setLoading(true);
    setMensagem('');
    try {
      await api.post(`/clients/${selectedOS.clientId}/repairs/${selectedOS._id}/checkout`, { paymentMethod });
      setMensagem('✅ Sucesso! OS Finalizada com sucesso.');
      fetchRepairs();
      setTimeout(() => setSelectedOS(null), 2000);
    } catch (error) {
      setMensagem(`❌ Erro: ${error.response?.data?.error || 'Não foi possível finalizar a OS.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransform = async (repair) => {
    try {
      await api.post(`/clients/${repair.clientId}/repairs/${repair._id}/approve`);
      fetchRepairs();
    } catch (err) {
      console.error(err);
      alert('Erro ao transformar OS.');
    }
  };

  const handleDeleteOS = async (repair) => {
    if (window.confirm(`Tem certeza que deseja excluir a OS #${repair._id.slice(-6)}?`)) {
      try {
        await api.delete(`/clients/${repair.clientId}/repairs/${repair._id}`);
        fetchRepairs();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir OS.');
      }
    }
  };

  if (selectedOS) {
    const client = getClient(selectedOS.clientId);
    const total = (selectedOS.materiais || []).reduce((acc, m) => acc + (m.total || 0), 0);

    return (
      <div style={{display: 'flex', gap: '2rem'}}>
        <div className="glass-card" style={{flex: 1}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
             <h3 className="section-title">Finalizar OS #{selectedOS._id.slice(-6)}</h3>
             <button onClick={() => {setSelectedOS(null); setMensagem('');}} style={{cursor:'pointer', border:'none', background:'none'}}>⬅️ Voltar</button>
          </div>
          <div style={{background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
            <p><strong>Cliente:</strong> {client.firstName} {client.lastName}</p>
            <p><strong>Serviço Solicitado:</strong> {selectedOS.servicoSolicitado}</p>
            <p style={{marginTop: '0.5rem', fontSize: '1.2rem'}}><strong>Valor Total:</strong> R$ {total.toFixed(2)}</p>
          </div>
          
          <h4 style={{marginBottom: '0.5rem'}}>Forma de Pagamento</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.8rem', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', background: paymentMethod === 'Pix' ? '#f1f5f9' : 'transparent'}}>
              <input type="radio" name="payment" value="Pix" onChange={e => setPaymentMethod(e.target.value)} />
              Pix
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.8rem', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', background: paymentMethod === 'Cartao' ? '#f1f5f9' : 'transparent'}}>
              <input type="radio" name="payment" value="Cartao" onChange={e => setPaymentMethod(e.target.value)} />
              Cartão de Crédito/Débito
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.8rem', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', background: paymentMethod === 'Dinheiro' ? '#f1f5f9' : 'transparent'}}>
              <input type="radio" name="payment" value="Dinheiro" onChange={e => setPaymentMethod(e.target.value)} />
              Dinheiro
            </label>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.8rem', border:'1px solid var(--accent-main)', borderRadius:'6px', cursor:'pointer', background: paymentMethod === 'CreditoInterno' ? '#f1f5f9' : 'transparent'}}>
              <input type="radio" name="payment" value="CreditoInterno" onChange={e => setPaymentMethod(e.target.value)} />
              <div style={{flex: 1}}>
                <strong>Crédito Interno</strong>
                <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Desconta do limite de crédito da loja. (Limite atual: R$ {client.limiteCredito || 0})</div>
              </div>
            </label>
          </div>

          {mensagem && (
            <div style={{padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: mensagem.includes('✅') ? '#ecfdf5' : '#fef2f2', color: mensagem.includes('✅') ? 'var(--accent-success)' : 'var(--accent-main)', fontWeight: 600}}>
              {mensagem}
            </div>
          )}

          <button className="btn-primary" style={{width: '100%', opacity: loading ? 0.7 : 1}} onClick={handleCheckout} disabled={loading}>
            {loading ? 'Processando Pagamento...' : 'Receber e Finalizar OS'}
          </button>
        </div>
      </div>
    );
  }

  if (editingOS) {
    return <EditorDeOS repair={editingOS} fetchRepairs={fetchRepairs} inventories={inventories} onClose={() => setEditingOS(null)} />;
  }

  if (showNovaOS) {
    return <NovaOSModal clients={clients} inventories={inventories} businessUnit={businessUnit} fetchRepairs={fetchRepairs} onClose={() => setShowNovaOS(false)} onNavigate={onNavigate} />;
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <h3 className="section-title" style={{margin: 0}}>Ordens de Serviço</h3>
        <button className="btn-primary" onClick={() => setShowNovaOS(true)}>+ Novo Registro</button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>OS #</th>
            <th>Cliente</th>
            <th>Veículo</th>
            <th>Placa</th>
            <th>Serviço</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {emExecucao.map(r => {
             const client = getClient(r.clientId);
             const total = (r.materiais || []).reduce((acc, m) => acc + (m.total || 0), 0);
             return (
              <tr key={r._id} onDoubleClick={() => { setSelectedOS(r); setPaymentMethod(r.paymentMethod || ''); }} style={{cursor: 'pointer'}} title="Dê 2 cliques para visualizar e finalizar">
                <td style={{fontWeight: 600}}>{r._id.slice(-6)}</td>
                <td>{client.firstName} {client.lastName}</td>
                <td style={{fontWeight: 500, color: 'var(--text-secondary)'}}>{r.equipmentId || '-'}</td>
                <td style={{fontWeight: 700, textTransform: 'uppercase'}}>{r.defeitoInformado || '-'}</td>
                <td><div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={r.servicoSolicitado} onClick={(e) => { e.stopPropagation(); setViewingService(r); }}>{r.servicoSolicitado}</div></td>
                <td style={{fontWeight: 600}}>R$ {total.toFixed(2)}</td>
                <td>
                  <span style={{padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: r.status === 'AGUARDANDO_APROVACAO' ? '#fef3c7' : (r.status === 'EM_EXECUCAO' ? '#dbeafe' : '#dcfce7'), color: r.status === 'AGUARDANDO_APROVACAO' ? '#92400e' : (r.status === 'EM_EXECUCAO' ? '#1e40af' : '#16a34a')}}>
                    {r.status === 'AGUARDANDO_APROVACAO' ? 'Aguardando' : (r.status === 'EM_EXECUCAO' ? 'Em Execução' : 'Finalizada')}
                  </span>
                </td>
                <td style={{display: 'flex', gap: '0.4rem', whiteSpace: 'nowrap'}}>
                  <button className="btn-primary" style={{background: '#3b82f6', padding: '0.4rem 0.6rem', fontSize: '1rem'}} onClick={() => setPrintOS(r)} title="Imprimir">🖨️</button>
                  <button className="btn-primary" style={{background: '#f59e0b', padding: '0.4rem 0.6rem', fontSize: '1rem'}} onClick={() => setEditingOS(r)} title="Editar">✏️</button>
                  {r.status === 'AGUARDANDO_APROVACAO' ? (
                    <button className="btn-primary" style={{padding: '0.4rem 0.6rem', fontSize: '1rem', background: '#6366f1'}} onClick={() => handleTransform(r)} title="Transformar em OS">🔄</button>
                  ) : (
                    <button className="btn-primary" style={{padding: '0.4rem 0.6rem', fontSize: '1rem', background: '#10b981'}} onClick={() => { setSelectedOS(r); setPaymentMethod(r.paymentMethod || ''); }} title={r.status === 'EM_EXECUCAO' ? 'Finalizar' : 'Pagamento'}>
                      {r.status === 'EM_EXECUCAO' ? '✅' : '💳'}
                    </button>
                  )}
                  <button className="btn-primary" style={{background: '#ef4444', padding: '0.4rem 0.6rem', fontSize: '1rem'}} onClick={() => handleDeleteOS(r)} title="Excluir">🗑️</button>
                </td>
              </tr>
             )
          })}
          {emExecucao.length === 0 && <tr><td colSpan={5}>Nenhuma OS em execução no momento.</td></tr>}
        </tbody>
      </table>

      {viewingService && (
        <div className="modal-overlay" onClick={() => setViewingService(null)}>
          <div className="glass-card" style={{maxWidth: '500px', width: '90%'}} onClick={e => e.stopPropagation()}>
            <h3 className="section-title">Informações do Serviço</h3>
            <div style={{background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '1rem'}}>
              <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.5'}}>{viewingService.servicoSolicitado}</p>
            </div>
            <button className="btn-primary" style={{marginTop: '1.5rem', width: '100%'}} onClick={() => setViewingService(null)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('oss@servicos.com');
  const [password, setPassword] = useState('@@302010@@');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // O backend utiliza o padrão JSON API (Serializer), precisamos parsear corretamente
      const token = response.data.data[0].attributes.access_token;
      const userObj = response.data.includes[0].data[0].attributes;
      userObj.id = response.data.includes[0].data[0].id;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userObj.id);
      onLogin(userObj);
    } catch (error) {
      console.error(error);
      setErro('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden'}}>
      {/* Lado Esquerdo - Info do Sistema */}
      <div style={{
        flex: 1, 
        background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%), url("https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1920&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '5rem', 
        position: 'relative'
      }}>
        <div style={{maxWidth: '550px', zIndex: 1}}>
          <div style={{margin: '0 0 2.5rem', width: '70px', height: '70px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'}}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <h1 style={{fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.15, color: '#ffffff', letterSpacing: '-1px'}}>
            Gestão Inteligente para sua Oficina.
          </h1>
          <p style={{fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.6, fontWeight: 400}}>
            O <strong>OSS Manutenção & Serviços</strong> é o sistema completo para você gerenciar ordens de serviço, clientes, orçamentos, estoque e faturamento em um só lugar.
          </p>
        </div>
      </div>

      {/* Lado Direito - Card de Login */}
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
        <div className="glass-card" style={{width: '420px', padding: '3rem 2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)'}}>
          <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
            <img src="/logo-oficina.png" alt="Sua Logo" style={{maxHeight: '160px', width: 'auto', marginBottom: '1.5rem', objectFit: 'contain'}} onError={(e) => e.target.style.display = 'none'} />
            <h2 style={{margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 700}}>Acesse sua Conta</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem'}}>Informe suas credenciais para continuar</p>
          </div>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} required />
          </div>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0'}} required />
          </div>
          {erro && <div style={{padding: '0.8rem', marginBottom: '1rem', background: '#fef2f2', color: 'var(--accent-main)', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center'}}>{erro}</div>}
          <button type="submit" className="btn-primary" style={{width: '100%', padding: '1rem'}} disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

const Estoque = ({ inventories, fetchInventories, businessUnit }) => {
  const [novoItem, setNovoItem] = useState({ descricao: '', categoria: 'PEÇA', valorVenda: '', quantidade: 1 });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!novoItem.descricao || !novoItem.valorVenda) return;
    setLoading(true);
    try {
      await api.post('/inventories', {
        ...novoItem,
        valorVenda: Number(novoItem.valorVenda),
        quantidade: Number(novoItem.quantidade),
        businessUnit
      });
      fetchInventories();
      setNovoItem({ descricao: '', categoria: 'PEÇA', valorVenda: '', quantidade: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Excluir este item?')) return;
    try {
      await api.delete(`/inventories/${id}`);
      fetchInventories();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="glass-card" style={{marginBottom: '2rem'}}>
        <h3 className="section-title">Cadastrar Peça ou Serviço</h3>
        <form onSubmit={handleCreate} style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 600}}>Categoria</label>
            <select value={novoItem.categoria} onChange={e => setNovoItem({...novoItem, categoria: e.target.value})} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}}>
              <option value="PEÇA">Peça / Material</option>
              <option value="SERVIÇO">Serviço / Mão de Obra</option>
            </select>
          </div>
          <div style={{flex: 3}}>
            <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 600}}>Descrição</label>
            <input type="text" value={novoItem.descricao} onChange={e => setNovoItem({...novoItem, descricao: e.target.value})} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}} required />
          </div>
          <div style={{flex: 1}}>
            <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 600}}>Qtd. Inicial (Estoque)</label>
            <input type="number" value={novoItem.quantidade} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}} required />
          </div>
          <div style={{flex: 1}}>
            <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 600}}>Valor de Venda (R$)</label>
            <input type="number" step="0.01" value={novoItem.valorVenda} onChange={e => setNovoItem({...novoItem, valorVenda: e.target.value})} style={{width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc'}} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{padding: '0.6rem 1.5rem'}}>{loading ? '...' : 'Salvar'}</button>
        </form>
      </div>

      <div className="glass-card">
        <h3 className="section-title">Catálogo de Serviços e Peças</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Em Estoque</th>
              <th>Valor Unit. (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {inventories.map(item => (
              <tr key={item.id}>
                <td>{item.descricao}</td>
                <td><span style={{padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: item.categoria === 'SERVIÇO' ? '#e0e7ff' : '#dcfce7', color: item.categoria === 'SERVIÇO' ? '#4f46e5' : '#16a34a'}}>{item.categoria}</span></td>
                <td>{item.categoria === 'SERVIÇO' ? '-' : item.quantidade}</td>
                <td>R$ {item.valorVenda?.toFixed(2)}</td>
                <td>
                  <button className="btn-primary" style={{background: '#ef4444', padding: '0.4rem 0.8rem'}} onClick={() => handleDelete(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {inventories.length === 0 && <tr><td colSpan={5}>Nenhum item cadastrado no momento.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalOpenOS, setGlobalOpenOS] = useState(null);
  const [businessUnit, setBusinessUnit] = useState(localStorage.getItem('unit') || 'OFICINA');
  const [user, setUser] = useState(null);
  
  const [usersList, setUsersList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [repairsList, setRepairsList] = useState([]);
  const [inventoriesList, setInventoriesList] = useState([]);

  useEffect(() => {
    localStorage.setItem('unit', businessUnit);
    if (user) fetchData();
  }, [businessUnit, user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ firstName: 'Admin' });
  }, []);

  const fetchData = async () => {
    try {
      const [uRes, cRes, rRes, iRes] = await Promise.all([
        api.get(`/users?businessUnit=${businessUnit}`),
        api.get(`/clients?businessUnit=${businessUnit}`),
        api.get(`/repairs?businessUnit=${businessUnit}`),
        api.get(`/inventories?businessUnit=${businessUnit}`)
      ]);
      const usersData = uRes.data?.data?.map(u => ({ id: u.id, ...u.attributes })) || [];
      const clientsData = cRes.data?.data?.map(c => ({ id: c.id, ...c.attributes })) || [];
      const inventoriesData = iRes.data?.data?.map(i => ({ id: i.id, ...i.attributes })) || [];
      setUsersList(usersData);
      setClientsList(clientsData);
      setRepairsList(rRes.data || []);
      setInventoriesList(inventoriesData);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) {
         localStorage.clear();
         window.location.reload();
      }
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard businessUnit={businessUnit} users={usersList} clients={clientsList} repairs={repairsList} onNavigate={setActiveTab} onOpenOS={(os) => { setGlobalOpenOS(os); setActiveTab('ordens'); }} />;
      case 'clientes': return <Clientes clients={clientsList} fetchClients={fetchData} />;
      case 'ordens': return <Ordens clients={clientsList} repairs={repairsList} fetchRepairs={fetchData} businessUnit={businessUnit} inventories={inventoriesList} onNavigate={setActiveTab} initialOpenOS={globalOpenOS} onClearInitialOS={() => setGlobalOpenOS(null)} />;
      case 'orcamentos': return <OrcamentoToOS clients={clientsList} repairs={repairsList} fetchRepairs={fetchData} inventories={inventoriesList} onNavigate={setActiveTab} />;
      case 'estoque': return <Estoque inventories={inventoriesList} fetchInventories={fetchData} businessUnit={businessUnit} />;
      default: return <div style={{padding: '2rem'}}>Em construção...</div>;
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: '📊' },
    { id: 'clientes', label: 'Clientes & Crédito', icon: '👥' },
    { id: 'orcamentos', label: 'Orçamentos', icon: '📝' },
    { id: 'ordens', label: 'Ordens de Serviço', icon: '🔧' },
    { id: 'estoque', label: 'Estoque & Serviços', icon: '📦' },
    { id: 'faturamento', label: 'Faturamento', icon: '💰' },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand" style={{flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem'}}>
          <img src="/logo-oficina.png" alt="Logo" style={{width: '100%', maxWidth: '240px', objectFit: 'contain'}} onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <nav className="nav-menu">
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <span style={{marginRight: '10px'}}>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
            <h2>{navItems.find(i => i.id === activeTab)?.label}</h2>
            <div className="unit-selector" style={{display: 'flex', gap: '0.5rem', width: '250px', background: '#f1f5f9', padding: '0.3rem', borderRadius: '8px'}}>
              <button style={{flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, background: businessUnit === 'OFICINA' ? 'var(--accent-main)' : 'transparent', color: businessUnit === 'OFICINA' ? 'white' : 'var(--text-secondary)'}} onClick={() => setBusinessUnit('OFICINA')}>🚗 Oficina</button>
              <button style={{flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, background: businessUnit === 'ELEVADORES' ? 'var(--accent-main)' : 'transparent', color: businessUnit === 'ELEVADORES' ? 'white' : 'var(--text-secondary)'}} onClick={() => setBusinessUnit('ELEVADORES')}>🏢 Elevadores</button>
            </div>
          </div>
          <div className="user-profile">
            <div style={{textAlign: 'right'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{user?.firstName || 'Admin'}</div>
              <a href="#" onClick={() => { localStorage.clear(); window.location.reload(); }} style={{fontSize: '0.7rem'}}>Sair</a>
            </div>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
