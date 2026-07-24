const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'frontend-v2', 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// ClientCreditProfile
content = content.replace(
  /api\.get\(`\/transactions\?clientId=\$\{client\._id \|\| client\.id\}`\)/g,
  "supabase.from('transactions').select('*').eq('clientId', client._id || client.id)"
);
content = content.replace(
  /api\.put\(`\/transactions\/\$\{txId\}\/pay`\)/g,
  "supabase.from('transactions').update({ status: 'PAID' }).eq('id', txId)"
);
content = content.replace(
  /api\.put\(`\/transactions\/\$\{txId\}\/unpay`\)/g,
  "supabase.from('transactions').update({ status: 'PENDING' }).eq('id', txId)"
);
content = content.replace(
  /api\.delete\(`\/transactions\/\$\{txId\}`\)/g,
  "supabase.from('transactions').delete().eq('id', txId)"
);

// Clientes
content = content.replace(
  /api\.delete\(`\/clients\/\$\{client\.id \|\| client\._id\}`\)/g,
  "supabase.from('clients').delete().eq('id', client.id || client._id)"
);
content = content.replace(
  /api\.put\(`\/clients\/\$\{editingClient\.id \|\| editingClient\._id\}`, payload\)/g,
  "supabase.from('clients').update(payload).eq('id', editingClient.id || editingClient._id)"
);
content = content.replace(
  /api\.post\('\/clients', payload\)/g,
  "supabase.from('clients').insert([payload])"
);

// Ordens (post repair)
content = content.replace(
  /api\.post\(`\/clients\/\$\{novaOSForm\.clientId\}\/repairs`, \{\n\s*businessUnit,\n\s*equipmentId: novaOSForm\.equipmentId,\n\s*defeitoInformado: novaOSForm\.defeitoInformado,\n\s*observacoes: novaOSForm\.observacoes\n\s*\}\)/g,
  "supabase.from('repairs').insert([{ clientId: novaOSForm.clientId, businessUnit, equipmentId: novaOSForm.equipmentId, defeitoInformado: novaOSForm.defeitoInformado, observacoes: novaOSForm.observacoes }])"
);

// Aprovar OS
content = content.replace(
  /api\.post\(`\/clients\/\$\{selectedRepair\.clientId\}\/repairs\/\$\{selectedRepair\._id\}\/approve`\)/g,
  "supabase.from('repairs').update({ status: 'EM_EXECUCAO' }).eq('id', selectedRepair.id || selectedRepair._id)"
);

content = content.replace(
  /api\.post\(`\/clients\/\$\{repair\.clientId\}\/repairs\/\$\{repair\._id\}\/approve`\)/g,
  "supabase.from('repairs').update({ status: 'EM_EXECUCAO' }).eq('id', repair.id || repair._id)"
);

// Delete OS
content = content.replace(
  /api\.delete\(`\/clients\/\$\{repair\.clientId\}\/repairs\/\$\{repair\._id\}`\)/g,
  "supabase.from('repairs').delete().eq('id', repair.id || repair._id)"
);

// Update OS
content = content.replace(
  /api\.put\(`\/clients\/\$\{editingOS\.clientId\}\/repairs\/\$\{editingOS\._id\}`, \{\n\s*equipmentId: editingOS\.equipmentId,\n\s*defeitoInformado: editingOS\.defeitoInformado,\n\s*observacoes: editingOS\.observacoes\n\s*\}\)/g,
  "supabase.from('repairs').update({ equipmentId: editingOS.equipmentId, defeitoInformado: editingOS.defeitoInformado, observacoes: editingOS.observacoes }).eq('id', editingOS.id || editingOS._id)"
);

// Checkout OS
content = content.replace(
  /api\.post\(`\/clients\/\$\{selectedOS\.clientId\}\/repairs\/\$\{selectedOS\._id\}\/checkout`, \{ paymentMethod \}\)/g,
  "supabase.from('repairs').update({ status: 'CONCLUIDO' }).eq('id', selectedOS.id || selectedOS._id)" // A simplificação inicial, vou adicionar insert manual no script
);

// Inventories
content = content.replace(
  /api\.post\('\/inventories', \{\n\s*name: newInventory\.name,\n\s*price: Number\(newInventory\.price\),\n\s*type: newInventory\.type,\n\s*businessUnit\n\s*\}\)/g,
  "supabase.from('inventories').insert([{ name: newInventory.name, price: Number(newInventory.price), type: newInventory.type, businessUnit }])"
);

content = content.replace(
  /api\.delete\(`\/inventories\/\$\{id\}`\)/g,
  "supabase.from('inventories').delete().eq('id', id)"
);

// Users / Configurações
content = content.replace(
  /api\.get\(`\/users`\)/g,
  "supabase.from('users').select('*')"
);

content = content.replace(
  /api\.get\(`\/logs`\)/g,
  "supabase.from('logs').select('*').order('createdAt', { ascending: false }).limit(100)"
);

content = content.replace(
  /api\.post\('\/users', newUser\)/g,
  "supabase.from('users').insert([newUser])" // Apenas placeholder simples, ideal seria criar auth tbm
);

content = content.replace(
  /api\.delete\(`\/users\/\$\{u\.id\}`\)/g,
  "supabase.from('users').delete().eq('id', u.id)"
);

// Fix res.data in client credit profile
content = content.replace(
  /setTransactions\(res\.data\);/g,
  "setTransactions(res.data || []);"
);

// Remove api import completely
content = content.replace(/import api from '\.\/services\/api'; \/\/ \(Manter temporariamente se outras partes usarem\)\n/g, "");

fs.writeFileSync(appTsxPath, content, 'utf8');
console.log('App.tsx updated!');
