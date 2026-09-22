const nf = new Intl.NumberFormat('th-TH');
const pct = v => (v*100).toFixed(2) + '%';
const groups = DATA.groupOrder;
const schoolSort = (a,b)=>a.school.localeCompare(b.school,'th');

document.getElementById('schoolCount').textContent = DATA.overall.count;
document.getElementById('m3Total').textContent = nf.format(DATA.overall.m3_total);
document.getElementById('m3App').textContent = nf.format(DATA.overall.m3_app);
document.getElementById('m6Total').textContent = nf.format(DATA.overall.m6_total);
document.getElementById('m6App').textContent = nf.format(DATA.overall.m6_app);
document.getElementById('m3Pct').textContent = pct(DATA.overall.m3_pct);
document.getElementById('m6Pct').textContent = pct(DATA.overall.m6_pct);
document.getElementById('m3Ring').style.setProperty('--p',(DATA.overall.m3_pct*100).toFixed(2));
document.getElementById('m6Ring').style.setProperty('--p',(DATA.overall.m6_pct*100).toFixed(2));
document.getElementById('m3Bar').style.width=(DATA.overall.m3_pct*100)+'%';
document.getElementById('m6Bar').style.width=(DATA.overall.m6_pct*100)+'%';
document.getElementById('m3BarVal').textContent=pct(DATA.overall.m3_pct);
document.getElementById('m6BarVal').textContent=pct(DATA.overall.m6_pct);

const groupGrid = document.getElementById('groupGrid');
groups.forEach(g=>{
  const s=DATA.groupSummaries[g];
  const el=document.createElement('div');
  el.className='card group-card';
  el.onclick=()=>openGroup(g);
  el.innerHTML=`
    <div class="group-name">กลุ่มโรงเรียน${g}</div>
    <div class="group-meta">${s.count} โรงเรียน</div>
    <div class="group-level">
      <div class="group-level-head"><span>ม.3</span><span>${pct(s.m3_pct)}</span></div>
      <div class="small-track"><div class="small-fill" style="width:${s.m3_pct*100}%"></div></div>
    </div>
    <div class="group-level">
      <div class="group-level-head"><span>ม.6</span><span>${pct(s.m6_pct)}</span></div>
      <div class="small-track"><div class="small-fill" style="width:${s.m6_pct*100}%"></div></div>
    </div>
    <div class="click-hint">กดเพื่อดูโรงเรียนในกลุ่ม →</div>`;
  groupGrid.appendChild(el);
});

const buckets=[
  {label:'100%',test:p=>Math.abs(p-1)<1e-9},
  {label:'90–99.99%',test:p=>p>=.9 && p<1},
  {label:'80–89.99%',test:p=>p>=.8 && p<.9},
  {label:'70–79.99%',test:p=>p>=.7 && p<.8},
  {label:'0–69.99%',test:p=>p<.7}
];
function buildRanges(level,target){
  const box=document.getElementById(target);
  buckets.forEach(b=>{
    const items=DATA.schools.filter(s=>b.test(s[level+'_pct']));
    const btn=document.createElement('button');
    btn.className='range-btn';
    btn.onclick=()=>openRange(level,b.label,b.test);
    btn.innerHTML=`${b.label}<b>${items.length}</b><span>โรงเรียน</span>`;
    box.appendChild(btn);
  });
}
buildRanges('m3','m3Ranges'); buildRanges('m6','m6Ranges');

