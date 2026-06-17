const sheetID = "YOUR_SHEET_ID";

const url =
`https://opensheet.elk.sh/1kvZeQoiZ__VfCQfbewyJMGyskSuB217fHwuV3YSM9Zo/Sheet1`;

let masterData = [];

fetch(url)
.then(res=>res.json())
.then(data=>{

masterData=data;

loadFilters();
updateDashboard();

});

function loadFilters(){

populate("itemTypeFilter","item_type");
populate("transactionTypeFilter","transaction_type");
populate("timeFilter","time_of_sale");

}

function populate(id,col){

const select=document.getElementById(id);

[...new Set(masterData.map(x=>x[col]))]
.forEach(v=>{

const opt=document.createElement("option");
opt.value=v;
opt.text=v;
select.appendChild(opt);

});

}

document.querySelectorAll("select").forEach(s=>{

s.addEventListener("change",updateDashboard);

});

function getFilteredData(){

return masterData.filter(row=>{

return (
(!itemTypeFilter.value || row.item_type===itemTypeFilter.value)
&&
(!transactionTypeFilter.value || row.transaction_type===transactionTypeFilter.value)
&&
(!timeFilter.value || row.time_of_sale===timeFilter.value)

);

});

}

let lineChart,pieChart,barChart,transactionChart;

function updateDashboard(){

const data=getFilteredData();

const sales=data.reduce((a,b)=>a+Number(b.transaction_amount),0);

const qty=data.reduce((a,b)=>a+Number(b.quantity),0);

document.getElementById("sales").innerHTML=
"Rs."+sales.toLocaleString();

document.getElementById("avgOrder").innerHTML=
"Rs."+(sales/data.length).toFixed(2);

document.getElementById("orders").innerHTML=
data.length;

document.getElementById("qty").innerHTML=
qty;

drawLine(data);
drawPie(data);
drawBar(data);
drawTransaction(data);

}

function destroyCharts(){

if(lineChart) lineChart.destroy();
if(pieChart) pieChart.destroy();
if(barChart) barChart.destroy();
if(transactionChart) transactionChart.destroy();

}

function drawLine(data){

destroyCharts();

const grouped={};

data.forEach(r=>{

grouped[r.date]=(grouped[r.date]||0)
+Number(r.transaction_amount);

});

lineChart=new Chart(
document.getElementById("salesTrend"),
{
type:'line',
data:{
labels:Object.keys(grouped),
datasets:[{
label:'Sales Trend',
data:Object.values(grouped)
}]
}
});

}

function drawPie(data){

const grouped={};

data.forEach(r=>{

grouped[r.item_name]=(grouped[r.item_name]||0)
+Number(r.quantity);

});

pieChart=new Chart(
document.getElementById("itemPie"),
{
type:'pie',
data:{
labels:Object.keys(grouped),
datasets:[{
data:Object.values(grouped)
}]
}
});

}

function drawBar(data){

const grouped={};

data.forEach(r=>{

grouped[r.item_type]=(grouped[r.item_type]||0)
+Number(r.transaction_amount);

});

barChart=new Chart(
document.getElementById("itemTypeBar"),
{
type:'bar',
data:{
labels:Object.keys(grouped),
datasets:[{
label:'Sales',
data:Object.values(grouped)
}]
}
});

}

function drawTransaction(data){

const grouped={};

data.forEach(r=>{

grouped[r.transaction_type]=(grouped[r.transaction_type]||0)+1;

});

transactionChart=new Chart(
document.getElementById("transactionBar"),
{
type:'bar',
data:{
labels:Object.keys(grouped),
datasets:[{
label:'Orders',
data:Object.values(grouped)
}]
}
});

}
setInterval(()=>{

fetch(url)
.then(res=>res.json())
.then(data=>{

masterData=data;
updateDashboard();

});

},60000);