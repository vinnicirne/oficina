require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');

// Conexões
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const mongoUri = process.env.MONGODB_URI;

mongoose.Promise = require('bluebird');

async function migrateData() {
  console.log('Iniciando migração de dados...');
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB Conectado!');
    
    const dbModels = require('./src/models')(mongoose.connection);
    
    // 1. Migrar Usuários (Criar no Supabase Auth e inserir na tabela public.users)
    const users = await dbModels.user.queryUser({});
    console.log(`Buscando ${users.length} usuários...`);
    
    const userMap = {}; // mongoId -> supabase UUID
    
    for (const u of users) {
      // Criar usuário no Auth com senha padrão
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: u.email,
        password: 'Oficina@123456', // Senha padrão exigida
      });
      
      if (authErr) {
        console.log(`Erro ao criar user auth ${u.email}:`, authErr.message);
        continue;
      }
      
      const newUserId = authData.user.id;
      userMap[u._id.toString()] = newUserId;
      
      // Inserir perfil público
      const userRole = u.email === 'oss@servicos.com' ? 'admin' : u.roles;
      await supabase.from('users').upsert({
        id: newUserId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        roles: userRole,
        department: u.department,
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      });
      console.log(`Usuário migrado: ${u.email}`);
    }
    
    // 2. Migrar Clientes
    const clients = await dbModels.client.queryClient({});
    console.log(`Migrando ${clients.length} clientes...`);
    for (const c of clients) {
      await supabase.from('clients').upsert({
        id: c._id.toString(),
        name: c.name,
        document: c.document,
        phone: c.phone,
        email: c.email,
        address: c.address,
        score: c.score || 0,
        ltv: c.ltv || 0,
        status: c.status,
        businessUnit: c.businessUnit,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      });
    }
    
    // 3. Migrar Estoque (Inventories)
    const inventories = await dbModels.inventory.queryInventory({});
    console.log(`Migrando ${inventories.length} itens do estoque...`);
    for (const i of inventories) {
      await supabase.from('inventories').upsert({
        id: i._id.toString(),
        descricao: i.descricao,
        categoria: i.categoria,
        quantidade: i.quantidade,
        valorVenda: i.valorVenda,
        businessUnit: i.businessUnit,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt
      });
    }
    
    // 4. Migrar Reparos
    const repairs = await dbModels.repair.queryRepair({});
    console.log(`Migrando ${repairs.length} ordens de serviço...`);
    for (const r of repairs) {
      await supabase.from('repairs').upsert({
        id: r._id.toString(),
        clientId: r.clientId.toString(),
        vehicleInfo: r.vehicleInfo,
        description: r.description,
        items: r.items,
        totalAmount: r.totalAmount,
        status: r.status,
        businessUnit: r.businessUnit,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      });
    }
    
    // 5. Migrar Transações
    const transactions = await dbModels.transaction.queryTransaction({});
    console.log(`Migrando ${transactions.length} transações...`);
    for (const t of transactions) {
      await supabase.from('transactions').upsert({
        id: t._id.toString(),
        clientId: t.clientId.toString(),
        repairId: t.repairId ? t.repairId.toString() : null,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        dueDate: t.dueDate,
        paidDate: t.paidDate,
        businessUnit: t.businessUnit,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      });
    }

    console.log('🎉 Migração concluída com sucesso!');
    process.exit(0);

  } catch (err) {
    console.error('Erro na migração:', err);
    process.exit(1);
  }
}

migrateData();