function rowHTML(s){
  return `<div class="school-row" onclick='openSchool(${JSON.stringify(s.school)})'>
    <div><div class="school-name">${s.school}</div><span class="group-tag">กลุ่ม${s.group}</span></div>
    <div class="row-metric">ม.3<b>${pct(s.m3_pct)}</b></div>
    <div class="row-metric">ม.6<b>${pct(s.m6_pct)}</b></div>
  </div>`;
}
function openGroup(g){
  const s=DATA.groupSummaries[g];
  const items=DATA.schools.filter(x=>x.group===g).sort(schoolSort);
  document.getElementById('groupModalTitle').textContent='กลุ่มโรงเรียน'+g;
  document.getElementById('groupModalBody').innerHTML=`
    <div class="group-summary">
      <div class="summary-box"><div class="small">ม.3 • นักเรียน ${nf.format(s.m3_total)} คน • สมัคร ${nf.format(s.m3_app)} คน</div><div class="big">${pct(s.m3_pct)}</div></div>
      <div class="summary-box"><div class="small">ม.6 • นักเรียน ${nf.format(s.m6_total)} คน • สมัคร ${nf.format(s.m6_app)} คน</div><div class="big">${pct(s.m6_pct)}</div></div>
    </div>
    <div class="school-list">${items.map(rowHTML).join('')}</div>`;
  openModal('groupModal');
}
function rangeRowHTML(s,level){
  const levelLabel = level==='m3' ? 'ม.3' : 'ม.6';
  return `<div class="school-row range-school-row" onclick='openSchool(${JSON.stringify(s.school)})'>
    <div><div class="school-name">${s.school}</div><span class="group-tag">กลุ่ม${s.group}</span></div>
    <div class="row-metric">${levelLabel}<b>${pct(s[level+'_pct'])}</b></div>
  </div>`;
}
function openRange(level,label,test){
  const items=DATA.schools.filter(s=>test(s[level+'_pct']));
  if(label==='100%'){
    items.sort(schoolSort);
  }else{
    items.sort((a,b)=>{
      const diff=b[level+'_pct']-a[level+'_pct'];
      return Math.abs(diff)>1e-12 ? diff : a.school.localeCompare(b.school,'th');
    });
  }
  document.getElementById('rangeModalTitle').textContent=`${level==='m3'?'ม.3':'ม.6'} • ${label} • ${items.length} โรงเรียน`;
  document.getElementById('rangeModalBody').innerHTML=`<div class="school-list">${items.map(s=>rangeRowHTML(s,level)).join('')}</div>`;
  openModal('rangeModal');
}
function openSchool(name){
  const s=DATA.schools.find(x=>x.school===name);
  if(!s)return;
  document.getElementById('schoolModalTitle').innerHTML=`${s.school} <span class="group-tag">กลุ่ม${s.group}</span>`;
  document.getElementById('schoolModalBody').innerHTML=`
    <div class="school-detail">
      <div class="detail-card">
        <h4>มัธยมศึกษาปีที่ 3</h4>
        <div class="detail-pct">${pct(s.m3_pct)}</div>
        <div class="detail-grid">
          <div><span>นักเรียนทั้งหมด</span><b>${nf.format(s.m3_total)}</b></div>
          <div><span>สมัครสอบ</span><b>${nf.format(s.m3_app)}</b></div>
        </div>
      </div>
      <div class="detail-card">
        <h4>มัธยมศึกษาปีที่ 6</h4>
        <div class="detail-pct">${pct(s.m6_pct)}</div>
        <div class="detail-grid">
          <div><span>นักเรียนทั้งหมด</span><b>${nf.format(s.m6_total)}</b></div>
          <div><span>สมัครสอบ</span><b>${nf.format(s.m6_app)}</b></div>
        </div>
      </div>
    </div>
    <div class="detail-note">ร้อยละคำนวณโดยเทียบจำนวนผู้สมัครสอบกับฐานข้อมูลจำนวนนักเรียน ปีการศึกษา 2569 รอบที่ 1 ของ สพม.นครราชสีมา</div>`;
  closeModal('groupModal'); closeModal('rangeModal'); closeModal('schoolPicker');
  openModal('schoolModal');
}
let pickerGroup='ทั้งหมด';
function openSchoolPicker(){
  pickerGroup='ทั้งหมด'; buildPicker(); openModal('schoolPicker');
}
function buildPicker(){
  const filter=document.getElementById('groupFilters');
  const opts=['ทั้งหมด',...groups];
  filter.innerHTML=opts.map(g=>`<button class="filter-btn ${g===pickerGroup?'active':''}" onclick="setPickerGroup('${g}')">${g==='ทั้งหมด'?'รวม':'กลุ่ม'+g}</button>`).join('');
  const items=DATA.schools.filter(s=>pickerGroup==='ทั้งหมด'||s.group===pickerGroup).sort(schoolSort);
  document.getElementById('schoolPickerList').innerHTML=`<div class="school-list">${items.map(rowHTML).join('')}</div>`;
}
function setPickerGroup(g){pickerGroup=g;buildPicker()}
function openModal(id){document.getElementById(id).classList.add('open');document.body.style.overflow='hidden'}
function closeModal(id){
  const el=document.getElementById(id); if(el)el.classList.remove('open');
  if(!document.querySelector('.modal.open'))document.body.style.overflow='';
}
function backdropClose(e,id){if(e.target.id===id)closeModal(id)}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(m=>closeModal(m.id))
});
