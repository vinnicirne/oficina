const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'frontend-v2', 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// Replace repairs post
content = content.replace(
  /api\.post\(`\/clients\/\$\{novaOSForm\.clientId\}\/repairs`, \{\s*businessUnit,\s*equipmentId: novaOSForm\.equipmentId,\s*defeitoInformado: novaOSForm\.defeitoInformado,\s*observacoes: novaOSForm\.observacoes\s*\}\)/g,
  "supabase.from('repairs').insert([{ clientId: novaOSForm.clientId, businessUnit, equipmentId: novaOSForm.equipmentId, defeitoInformado: novaOSForm.defeitoInformado, observacoes: novaOSForm.observacoes }])"
);

// Replace repairs put
content = content.replace(
  /api\.put\(`\/clients\/\$\{editingOS\.clientId\}\/repairs\/\$\{editingOS\._id\}`, \{\s*equipmentId: editingOS\.equipmentId,\s*defeitoInformado: editingOS\.defeitoInformado,\s*observacoes: editingOS\.observacoes\s*\}\)/g,
  "supabase.from('repairs').update({ equipmentId: editingOS.equipmentId, defeitoInformado: editingOS.defeitoInformado, observacoes: editingOS.observacoes }).eq('id', editingOS.id || editingOS._id)"
);

// Replace inventories post
content = content.replace(
  /api\.post\('\/inventories', \{\s*name: newInventory\.name,\s*price: Number\(newInventory\.price\),\s*type: newInventory\.type,\s*businessUnit\s*\}\)/g,
  "supabase.from('inventories').insert([{ name: newInventory.name, price: Number(newInventory.price), type: newInventory.type, businessUnit }])"
);

fs.writeFileSync(appTsxPath, content, 'utf8');
console.log('App.tsx updated again!');
