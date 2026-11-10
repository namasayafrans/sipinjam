// SIPINJAM - isi URL dan publishable/anon key dari Supabase Project Settings > API.
const SUPABASE_URL = "https://nqsvenaqscjngjmyadal.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_f_PiDR-A0i07Z-ARhQNO4A__kM6N3wd";
const configured = !SUPABASE_URL.includes("YOUR_PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
let currentUser = null, currentProfile = null;

function msg(id, text, error=false) { const el=$(id); if(el){el.textContent=text;el.className=`message ${error?'error':'success'}`;} }
function showAuth(){ $('authView').classList.remove('hidden'); $('studentView').classList.add('hidden'); $('adminView').classList.add('hidden'); $('logoutBtn').classList.add('hidden'); }
function showRole(role){ $('authView').classList.add('hidden'); $('studentView').classList.toggle('hidden',role!=='member'); $('adminView').classList.toggle('hidden',role!=='admin'); $('logoutBtn').classList.remove('hidden'); }
function switchTab(login){ $('loginTab').classList.toggle('active',login); $('registerTab').classList.toggle('active',!login); $('loginForm').classList.toggle('hidden',!login); $('registerForm').classList.toggle('hidden',login); msg('authMessage',''); }
$('loginTab').onclick=()=>switchTab(true); $('registerTab').onclick=()=>switchTab(false);

$('loginForm').onsubmit=async e=>{e.preventDefault();if(!db)return msg('authMessage','Isi URL dan key Supabase di app.js.',true);const {error}=await db.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});if(error)return msg('authMessage',error.message,true);await boot();};
$('registerForm').onsubmit=async e=>{e.preventDefault();if(!db)return msg('authMessage','Isi URL dan key Supabase di app.js.',true);const {data,error}=await db.auth.signUp({email:$('regEmail').value.trim(),password:$('regPassword').value,options:{data:{full_name:$('regName').value.trim()}}});if(error)return msg('authMessage',error.message,true);if(data.session)await boot();else msg('authMessage','Akun dibuat. Jika konfirmasi email aktif, konfirmasi dahulu sebelum login.');};
$('logoutBtn').onclick=async()=>{if(db)await db.auth.signOut();currentUser=null;currentProfile=null;showAuth();};
$('studentRefreshBtn').onclick=loadStudent; $('adminRefreshBtn').onclick=loadAdmin;

async function boot(){
  if(!db){showAuth();return msg('authMessage','Konfigurasi Supabase belum diisi di app.js.',true);}
  const {data:{session}}=await db.auth.getSession(); if(!session){showAuth();return;}
  currentUser=session.user;
  // PEMBEDA ROLE: baca public.profiles berdasarkan UUID akun yang sedang login.
  const {data:profile,error}=await db.from('profiles').select('id,full_name,role').eq('id',currentUser.id).single();
  if(error||!profile){await db.auth.signOut();currentUser=null;showAuth();return msg('authMessage','Profil tidak ditemukan. Pastikan akun memiliki baris di tabel profiles dan SQL setup sudah dijalankan.',true);}
  currentProfile=profile; const role=String(profile.role||'').toLowerCase();
  if(!['admin','member'].includes(role)){await db.auth.signOut();showAuth();return msg('authMessage',`Role '${role}' tidak dikenali. Gunakan admin atau member.`,true);}
  if(role==='admin'){$('adminName').textContent=profile.full_name||currentUser.email;$('adminEmail').textContent=currentUser.email;showRole('admin');await loadAdmin();}
  else{$('studentName').textContent=profile.full_name||currentUser.email;$('studentEmail').textContent=currentUser.email;showRole('member');await loadStudent();}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function today(){const d=new Date(),local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,10);}
function statusText(s){return ({pending:'Menunggu',approved:'Disetujui',rejected:'Ditolak'})[s]||s||'-';}
function statusHtml(s){return `<span class="status ${['pending','approved','rejected'].includes(s)?s:''}">${esc(statusText(s))}</span>`;}
async function getItems(){return db.from('items').select('id,name,description,available_stock,categories(name)').order('name');}

