// 1. Isi dua nilai ini dari Supabase: Project Settings > API.
const SUPABASE_URL = "https://avnoaoqbehudxuxrrtxb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_B6i8yInUGVjcrTW0dmNhrA_i9XjZj2i";
const configured = !SUPABASE_URL.startsWith("PASTE_") && !SUPABASE_ANON_KEY.startsWith("PASTE_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (id) => document.getElementById(id);
let currentUser = null;

function message(id, text, error=false){ const el=$(id); el.textContent=text; el.style.color=error?"#c0392b":"#16845b"; }
function showAuth(){ $("authView").classList.remove("hidden"); $("appView").classList.add("hidden"); $("logoutBtn").classList.add("hidden"); }
function showApp(){ $("authView").classList.add("hidden"); $("appView").classList.remove("hidden"); $("logoutBtn").classList.remove("hidden"); }

$("loginTab").onclick=()=>{ $("loginTab").classList.add("active"); $("registerTab").classList.remove("active"); $("loginForm").classList.remove("hidden"); $("registerForm").classList.add("hidden"); message("authMessage",""); };
$("registerTab").onclick=()=>{ $("registerTab").classList.add("active"); $("loginTab").classList.remove("active"); $("registerForm").classList.remove("hidden"); $("loginForm").classList.add("hidden"); message("authMessage",""); };

$("loginForm").onsubmit=async(e)=>{e.preventDefault();if(!db)return message("authMessage","Tambahkan URL dan anon key Supabase di app.js terlebih dahulu.",true);
  const {error}=await db.auth.signInWithPassword({email:$("loginEmail").value,password:$("loginPassword").value});
  if(error)return message("authMessage",error.message,true); await boot();};
$("registerForm").onsubmit=async(e)=>{e.preventDefault();if(!db)return message("authMessage","Tambahkan URL dan anon key Supabase di app.js terlebih dahulu.",true);
  const {data,error}=await db.auth.signUp({email:$("regEmail").value,password:$("regPassword").value,options:{data:{full_name:$("regName").value}}});
  if(error)return message("authMessage",error.message,true);
  if(data.session){await boot();}else{message("authMessage","Akun dibuat. Cek email untuk konfirmasi, lalu login.");}};
$("logoutBtn").onclick=async()=>{await db.auth.signOut();currentUser=null;showAuth();};
$("refreshBtn").onclick=loadDashboard;

async function boot(){if(!db){showAuth();message("authMessage","Konfigurasi Supabase belum diisi.",true);return;}
 const {data:{session}}=await db.auth.getSession(); if(!session){showAuth();return;}
 currentUser=session.user;showApp();$("userEmail").textContent=currentUser.email;
 $("userName").textContent=currentUser.user_metadata?.full_name||currentUser.email.split("@")[0];await loadDashboard();}
async function loadDashboard(){
 if(!db||!currentUser)return;
 const [itemsRes,loansRes]=await Promise.all([
  db.from("items").select("id,name,description,stock,available_stock,categories(name)").order("name"),
  db.from("loans").select("id,loan_date,status,loan_items(quantity,items(name))").eq("user_id",currentUser.id).order("created_at",{ascending:false})
 ]);
 if(itemsRes.error){message("appMessage",itemsRes.error.message,true);return;}
 if(loansRes.error){message("appMessage",loansRes.error.message,true);return;}
 const items=itemsRes.data||[],loans=loansRes.data||[];
 $("totalItems").textContent=items.length;$("availableItems").textContent=items.filter(x=>x.available_stock>0).length;$("myLoans").textContent=loans.length;
 $("itemsGrid").innerHTML=items.map(item=>`<article class="item-card"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description||"Tidak ada deskripsi.")}</p><p>Kategori: ${escapeHtml(item.categories?.name||"-")}</p><div class="item-meta"><span class="pill">Stok: ${item.available_stock}</span><button data-item="${item.id}" ${item.available_stock<1?"disabled":""}>Ajukan pinjam</button></div></article>`).join("")||"<p>Belum ada barang.</p>";
 document.querySelectorAll("[data-item]").forEach(btn=>btn.onclick=()=>requestLoan(btn.dataset.item));
 $("loanRows").innerHTML=loans.map(loan=>{const names=(loan.loan_items||[]).map(li=>`${escapeHtml(li.items?.name||"Barang")} (${li.quantity})`).join(", ");return `<tr><td>${new Date(loan.loan_date).toLocaleDateString("id-ID")}</td><td>${names}</td><td>${(loan.loan_items||[]).reduce((s,x)=>s+x.quantity,0)}</td><td>${escapeHtml(loan.status)}</td></tr>`}).join("")||'<tr><td colspan="4">Belum ada pengajuan.</td></tr>';
}
async function requestLoan(itemId){
 const qtyText=prompt("Jumlah barang yang ingin dipinjam?","1");if(qtyText===null)return;
 const quantity=Number(qtyText);if(!Number.isInteger(quantity)||quantity<1)return message("appMessage","Jumlah harus berupa angka bulat minimal 1.",true);
 const {data:item,error:itemError}=await db.from("items").select("available_stock").eq("id",itemId).single();
 if(itemError||!item)return message("appMessage","Barang tidak ditemukan.",true);
 if(quantity>item.available_stock)return message("appMessage","Jumlah melebihi stok tersedia.",true);
 const {data:loan,error:loanError}=await db.from("loans").insert({user_id:currentUser.id,status:"pending"}).select().single();
 if(loanError)return message("appMessage",loanError.message,true);
 const {error:detailError}=await db.from("loan_items").insert({loan_id:loan.id,item_id:itemId,quantity});
 if(detailError){await db.from("loans").delete().eq("id",loan.id);return message("appMessage",detailError.message,true);}
 message("appMessage","Pengajuan berhasil dibuat. Status: pending.");await loadDashboard();
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
boot();
