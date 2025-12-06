const supabase = supabase.createClient(
  "https://qccpddjnozehorhleegz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjY3BkZGpub3plaG9yaGxlZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTc0NzEsImV4cCI6MjA3OTE5MzQ3MX0.WzG0u9c6wY9eTTh0olIzrPSSPoHhuQhmLTS7zPxXBGA"
);

// ✅ عدادات
async function loadCounts(){
  let { count:pc } = await supabase
    .from("products")
    .select("*",{count:"exact",head:true});

  let { count:oc } = await supabase
    .from("orders")
    .select("*",{count:"exact",head:true});

  prodCount.innerText = pc;
  orderCount.innerText = oc;
}
loadCounts();


// ✅ إضافة منتج
async function addProduct(){
  let file = document.getElementById("pImage").files[0];

  let fileName = Date.now()+"-"+file.name;

  let { error:imgErr } = await supabase
    .storage
    .from("products")
    .upload(fileName,file);

  if(imgErr) return alert("خطأ في رفع الصورة");

  let imageUrl = supabase
    .storage
    .from("products")
    .getPublicUrl(fileName).data.publicUrl;

  await supabase.from("products").insert({
    name:pName.value,
    price:pPrice.value,
    image:imageUrl
  });

  msg.innerText = "✅ تم إضافة المنتج بنجاح";
  loadCounts();
}


// ✅ تحميل الطلبات + فلترة
async function loadOrders(){
  let status = filter.value;

  let q = supabase.from("orders").select("*").order("created_at",{ascending:false});
  if(status!="all") q = q.eq("status",status);

  let { data } = await q;
  orders.innerHTML="";

  data.forEach(o=>{
    orders.innerHTML += `
      <tr>
        <td>${o.name}</td>
        <td>$${o.total}</td>
        <td>
          <select onchange="changeStatus('${o.id}',this.value)">
            <option ${o.status=="pending"?"selected":""}>pending</option>
            <option ${o.status=="done"?"selected":""}>done</option>
            <option ${o.status=="canceled"?"selected":""}>canceled</option>
          </select>
        </td>
      </tr>
    `;
  });
}
loadOrders();


// ✅ تغيير حالة الطلب
async function changeStatus(id,val){
  await supabase
    .from("orders")
    .update({status:val})
    .eq("id",id);
}