async function loadStudent(){
 if(!currentUser||currentProfile?.role!=='member')return;
 const [ir,lr]=await Promise.all([getItems(),db.from('loans').select('id,loan_date,status,loan_items(quantity,items(name))').eq('user_id',currentUser.id).order('created_at',{ascending:false})]);
 if(ir.error)return msg('studentMessage',ir.error.message,true);if(lr.error)return msg('studentMessage',lr.error.message,true);
 const items=ir.data||[],loans=lr.data||[];$('studentTotalItems').textContent=items.length;$('studentAvailableItems').textContent=items.filter(x=>x.available_stock>0).length;$('studentLoanCount').textContent=loans.length;
 $('studentItemsGrid').innerHTML=items.map(x=>`<article class="item-card"><div class="cardline"><span class="eyebrow">${esc(x.categories?.name||'Barang')}</span><span class="stock">${Number(x.available_stock)||0} tersedia</span></div><h3>${esc(x.name)}</h3><p>${esc(x.description||'Tidak ada deskripsi.')}</p><button class="button primary request" data-id="${esc(x.id)}" ${Number(x.available_stock)<1?'disabled':''}>Ajukan peminjaman</button></article>`).join('')||'<p class="muted">Belum ada barang.</p>';
 document.querySelectorAll('.request').forEach(b=>b.onclick=()=>requestLoan(b.dataset.id));
 $('studentLoanRows').innerHTML=loans.map(l=>{const names=(l.loan_items||[]).map(d=>`${esc(d.items?.name||'Barang')} (${d.quantity})`).join(', '),qty=(l.loan_items||[]).reduce((n,d)=>n+Number(d.quantity||0),0);return `<tr><td>${new Date(`${l.loan_date}T00:00:00`).toLocaleDateString('id-ID')}</td><td>${names||'-'}</td><td>${qty}</td><td>${statusHtml(l.status)}</td></tr>`;}).join('')||'<tr><td colspan="4" class="empty">Belum ada pengajuan.</td></tr>';msg('studentMessage','');
}
async function requestLoan(itemId){
 const q=prompt('Jumlah barang yang ingin dipinjam?','1');if(q===null)return;const quantity=Number(q);if(!Number.isInteger(quantity)||quantity<1)return msg('studentMessage','Jumlah harus angka bulat minimal 1.',true);
 const {data:item,error:ie}=await db.from('items').select('available_stock').eq('id',itemId).single();if(ie||!item)return msg('studentMessage','Barang tidak ditemukan.',true);if(quantity>Number(item.available_stock))return msg('studentMessage','Jumlah melebihi stok tersedia.',true);
 const {data:loan,error:le}=await db.from('loans').insert({user_id:currentUser.id,loan_date:today(),status:'pending'}).select('id').single();if(le)return msg('studentMessage',le.message,true);
 const {error:de}=await db.from('loan_items').insert({loan_id:loan.id,item_id:Number(itemId),quantity});if(de){await db.from('loans').delete().eq('id',loan.id);return msg('studentMessage',de.message,true);}msg('studentMessage','Pengajuan berhasil dibuat dan menunggu persetujuan admin.');await loadStudent();
}

async function loadAdmin(){
 if(!currentUser||currentProfile?.role!=='admin')return;
 const [ir,lr]=await Promise.all([getItems(),db.from('loans').select('id,user_id,loan_date,status,loan_items(quantity,items(name))').order('created_at',{ascending:false})]);
 if(ir.error)return msg('adminMessage',ir.error.message,true);if(lr.error)return msg('adminMessage',lr.error.message,true);
 const items=ir.data||[],loans=lr.data||[];$('adminTotalItems').textContent=items.length;$('adminTotalLoans').textContent=loans.length;$('adminPendingLoans').textContent=loans.filter(l=>l.status==='pending').length;
 $('adminItemsRows').innerHTML=items.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.categories?.name||'-')}</td><td>${Number(x.available_stock)||0}</td></tr>`).join('')||'<tr><td colspan="3">Belum ada barang.</td></tr>';
 const ids=[...new Set(loans.map(l=>l.user_id).filter(Boolean))];let names={};if(ids.length){const {data,error}=await db.from('profiles').select('id,full_name').in('id',ids);if(error)return msg('adminMessage',error.message,true);names=Object.fromEntries((data||[]).map(p=>[p.id,p.full_name]));}
 $('adminLoanRows').innerHTML=loans.map(l=>{const itemsText=(l.loan_items||[]).map(d=>`${esc(d.items?.name||'Barang')} (${d.quantity})`).join(', ');const action=l.status==='pending'?`<div class="actions"><button class="small approve" data-id="${l.id}">Setujui</button><button class="small reject" data-id="${l.id}">Tolak</button></div>`:'<span class="muted">Selesai ditinjau</span>';return `<tr><td>${esc(names[l.user_id]||l.user_id)}</td><td>${new Date(`${l.loan_date}T00:00:00`).toLocaleDateString('id-ID')}</td><td>${itemsText||'-'}</td><td>${statusHtml(l.status)}</td><td>${action}</td></tr>`;}).join('')||'<tr><td colspan="5" class="empty">Belum ada pengajuan.</td></tr>';
 document.querySelectorAll('.approve').forEach(b=>b.onclick=()=>setLoanStatus(b.dataset.id,'approved'));document.querySelectorAll('.reject').forEach(b=>b.onclick=()=>setLoanStatus(b.dataset.id,'rejected'));msg('adminMessage','');
}
async function setLoanStatus(id,status){if(!confirm(`Yakin ingin ${status==='approved'?'menyetujui':'menolak'} pengajuan ini?`))return;const {error}=await db.from('loans').update({status}).eq('id',id);if(error)return msg('adminMessage',error.message,true);msg('adminMessage','Status pengajuan berhasil diperbarui.');await loadAdmin();}
boot();
