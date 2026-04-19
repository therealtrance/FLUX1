import React, { useState, useEffect, useRef, useMemo } from “react”;

const PROF=[{v:1,l:“Beginner”,s:“BEG”,c:“var(–c-muted)”},{v:2,l:“Developing”,s:“DEV”,c:“var(–c-info)”},{v:3,l:“Proficient”,s:“PRO”,c:“var(–c-secondary)”},{v:4,l:“Advanced”,s:“ADV”,c:“var(–c-warning)”},{v:5,l:“Mastery”,s:“MAS”,c:“var(–c-success)”}];
const TRKST=[{id:“planned”,l:“Planned”,c:“var(–c-muted)”},{id:“active”,l:“Active”,c:“var(–c-info)”},{id:“review”,l:“In Review”,c:“var(–c-purple)”},{id:“complete”,l:“Complete”,c:“var(–c-success)”},{id:“blocked”,l:“Blocked”,c:“var(–c-danger)”}];
const PC={Critical:“var(–c-danger)”,High:“var(–c-warning)”,Medium:“var(–c-success)”,Low:“var(–c-info)”};
const STAGE=[{v:1,l:“Discovery”,s:“1”,c:“var(–c-purple)”},{v:2,l:“Define”,s:“2”,c:“var(–c-info)”},{v:3,l:“Design”,s:“3”,c:“var(–c-primary)”},{v:4,l:“Deliver”,s:“4”,c:“var(–c-warning)”},{v:5,l:“Done”,s:“5”,c:“var(–c-muted)”}];
const sv=v=>STAGE.find(s=>s.v===v)||STAGE[0];
const SCC=[“var(–c-success)”,“var(–c-info)”,“var(–c-purple)”,“var(–c-warning)”,“var(–c-secondary)”,“var(–c-danger)”];
const GCOLS=[“var(–c-success)”,“var(–c-info)”,“var(–c-purple)”,“var(–c-warning)”,“var(–c-secondary)”,“var(–c-danger)”,“var(–c-primary)”];
const EMPT=[“FTE”,“Contractor”,“Part-time”,“Consultant”];
const TABS=[“home”,“plan”,“team”,“analyze”];
const PLAN_VIEWS=[“projects”,“scenarios”,“timeline”];
const TEAM_VIEWS=[“roster”,“skills”];
const ANALYZE_VIEWS=[“growth”,“reports”];

const uid=()=>Math.random().toString(36).slice(2,9);
const ini=n=>n.trim().split(/\s+/).map(w=>w[0]).join(””).toUpperCase().slice(0,2)||”?”;

const fd=d=>d?new Date(d+“T12:00:00”).toLocaleDateString(“en-US”,{month:“short”,day:“numeric”,year:“2-digit”}):”—”;
const pv=v=>PROF.find(p=>p.v===v)||PROF[0];
const tv=id=>TRKST.find(s=>s.id===id)||TRKST[0];
const pFTE=p=>+((p.roster||[]).reduce((s,r)=>s+r.alloc/100,0).toFixed(1));
const mLoad=(id,ps)=>ps.reduce((s,p)=>s+((p.roster||[]).find(r=>r.mId===id)?.alloc||0),0);
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);

function buildGaps(team,projs,scs,skills){
const asc=scs.find(s=>s.active);
const ap=asc?projs.filter(p=>p.scId===asc.id&&p.type!==“side”):[];
const out=[];
team.forEach(m=>ap.forEach(p=>{
Object.entries(p.sr||{}).forEach(([sid,req])=>{
const cur=m.sp?.[sid]||0;
if(req>cur){const sk=skills.find(s=>s.id===sid);out.push({mId:m.id,mName:m.name,pId:p.id,pName:p.name,sid,sName:sk?.name||sid,sColor:sk?.color||”#888”,cur,req,delta:req-cur,prio:p.prio});}
});
}));
const ps={Critical:4,High:3,Medium:2,Low:1};
return out.sort((a,b)=>(b.delta*(ps[b.prio]||1))-(a.delta*(ps[a.prio]||1)));
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const D0=[{id:“d1”,name:“Product Design”,color:”#00e5a0”},{id:“d2”,name:“Service Design”,color:”#38bdf8”},{id:“d3”,name:“Platform/Systems”,color:”#a78bfa”},{id:“d4”,name:“Research & Ops”,color:”#fb923c”}];
const SK0=[{id:“s1”,name:“User Research”,cat:“Discovery”,color:”#a78bfa”},{id:“s2”,name:“Facilitation”,cat:“Discovery”,color:”#a78bfa”},{id:“s3”,name:“IA”,cat:“Structure”,color:”#38bdf8”},{id:“s4”,name:“Systems Design”,cat:“Structure”,color:”#38bdf8”},{id:“s5”,name:“Interaction Design”,cat:“Craft”,color:”#00e5a0”},{id:“s6”,name:“Prototyping”,cat:“Craft”,color:”#00e5a0”},{id:“s7”,name:“Visual Design”,cat:“Craft”,color:”#00e5a0”},{id:“s8”,name:“Content Strategy”,cat:“Strategy”,color:”#fb923c”}];
const TM0=[{id:“t1”,name:“Maya Chen”,role:“Sr. UX Designer”,discId:“d1”,sp:{“s5”:4,“s6”:4,“s7”:3},cap:80,avatar:“MC”,emp:“FTE”,rate:650,hrs:32,powers:[{id:“pw1”,name:“Workshop Design”,level:4},{id:“pw2”,name:“Storytelling”,level:3}]},{id:“t2”,name:“Jordan Webb”,role:“UX Researcher”,discId:“d4”,sp:{“s1”:5,“s2”:4,“s8”:3},cap:100,avatar:“JW”,emp:“FTE”,rate:600,hrs:40,powers:[{id:“pw3”,name:“Human Centered Design”,level:5}]},{id:“t3”,name:“Sam Rivera”,role:“UX Architect”,discId:“d3”,sp:{“s3”:4,“s4”:5,“s5”:3},cap:100,avatar:“SR”,emp:“FTE”,rate:700,hrs:40,powers:[{id:“pw4”,name:“Technical Writing”,level:3},{id:“pw5”,name:“Developer Advocacy”,level:4}]},{id:“t4”,name:“Alex Kim”,role:“Visual Designer”,discId:“d1”,sp:{“s7”:4,“s6”:3,“s8”:2},cap:60,avatar:“AK”,emp:“Contractor”,rate:900,hrs:24,powers:[{id:“pw6”,name:“Motion Design”,level:4}]}];
const SC0=[{id:“sc1”,name:“Q3 Roadmap”,desc:“Committed Q3 deliverables”,color:”#00e5a0”,active:true},{id:“sc2”,name:“Stretch Plan”,desc:“If we hit hiring targets”,color:”#38bdf8”,active:false}];
const PR0=[
{id:“p1”,scId:“sc1”,name:“Mobile App Redesign”,type:“full”,stage:3,sr:{“s5”:3,“s7”:3,“s6”:3},prio:“High”,due:“2025-09-15”,fte:2,owner:“Maya Chen”,notes:“Full redesign of mobile app — needs strong IxD and visual design coverage.”,
roster:[{id:“r1”,mId:“t1”,alloc:60,role:“Lead Designer”,start:“2025-07-01”,end:“2025-09-15”},{id:“r2”,mId:“t4”,alloc:50,role:“Visual Designer”,start:“2025-07-15”,end:“2025-09-15”}],
tracks:[{id:“tr1”,name:“Discovery”,status:“complete”,ownId:“t2”,start:“2025-07-01”,end:“2025-07-14”,desc:“User interviews”,fte:0},{id:“tr2”,name:“Design”,status:“active”,ownId:“t1”,start:“2025-07-15”,end:“2025-08-31”,desc:“Core flows”,fte:0},{id:“tr3”,name:“Handoff”,status:“planned”,ownId:“t1”,start:“2025-09-01”,end:“2025-09-15”,desc:“Spec delivery”,fte:0}]},
{id:“p2”,scId:“sc1”,name:“Enterprise Dashboard”,type:“full”,stage:4,sr:{“s3”:4,“s4”:4,“s5”:3},prio:“Critical”,due:“2025-08-31”,fte:3,owner:“Sam Rivera”,notes:“Executive priority. Complex IA requirements, must ship before Q4 planning.”,
roster:[{id:“r3”,mId:“t3”,alloc:80,role:“UX Architect”,start:“2025-07-01”,end:“2025-08-31”},{id:“r4”,mId:“t1”,alloc:30,role:“IxD Support”,start:“2025-07-01”,end:“2025-08-15”}],
tracks:[{id:“tr4”,name:“Architecture”,status:“complete”,ownId:“t3”,start:“2025-07-01”,end:“2025-07-21”,desc:“IA model”,fte:0},{id:“tr5”,name:“Components”,status:“active”,ownId:“t3”,start:“2025-07-22”,end:“2025-08-15”,desc:“Component library”,fte:0},{id:“tr6”,name:“Integration”,status:“planned”,ownId:“t1”,start:“2025-08-16”,end:“2025-08-31”,desc:“Data binding”,fte:0}]},
{id:“p3”,scId:“sc1”,name:“User Research Sprint”,type:“full”,stage:1,sr:{“s1”:3,“s2”:3},prio:“Medium”,due:“2025-08-15”,fte:1,owner:“Jordan Webb”,notes:“Foundational research to inform product roadmap. Recruiting begins July 1.”,
roster:[{id:“r5”,mId:“t2”,alloc:70,role:“Lead Researcher”,start:“2025-07-01”,end:“2025-08-15”}],
tracks:[{id:“tr7”,name:“Recruitment”,status:“complete”,ownId:“t2”,start:“2025-07-01”,end:“2025-07-10”,desc:“Screener”,fte:0},{id:“tr8”,name:“Fieldwork”,status:“active”,ownId:“t2”,start:“2025-07-11”,end:“2025-07-31”,desc:“Sessions”,fte:0},{id:“tr9”,name:“Synthesis”,status:“planned”,ownId:“t2”,start:“2025-08-01”,end:“2025-08-15”,desc:“Insights”,fte:0}]},
{id:“p4”,scId:“sc2”,name:“Design System v2”,type:“full”,stage:2,sr:{“s4”:4,“s7”:3},prio:“High”,due:“2025-10-31”,fte:2,owner:“Sam Rivera”,notes:“v2 overhaul — consolidate token architecture and migrate legacy components.”,
roster:[{id:“r6”,mId:“t3”,alloc:60,role:“Systems Lead”,start:“2025-09-01”,end:“2025-10-31”},{id:“r7”,mId:“t4”,alloc:40,role:“Visual Systems”,start:“2025-09-01”,end:“2025-10-31”}],
tracks:[{id:“tr10”,name:“Audit”,status:“planned”,ownId:“t3”,start:“2025-09-01”,end:“2025-09-15”,desc:“Inventory”,fte:0},{id:“tr11”,name:“Foundation”,status:“planned”,ownId:“t4”,start:“2025-09-16”,end:“2025-10-15”,desc:“Tokens”,fte:0},{id:“tr12”,name:“Migration”,status:“planned”,ownId:“t3”,start:“2025-10-16”,end:“2025-10-31”,desc:“Adoption”,fte:0}]},
{id:“p5”,scId:“sc1”,name:“Design Guild”,type:“side”,stage:1,sr:{},prio:“Low”,due:””,fte:0.2,owner:“Maya Chen”,notes:“Bi-weekly design guild — all hands session. Ongoing capacity hold.”,
roster:[{id:“r8”,mId:“t1”,alloc:10,role:“Facilitator”,start:“2025-07-01”,end:“2025-12-31”},{id:“r9”,mId:“t2”,alloc:10,role:“Contributor”,start:“2025-07-01”,end:“2025-12-31”},{id:“r10”,mId:“t3”,alloc:10,role:“Contributor”,start:“2025-07-01”,end:“2025-12-31”}],
tracks:[]},
];

// ── Themes ────────────────────────────────────────────────────────────────────
// Each theme declares surface/border/text tokens PLUS 8 semantic color roles:
//   –c-primary  –c-secondary  –c-success  –c-warning
//   –c-danger   –c-info       –c-purple   –c-muted
// PROF, TRKST, STAGE, PC, SCC, GCOLS all reference these via CSS vars.

const THEMES={
onedark:{id:“onedark”,label:“One Dark Pro”,dark:true,swatch:[”#61afef”,”#c678dd”],
vars:{”–bg”:”#21252b”,”–bg-grad”:“rgba(198,120,221,.05)”,
“–surface1”:”#282c34”,”–surface2”:”#2c313a”,”–surface-card”:”#282c34”,”–surface-raise”:”#21252b”,”–surface-hover”:”#3e4451”,
“–border1”:“rgba(255,255,255,.1)”,”–border2”:“rgba(255,255,255,.15)”,”–border3”:“rgba(255,255,255,.22)”,
“–nav-bg”:“rgba(33,37,43,.97)”,”–nav-bgb”:“rgba(33,37,43,.99)”,”–drawer-bg”:”#21252b”,”–select-bg”:”#21252b”,
“–accent”:”#61afef”,”–accent-rgb”:“97,175,239”,”–accent2”:”#c678dd”,”–accent2-rgb”:“198,120,221”,”–on-accent”:”#21252b”,
“–text1”:”#abb2bf”,”–text2”:”#828997”,”–text3”:”#5c6370”,”–text4”:”#4b5263”,
“–ib-color”:”#5c6370”,”–ib-hover-bg”:“rgba(255,255,255,.08)”,”–ib-hover-col”:”#abb2bf”,
“–dis-bg”:“rgba(255,255,255,.08)”,”–dis-col”:“rgba(255,255,255,.3)”,
“–c-primary”:”#61afef”,”–c-secondary”:”#c678dd”,”–c-success”:”#98c379”,
“–c-warning”:”#e5c07b”,”–c-danger”:”#e06c75”,”–c-info”:”#56b6c2”,
“–c-purple”:”#c678dd”,”–c-muted”:”#5c6370”}},

tokyonight:{id:“tokyonight”,label:“Tokyo Night”,dark:true,swatch:[”#7aa2f7”,”#bb9af7”],
vars:{”–bg”:”#16161e”,”–bg-grad”:“rgba(122,162,247,.05)”,
“–surface1”:”#1a1b26”,”–surface2”:”#1f2335”,”–surface-card”:”#1a1b26”,”–surface-raise”:”#16161e”,”–surface-hover”:”#24283b”,
“–border1”:“rgba(122,162,247,.12)”,”–border2”:“rgba(122,162,247,.18)”,”–border3”:“rgba(122,162,247,.28)”,
“–nav-bg”:“rgba(22,22,30,.97)”,”–nav-bgb”:“rgba(22,22,30,.99)”,”–drawer-bg”:”#16161e”,”–select-bg”:”#16161e”,
“–accent”:”#7aa2f7”,”–accent-rgb”:“122,162,247”,”–accent2”:”#bb9af7”,”–accent2-rgb”:“187,154,247”,”–on-accent”:”#16161e”,
“–text1”:”#c0caf5”,”–text2”:”#9aa5ce”,”–text3”:”#565f89”,”–text4”:”#414868”,
“–ib-color”:”#565f89”,”–ib-hover-bg”:“rgba(122,162,247,.1)”,”–ib-hover-col”:”#c0caf5”,
“–dis-bg”:“rgba(255,255,255,.08)”,”–dis-col”:“rgba(255,255,255,.28)”,
“–c-primary”:”#7aa2f7”,”–c-secondary”:”#bb9af7”,”–c-success”:”#9ece6a”,
“–c-warning”:”#e0af68”,”–c-danger”:”#f7768e”,”–c-info”:”#7dcfff”,
“–c-purple”:”#bb9af7”,”–c-muted”:”#565f89”}},

mocha:{id:“mocha”,label:“Catppuccin Mocha”,dark:true,swatch:[”#cba6f7”,”#89dceb”],
vars:{”–bg”:”#181825”,”–bg-grad”:“rgba(203,166,247,.05)”,
“–surface1”:”#1e1e2e”,”–surface2”:”#313244”,”–surface-card”:”#1e1e2e”,”–surface-raise”:”#181825”,”–surface-hover”:”#313244”,
“–border1”:“rgba(203,166,247,.12)”,”–border2”:“rgba(203,166,247,.18)”,”–border3”:“rgba(203,166,247,.26)”,
“–nav-bg”:“rgba(24,24,37,.97)”,”–nav-bgb”:“rgba(24,24,37,.99)”,”–drawer-bg”:”#181825”,”–select-bg”:”#181825”,
“–accent”:”#cba6f7”,”–accent-rgb”:“203,166,247”,”–accent2”:”#89dceb”,”–accent2-rgb”:“137,220,235”,”–on-accent”:”#181825”,
“–text1”:”#cdd6f4”,”–text2”:”#bac2de”,”–text3”:”#6c7086”,”–text4”:”#585b70”,
“–ib-color”:”#6c7086”,”–ib-hover-bg”:“rgba(203,166,247,.1)”,”–ib-hover-col”:”#cdd6f4”,
“–dis-bg”:“rgba(255,255,255,.08)”,”–dis-col”:“rgba(255,255,255,.28)”,
“–c-primary”:”#89b4fa”,”–c-secondary”:”#cba6f7”,”–c-success”:”#a6e3a1”,
“–c-warning”:”#fab387”,”–c-danger”:”#f38ba8”,”–c-info”:”#89dceb”,
“–c-purple”:”#cba6f7”,”–c-muted”:”#6c7086”}},

nord:{id:“nord”,label:“Nord”,dark:true,swatch:[”#88c0d0”,”#81a1c1”],
vars:{”–bg”:”#242933”,”–bg-grad”:“rgba(136,192,208,.04)”,
“–surface1”:”#2e3440”,”–surface2”:”#3b4252”,”–surface-card”:”#2e3440”,”–surface-raise”:”#242933”,”–surface-hover”:”#434c5e”,
“–border1”:“rgba(216,222,233,.1)”,”–border2”:“rgba(216,222,233,.16)”,”–border3”:“rgba(216,222,233,.24)”,
“–nav-bg”:“rgba(36,41,51,.97)”,”–nav-bgb”:“rgba(36,41,51,.99)”,”–drawer-bg”:”#242933”,”–select-bg”:”#242933”,
“–accent”:”#88c0d0”,”–accent-rgb”:“136,192,208”,”–accent2”:”#81a1c1”,”–accent2-rgb”:“129,161,193”,”–on-accent”:”#242933”,
“–text1”:”#eceff4”,”–text2”:”#d8dee9”,”–text3”:”#7b88a1”,”–text4”:”#616e87”,
“–ib-color”:”#7b88a1”,”–ib-hover-bg”:“rgba(216,222,233,.08)”,”–ib-hover-col”:”#eceff4”,
“–dis-bg”:“rgba(255,255,255,.08)”,”–dis-col”:“rgba(255,255,255,.28)”,
“–c-primary”:”#88c0d0”,”–c-secondary”:”#81a1c1”,”–c-success”:”#a3be8c”,
“–c-warning”:”#ebcb8b”,”–c-danger”:”#bf616a”,”–c-info”:”#88c0d0”,
“–c-purple”:”#b48ead”,”–c-muted”:”#7b88a1”}},

gruvbox:{id:“gruvbox”,label:“Gruvbox Dark”,dark:true,swatch:[”#fabd2f”,”#b8bb26”],
vars:{”–bg”:”#1d2021”,”–bg-grad”:“rgba(250,189,47,.04)”,
“–surface1”:”#282828”,”–surface2”:”#3c3836”,”–surface-card”:”#282828”,”–surface-raise”:”#1d2021”,”–surface-hover”:”#504945”,
“–border1”:“rgba(235,219,178,.1)”,”–border2”:“rgba(235,219,178,.16)”,”–border3”:“rgba(235,219,178,.24)”,
“–nav-bg”:“rgba(29,32,33,.97)”,”–nav-bgb”:“rgba(29,32,33,.99)”,”–drawer-bg”:”#1d2021”,”–select-bg”:”#1d2021”,
“–accent”:”#fabd2f”,”–accent-rgb”:“250,189,47”,”–accent2”:”#b8bb26”,”–accent2-rgb”:“184,187,38”,”–on-accent”:”#1d2021”,
“–text1”:”#ebdbb2”,”–text2”:”#bdae93”,”–text3”:”#7c6f64”,”–text4”:”#665c54”,
“–ib-color”:”#7c6f64”,”–ib-hover-bg”:“rgba(235,219,178,.08)”,”–ib-hover-col”:”#ebdbb2”,
“–dis-bg”:“rgba(255,255,255,.08)”,”–dis-col”:“rgba(255,255,255,.28)”,
“–c-primary”:”#83a598”,”–c-secondary”:”#d3869b”,”–c-success”:”#b8bb26”,
“–c-warning”:”#fabd2f”,”–c-danger”:”#fb4934”,”–c-info”:”#83a598”,
“–c-purple”:”#d3869b”,”–c-muted”:”#7c6f64”}},

rosepine:{id:“rosepine”,label:“Rosé Pine”,dark:true,swatch:[”#ebbcba”,”#c4a7e7”],
vars:{”–bg”:”#17151f”,”–bg-grad”:“rgba(235,188,186,.04)”,
“–surface1”:”#1f1d2e”,”–surface2”:”#26233a”,”–surface-card”:”#1f1d2e”,”–surface-raise”:”#17151f”,”–surface-hover”:”#393552”,
“–border1”:“rgba(235,188,186,.1)”,”–border2”:“rgba(235,188,186,.16)”,”–border3”:“rgba(235,188,186,.24)”,
“–nav-bg”:“rgba(23,21,31,.97)”,”–nav-bgb”:“rgba(23,21,31,.99)”,”–drawer-bg”:”#17151f”,”–select-bg”:”#17151f”,
“–accent”:”#ebbcba”,”–accent-rgb”:“235,188,186”,”–accent2”:”#c4a7e7”,”–accent2-rgb”:“196,167,231”,”–on-accent”:”#17151f”,
“–text1”:”#e0def4”,”–text2”:”#9893a5”,”–text3”:”#6e6a86”,”–text4”:”#524f67”,
“–ib-color”:”#6e6a86”,”–ib-hover-bg”:“rgba(235,188,186,.1)”,”–ib-hover-col”:”#e0def4”,
“–dis-bg”:“rgba(255,255,255,.08)”,”–dis-col”:“rgba(255,255,255,.28)”,
“–c-primary”:”#9ccfd8”,”–c-secondary”:”#c4a7e7”,”–c-success”:”#31748f”,
“–c-warning”:”#f6c177”,”–c-danger”:”#eb6f92”,”–c-info”:”#9ccfd8”,
“–c-purple”:”#c4a7e7”,”–c-muted”:”#6e6a86”}},

github:{id:“github”,label:“GitHub Light”,dark:false,swatch:[”#0969da”,”#8250df”],
vars:{”–bg”:”#f6f8fa”,”–bg-grad”:“rgba(9,105,218,.03)”,
“–surface1”:”#ffffff”,”–surface2”:”#ffffff”,”–surface-card”:”#ffffff”,”–surface-raise”:”#ffffff”,”–surface-hover”:”#f3f4f6”,
“–border1”:”#d0d7de”,”–border2”:”#c4cdd5”,”–border3”:”#9da7b0”,
“–nav-bg”:“rgba(246,248,250,.97)”,”–nav-bgb”:“rgba(246,248,250,.98)”,”–drawer-bg”:”#ffffff”,”–select-bg”:”#ffffff”,
“–accent”:”#0969da”,”–accent-rgb”:“9,105,218”,”–accent2”:”#8250df”,”–accent2-rgb”:“130,80,223”,”–on-accent”:”#ffffff”,
“–text1”:”#1f2328”,”–text2”:”#636c76”,”–text3”:”#8c959f”,”–text4”:”#adb5bd”,
“–ib-color”:”#57606a”,”–ib-hover-bg”:“rgba(175,184,193,.2)”,”–ib-hover-col”:”#24292f”,
“–dis-bg”:“rgba(175,184,193,.2)”,”–dis-col”:”#8c959f”,
“–c-primary”:”#0969da”,”–c-secondary”:”#8250df”,”–c-success”:”#1a7f37”,
“–c-warning”:”#9a6700”,”–c-danger”:”#cf222e”,”–c-info”:”#0550ae”,
“–c-purple”:”#8250df”,”–c-muted”:”#8c959f”}},

latte:{id:“latte”,label:“Catppuccin Latte”,dark:false,swatch:[”#1e66f5”,”#8839ef”],
vars:{”–bg”:”#dce0e8”,”–bg-grad”:“rgba(30,102,245,.03)”,
“–surface1”:”#eff1f5”,”–surface2”:”#ffffff”,”–surface-card”:”#ffffff”,”–surface-raise”:”#ffffff”,”–surface-hover”:”#e6e9ef”,
“–border1”:”#ccd0da”,”–border2”:”#bcc0cc”,”–border3”:”#9ca0b0”,
“–nav-bg”:“rgba(239,241,245,.97)”,”–nav-bgb”:“rgba(239,241,245,.98)”,”–drawer-bg”:”#eff1f5”,”–select-bg”:”#ffffff”,
“–accent”:”#1e66f5”,”–accent-rgb”:“30,102,245”,”–accent2”:”#8839ef”,”–accent2-rgb”:“136,57,239”,”–on-accent”:”#eff1f5”,
“–text1”:”#4c4f69”,”–text2”:”#5c5f77”,”–text3”:”#7c7f93”,”–text4”:”#9ca0b0”,
“–ib-color”:”#6c6f85”,”–ib-hover-bg”:“rgba(76,79,105,.1)”,”–ib-hover-col”:”#4c4f69”,
“–dis-bg”:“rgba(76,79,105,.1)”,”–dis-col”:”#9ca0b0”,
“–c-primary”:”#1e66f5”,”–c-secondary”:”#8839ef”,”–c-success”:”#40a02b”,
“–c-warning”:”#df8e1d”,”–c-danger”:”#d20f39”,”–c-info”:”#04a5e5”,
“–c-purple”:”#8839ef”,”–c-muted”:”#7c7f93”}},

solarized:{id:“solarized”,label:“Solarized Light”,dark:false,swatch:[”#268bd2”,”#2aa198”],
vars:{”–bg”:”#eee8d5”,”–bg-grad”:“rgba(38,139,210,.03)”,
“–surface1”:”#fdf6e3”,”–surface2”:”#fdf6e3”,”–surface-card”:”#fdf6e3”,”–surface-raise”:”#fdf6e3”,”–surface-hover”:”#e8e2cf”,
“–border1”:”#d3cdb9”,”–border2”:”#c5bfab”,”–border3”:”#a89f88”,
“–nav-bg”:“rgba(238,232,213,.97)”,”–nav-bgb”:“rgba(238,232,213,.98)”,”–drawer-bg”:”#fdf6e3”,”–select-bg”:”#fdf6e3”,
“–accent”:”#268bd2”,”–accent-rgb”:“38,139,210”,”–accent2”:”#2aa198”,”–accent2-rgb”:“42,161,152”,”–on-accent”:”#fdf6e3”,
“–text1”:”#073642”,”–text2”:”#586e75”,”–text3”:”#839496”,”–text4”:”#93a1a1”,
“–ib-color”:”#586e75”,”–ib-hover-bg”:“rgba(7,54,66,.1)”,”–ib-hover-col”:”#073642”,
“–dis-bg”:“rgba(7,54,66,.1)”,”–dis-col”:”#839496”,
“–c-primary”:”#268bd2”,”–c-secondary”:”#6c71c4”,”–c-success”:”#859900”,
“–c-warning”:”#b58900”,”–c-danger”:”#dc322f”,”–c-info”:”#2aa198”,
“–c-purple”:”#6c71c4”,”–c-muted”:”#93a1a1”}},

gruvboxlight:{id:“gruvboxlight”,label:“Gruvbox Light”,dark:false,swatch:[”#b57614”,”#427b58”],
vars:{”–bg”:”#f2e5bc”,”–bg-grad”:“rgba(181,118,20,.03)”,
“–surface1”:”#fbf1c7”,”–surface2”:”#fbf1c7”,”–surface-card”:”#fbf1c7”,”–surface-raise”:”#fbf1c7”,”–surface-hover”:”#ebdbb2”,
“–border1”:”#d5c4a1”,”–border2”:”#bdae93”,”–border3”:”#a89984”,
“–nav-bg”:“rgba(242,229,188,.97)”,”–nav-bgb”:“rgba(242,229,188,.98)”,”–drawer-bg”:”#fbf1c7”,”–select-bg”:”#fbf1c7”,
“–accent”:”#b57614”,”–accent-rgb”:“181,118,20”,”–accent2”:”#427b58”,”–accent2-rgb”:“66,123,88”,”–on-accent”:”#fbf1c7”,
“–text1”:”#3c3836”,”–text2”:”#504945”,”–text3”:”#665c54”,”–text4”:”#7c6f64”,
“–ib-color”:”#504945”,”–ib-hover-bg”:“rgba(60,56,54,.1)”,”–ib-hover-col”:”#3c3836”,
“–dis-bg”:“rgba(60,56,54,.1)”,”–dis-col”:”#7c6f64”,
“–c-primary”:”#458588”,”–c-secondary”:”#b16286”,”–c-success”:”#79740e”,
“–c-warning”:”#b57614”,”–c-danger”:”#cc241d”,”–c-info”:”#689d6a”,
“–c-purple”:”#8f3f71”,”–c-muted”:”#7c6f64”}},
};
// ── CSS ───────────────────────────────────────────────────────────────────────
function getCSS(theme){
const vars=Object.entries(theme.vars).map(([k,v])=>`${k}:${v}`).join(’;’);
return `:root{${vars}} @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;} body{background:var(--bg);color:var(--text1);font-family:'Inter',system-ui,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;font-size:14px;} ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;} input,select,textarea{-webkit-appearance:none;appearance:none;} input::placeholder,textarea::placeholder{color:var(--text4);} select option{background:var(--select-bg);color:var(--text1);} button{touch-action:manipulation;cursor:pointer;font-family:inherit;border:none;} a{color:var(--accent);} .page{max-width:960px;margin:0 auto;padding:24px 16px 100px;} .card{background:var(--surface-card);border:1px solid var(--border1);border-radius:8px;}.card-p{padding:16px;} .inp{background:var(--surface-raise);border:1px solid var(--border2);border-radius:6px;padding:8px 12px;color:var(--text1);font-family:'Inter',system-ui,sans-serif;font-size:14px;outline:none;width:100%;display:block;transition:border-color .15s,box-shadow .15s;line-height:1.4;} textarea.inp{resize:vertical;min-height:80px;line-height:1.6;} .inp:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(var(--accent-rgb),.12);} .inp-err{border-color:var(--c-danger)!important;box-shadow:0 0 0 2px rgba(var(--c-danger),.1)!important;} .btn-p{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;border-radius:6px;font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.05em;text-transform:uppercase;font-weight:600;background:var(--accent);color:var(--on-accent);min-height:36px;transition:opacity .15s;} .btn-p:hover:not(:disabled){opacity:.88;} .btn-p:active:not(:disabled){opacity:.76;} .btn-p:disabled{opacity:.38;cursor:not-allowed;} .btn-g{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;border-radius:6px;border:1px solid var(--border2);font-size:12px;font-family:'DM Mono',monospace;letter-spacing:.05em;text-transform:uppercase;background:transparent;color:var(--text2);min-height:36px;transition:background .12s,color .12s,border-color .12s;} .btn-g:hover{background:var(--surface-hover);color:var(--text1);border-color:var(--border3);} .btn-sm{padding:4px 10px!important;min-height:28px!important;font-size:10px!important;} .ib{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:5px;border:none;background:transparent;color:var(--ib-color);flex-shrink:0;transition:background .1s,color .1s;} .ib:hover{background:var(--surface-hover);color:var(--ib-hover-col);} .ib-d:hover{background:rgba(var(--c-danger),.1)!important;color:var(--c-danger)!important;} .ib-sm{width:24px!important;height:24px!important;} .inp-sm{background:var(--surface-raise);border:1px solid var(--border2);border-radius:4px;padding:4px 8px;color:var(--text1);font-family:'DM Mono',monospace;font-size:11px;outline:none;transition:border-color .15s;} .inp-sm:focus{border-color:var(--accent);} .topnav{border-bottom:1px solid var(--border1);padding:0 20px;height:52px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--nav-bg);z-index:100;} .tnav{display:none;gap:2px;} .tnav-btn{padding:6px 12px;border-radius:5px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;background:transparent;color:var(--text3);display:flex;align-items:center;gap:5px;position:relative;transition:color .12s,background .12s;} .tnav-btn:hover{color:var(--text2);background:var(--surface-hover);} .tnav-btn.on{color:var(--text1);background:var(--surface-hover);} .tnav-line{position:absolute;bottom:0;left:8px;right:8px;height:2px;background:var(--accent);border-radius:2px 2px 0 0;} .bnav{position:fixed;bottom:0;left:0;right:0;z-index:100;background:var(--nav-bgb);border-top:1px solid var(--border1);display:flex;padding:0 4px env(safe-area-inset-bottom,0);} .bni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:9px 2px;position:relative;} .lbl{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;display:block;line-height:1.3;} .lbl-e{color:var(--c-danger);} .mono{font-family:'DM Mono',monospace;} .capbar{background:var(--border1);border-radius:2px;height:4px;overflow:hidden;} .fpanel{border-radius:8px;padding:20px;margin-bottom:16px;} .fp-g{background:var(--surface-card);border:1px solid var(--border1);border-top:2px solid var(--accent);} .fp-b{background:var(--surface-card);border:1px solid var(--border1);border-top:2px solid var(--c-info);} .roster-panel{margin-top:12px;background:var(--surface-card);border:1px solid var(--border1);border-radius:6px;padding:12px;} .track-panel{margin-top:12px;background:var(--surface-card);border:1px solid var(--border1);border-left:2px solid var(--c-info);border-radius:0 6px 6px 0;padding:12px;} .vpill{padding:5px 12px;border-radius:5px;font-size:11px;font-family:'DM Mono',monospace;letter-spacing:.05em;text-transform:uppercase;min-height:32px;background:transparent;border:1px solid var(--border2);color:var(--text3);transition:background .12s,color .12s,border-color .12s;} .vpill:hover{background:var(--surface-hover);color:var(--text2);border-color:var(--border2);} .vpill.on{background:var(--surface-hover);border-color:var(--accent);color:var(--accent);} .avatar{border-radius:6px;background:var(--surface-hover);border:1px solid var(--border1);display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;font-weight:700;flex-shrink:0;color:var(--text2);} .chat-bubble{max-width:84%;padding:10px 14px;font-size:14px;line-height:1.65;color:var(--text1);white-space:pre-wrap;} .bub-ai{background:var(--surface-card);border:1px solid var(--border1);border-radius:2px 10px 10px 10px;} .bub-user{background:var(--surface-hover);border:1px solid var(--border2);border-radius:10px 2px 10px 10px;} @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}} .fu{animation:fu .2s ease both;} .acc-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .2s ease;overflow:hidden;} .acc-body.open{grid-template-rows:1fr;} .acc-body>div{overflow:hidden;} .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;} .drawer{position:fixed;bottom:0;left:0;right:0;z-index:201;background:var(--drawer-bg);border-top:1px solid var(--border1);border-radius:12px 12px 0 0;padding:0 0 env(safe-area-inset-bottom,0);} .drawer-handle{width:32px;height:3px;background:var(--border2);border-radius:2px;margin:10px auto 0;} .fab{position:fixed;bottom:calc(60px + env(safe-area-inset-bottom,0) + 12px);right:16px;width:40px;height:40px;border-radius:8px;background:var(--accent);border:none;display:flex;align-items:center;justify-content:center;z-index:150;cursor:pointer;} @media(min-width:640px){.fab{bottom:24px;right:24px;}} .badge{display:inline-flex;align-items:center;gap:4px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;padding:2px 7px;border-radius:4px;line-height:1.4;} .badge-sm{padding:1px 6px;font-size:10px;} .badge-outline{background:transparent;border:1px solid var(--border2);color:var(--text3);} .badge-accent{background:rgba(var(--accent-rgb),.1);border:1px solid rgba(var(--accent-rgb),.25);color:var(--accent);} .badge-accent2{background:rgba(var(--accent2-rgb),.1);border:1px solid rgba(var(--accent2-rgb),.25);color:var(--accent2);} .badge-ok{background:rgba(var(--c-success-rgb,34,197,94),.1);border:1px solid var(--c-success);color:var(--c-success);} .badge-warn{background:rgba(var(--c-warning-rgb,234,88,12),.1);border:1px solid var(--c-warning);color:var(--c-warning);} .badge-err{background:rgba(var(--c-danger-rgb,220,38,38),.1);border:1px solid var(--c-danger);color:var(--c-danger);} .badge-neutral{background:var(--surface-hover);border:1px solid var(--border1);color:var(--text3);} .theme-select{appearance:none;-webkit-appearance:none;background:var(--surface-card);border:1px solid var(--border2);border-radius:5px;padding:5px 26px 5px 10px;color:var(--text1);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.04em;cursor:pointer;outline:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%23888' stroke-width='1.5'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;min-height:28px;} .theme-select:focus{outline:none;border-color:var(--accent);} @media(min-width:640px){.bnav{display:none!important;}.tnav{display:flex!important;}.page{padding:24px 32px 32px;}} @media(max-width:639px){.tnav{display:none!important;}.page{padding-bottom:90px;}} `;}

// ── Tiny shared UI ────────────────────────────────────────────────────────────
function Lbl({children,err}){return <span className={err?“lbl lbl-e”:“lbl”}>{children}</span>;}
function CapBar({used,total}){const p=clamp(total>0?(used/total)*100:0,0,100);const c=p>=90?“var(–c-danger)”:p>=70?“var(–c-warning)”:“var(–c-success)”;return <div className="capbar"><div style={{width:`${p}%`,height:“100%”,borderRadius:99,background:c,transition:“width .4s”}}/></div>;}
function Pips({v,color}){return <div style={{display:“flex”,gap:3}}>{[1,2,3,4,5].map(i=><span key={i} style={{width:10,height:10,borderRadius:3,background:i<=v?color:“var(–border2)”,display:“inline-block”,cursor:“pointer”}}/>)}</div>;}
function PBadge({v,sm}){const p=pv(v);return <span className={`badge${sm?" badge-sm":""}`} style={{background:`${p.c}20`,border:`1.5px solid ${p.c}`,color:p.c}}>{sm?p.s:p.l}</span>;}
function Dot({prio}){const c=PC[prio]||”#888”;return <span style={{width:8,height:8,borderRadius:“50%”,background:c,display:“inline-block”,flexShrink:0}}/>;}
function DBadge({disc}){return disc?<span className=“badge” style={{background:`${disc.color}18`,border:`1.5px solid ${disc.color}`,color:disc.color}}>{disc.name}</span>:null;}
function FBadge({n,actual,target}){const over=target>0&&actual>target;const under=target>0&&actual<target;const cls=over?“badge badge-err”:under?“badge badge-warn”:“badge badge-neutral”;return <span className={cls}>{target>0?`${(actual||+n).toFixed(1)} / ${target} FTE`:`${n} FTE`}{over?” ↑”:under?” ↓”:””}</span>;}
function SideBadge(){return <span className="badge badge-accent2">◈ Side</span>;}
function StageBadge({v}){const s=sv(v||1);return <span className=“badge” style={{background:`${s.c}18`,border:`1.5px solid ${s.c}`,color:s.c}}>{s.v} · {s.l}</span>;}
function TkBadge({status}){const s=tv(status);return <span className=“badge” style={{background:`${s.c}18`,border:`1.5px solid ${s.c}`,color:s.c,gap:6}}><span style={{width:5,height:5,borderRadius:“50%”,background:s.c,flexShrink:0,display:“inline-block”}}/>{s.l}</span>;}
function EIcon(){return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;}
function TIcon(){return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;}
function CIcon({open}){return <svg width=“13” height=“13” viewBox=“0 0 24 24” fill=“none” stroke=“currentColor” strokeWidth=“2.5” style={{transform:open?“rotate(180deg)”:“none”,transition:“transform .2s”}}><polyline points="6 9 12 15 18 9"/></svg>;}
function SHead({title,sub,action}){return <div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:18,gap:12}}><div><h2 style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontSize:20,fontWeight:700,lineHeight:1.15,color:“var(–text1)”}}>{title}</h2>{sub&&<p style={{fontSize:13,color:“var(–text2)”,marginTop:4,lineHeight:1.4}}>{sub}</p>}</div>{action}</div>;}
function Empty({emoji,title,sub,onAct,aLabel}){return <div style={{textAlign:“center”,padding:“32px 20px”,background:“var(–surface-card)”,border:“1px dashed var(–border2)”,borderRadius:8}}><div style={{fontSize:28,marginBottom:10}}>{emoji}</div><div style={{fontWeight:600,fontSize:14,marginBottom:5,color:“var(–text1)”}}>{title}</div><div style={{fontSize:13,color:“var(–text3)”,marginBottom:onAct?16:0}}>{sub}</div>{onAct&&<button className="btn-p" onClick={onAct}>{aLabel}</button>}</div>;}

function Confirm({msg,onOk,onCancel}){
useEffect(()=>{const h=e=>{if(e.key===“Escape”)onCancel();};window.addEventListener(“keydown”,h);return()=>window.removeEventListener(“keydown”,h);},[onCancel]);
return <div onClick={e=>e.target===e.currentTarget&&onCancel()} style={{position:“fixed”,inset:0,background:“rgba(0,0,0,.75)”,display:“flex”,alignItems:“center”,justifyContent:“center”,zIndex:9000,padding:“0 20px”}}>
<div style={{background:“var(–surface-card)”,border:“1px solid rgba(255,68,68,.3)”,borderTop:“3px solid #ff4444”,borderRadius:10,padding:“28px 24px”,maxWidth:320,width:“100%”,textAlign:“center”}}>
<div style={{fontSize:28,marginBottom:12}}>⚠️</div>
<div style={{fontSize:14,color:“var(–text1)”,marginBottom:22,lineHeight:1.6}}>{msg}</div>
<div style={{display:“flex”,gap:10,justifyContent:“center”}}>
<button className=“btn-p” onClick={onOk} style={{background:”#ff4444”,color:“var(–text1)”}}>Delete</button>
<button className="btn-g" onClick={onCancel}>Cancel</button>
</div>
</div>

  </div>;
}

function ProfPicker({value,onChange}){
return <div style={{display:“flex”,gap:6,flexWrap:“wrap”}}>
{PROF.map(p=><button key={p.v} onClick={()=>onChange(p.v)} style={{padding:“5px 10px”,borderRadius:7,border:`1.5px solid ${value===p.v?p.c+"66":"var(--border2)"}`,background:value===p.v?`${p.c}18`:“var(–surface1)”,color:value===p.v?p.c:“var(–text2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,minHeight:36}}>{p.l}</button>)}

  </div>;
}

function SREditor({reqs,onChange,skills}){
const [adding,setAdding]=useState(false);
const [ns,setNs]=useState(skills[0]?.id||””);
const [np,setNp]=useState(3);
const add=()=>{if(!ns)return;onChange({…reqs,[ns]:np});setAdding(false);};
const rem=sid=>{const r={…reqs};delete r[sid];onChange(r);};
const upd=(sid,v)=>onChange({…reqs,[sid]:v});
return <div>
<div style={{display:“flex”,flexWrap:“wrap”,gap:6,marginBottom:8}}>
{Object.entries(reqs).map(([sid,prof])=>{const sk=skills.find(s=>s.id===sid);if(!sk)return null;return <div key={sid} style={{display:“flex”,alignItems:“center”,gap:6,background:`${sk.color}18`,border:`1.5px solid ${sk.color}`,borderRadius:8,padding:“5px 9px”}}><span className=“mono” style={{fontSize:11,color:sk.color,textTransform:“uppercase”}}>{sk.name}</span><div style={{display:“flex”,gap:3}}>{PROF.map(p=><span key={p.v} onClick={()=>upd(sid,p.v)} style={{width:10,height:10,borderRadius:2,cursor:“pointer”,background:p.v<=prof?sk.color:“var(–border2)”,display:“inline-block”}} title={p.l}/>)}</div><button onClick={()=>rem(sid)} style={{background:“transparent”,border:“none”,color:“var(–text3)”,fontSize:14,lineHeight:1,padding:“0 2px”}}>×</button></div>;})}
</div>
{adding
?<div style={{background:“var(–surface-card)”,border:“1px solid var(–border2)”,borderRadius:9,padding:12,display:“flex”,flexDirection:“column”,gap:9}}>
<div><Lbl>Skill</Lbl><select className=“inp” value={ns} onChange={e=>setNs(e.target.value)}>{skills.filter(s=>!reqs[s.id]).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
<div><Lbl>Min Proficiency</Lbl><ProfPicker value={np} onChange={setNp}/></div>
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={add}>Add</button><button className=“btn-g btn-sm” onClick={()=>setAdding(false)}>Cancel</button></div>
</div>
:<button onClick={()=>setAdding(true)} style={{border:“1px dashed var(–border2)”,borderRadius:6,padding:“7px 12px”,background:“var(–surface-card)”,color:“var(–text2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,letterSpacing:”.05em”,textTransform:“uppercase”,minHeight:34,width:“100%”}}>+ Add Requirement</button>
}

  </div>;
}

function SuperpowersEditor({powers,onChange,onPromote}){
const [adding,setAdding]=useState(false);
const [name,setName]=useState(””);
const [level,setLevel]=useState(3);
const [editId,setEditId]=useState(null);
const [editName,setEditName]=useState(””);
const [editLevel,setEditLevel]=useState(3);

const add=()=>{if(!name.trim())return;onChange([…powers,{id:uid(),name:name.trim(),level}]);setAdding(false);setName(””);setLevel(3);};
const rem=id=>onChange(powers.filter(p=>p.id!==id));
const startEdit=p=>{setEditId(p.id);setEditName(p.name);setEditLevel(p.level);setAdding(false);};
const saveEdit=()=>{onChange(powers.map(p=>p.id===editId?{…p,name:editName.trim()||p.name,level:editLevel}:p));setEditId(null);};

const PCOL=”#facc15”; // gold — distinct from skill purple/green

return <div>
<div style={{display:“grid”,gap:6,marginBottom:8}}>
{powers.map(p=>{
if(editId===p.id)return <div key={p.id} style={{background:“rgba(250,204,21,.04)”,border:“1px solid rgba(250,204,21,.25)”,borderRadius:9,padding:10,display:“flex”,flexDirection:“column”,gap:8}}>
<div><Lbl>Superpower Name</Lbl><input className=“inp” value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key===“Enter”&&saveEdit()}/></div>
<div><Lbl>Proficiency</Lbl><ProfPicker value={editLevel} onChange={setEditLevel}/></div>
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={saveEdit}>Save</button><button className=“btn-g btn-sm” onClick={()=>setEditId(null)}>Cancel</button></div>
</div>;
return <div key={p.id} style={{display:“flex”,alignItems:“center”,gap:8,background:“rgba(250,204,21,.04)”,border:“1px solid rgba(250,204,21,.1)”,borderRadius:8,padding:“8px 10px”}}>
<span style={{fontSize:12,flexShrink:0}}>⚡</span>
<span className=“mono” style={{fontSize:11,color:“var(–text1)”,flex:1,letterSpacing:”.03em”}}>{p.name}</span>
<div style={{display:“flex”,gap:3}}>
{PROF.map(pr=><span key={pr.v} onClick={()=>onChange(powers.map(x=>x.id===p.id?{…x,level:pr.v}:x))} style={{width:11,height:11,borderRadius:3,cursor:“pointer”,background:pr.v<=p.level?PCOL:“var(–border2)”,display:“inline-block”}} title={pr.l}/>)}
</div>
<PBadge v={p.level} sm/>
<button className=“ib ib-sm” onClick={()=>startEdit(p)} title=“Edit” style={{width:24,height:24,flexShrink:0}}><EIcon/></button>
<button onClick={()=>onPromote(p)} title=“Promote to Skill” style={{background:“transparent”,border:“none”,color:“rgba(250,204,21,.4)”,fontSize:13,lineHeight:1,cursor:“pointer”,flexShrink:0,padding:“0 2px”}} onMouseEnter={e=>e.target.style.color=”#facc15”} onMouseLeave={e=>e.target.style.color=“rgba(250,204,21,.4)”} title=“Promote to skill”>↑</button>
<button onClick={()=>rem(p.id)} style={{background:“transparent”,border:“none”,color:“var(–text4)”,fontSize:15,lineHeight:1,cursor:“pointer”,flexShrink:0}} onMouseEnter={e=>e.target.style.color=”#ff6666”} onMouseLeave={e=>e.target.style.color=“var(–text4)”}>×</button>
</div>;
})}
</div>
{adding
?<div style={{background:“rgba(250,204,21,.04)”,border:“1px solid rgba(250,204,21,.2)”,borderRadius:9,padding:12,display:“flex”,flexDirection:“column”,gap:9}}>
<div><Lbl>Superpower Name</Lbl><input className=“inp” value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key===“Enter”&&add()} placeholder=“e.g. Workshop Design, Storytelling…” autoFocus/></div>
<div><Lbl>Proficiency</Lbl><ProfPicker value={level} onChange={setLevel}/></div>
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={add}>Add</button><button className=“btn-g btn-sm” onClick={()=>{setAdding(false);setName(””);setLevel(3);}}>Cancel</button></div>
</div>
:<button onClick={()=>{setAdding(true);setEditId(null);}} style={{border:“1px dashed var(–border2)”,borderRadius:6,padding:“7px 12px”,background:“transparent”,color:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,letterSpacing:”.05em”,textTransform:“uppercase”,minHeight:34,width:“100%”}}>⚡ Add Superpower</button>
}

  </div>;
}

function MSkillEditor({sp,onChange,skills}){
const [adding,setAdding]=useState(false);
const [ns,setNs]=useState(skills[0]?.id||””);
const [np,setNp]=useState(3);
const [editSid,setEditSid]=useState(null); // sid being edited
const [editSkill,setEditSkill]=useState(””); // replacement skill id
const [editProf,setEditProf]=useState(3);

const add=()=>{if(!ns)return;onChange({…sp,[ns]:np});setAdding(false);setNs(skills.find(s=>!({…sp,[ns]:np})[s.id])?.id||””);setNp(3);};
const rem=sid=>{const r={…sp};delete r[sid];onChange(r);if(editSid===sid)setEditSid(null);};
const updProf=(sid,v)=>onChange({…sp,[sid]:v});

const startEdit=sid=>{setEditSid(sid);setEditSkill(sid);setEditProf(sp[sid]);setAdding(false);};
const saveEdit=()=>{
const r={…sp};
delete r[editSid];
r[editSkill]=editProf;
onChange(r);
setEditSid(null);
};
const cancelEdit=()=>setEditSid(null);

const entries=Object.entries(sp);
return <div>
<div style={{display:“grid”,gap:6,marginBottom:8}}>
{entries.map(([sid,prof])=>{
const sk=skills.find(s=>s.id===sid);
if(!sk)return null;
if(editSid===sid)return <div key={sid} style={{background:“rgba(0,229,160,.04)”,border:“1px solid rgba(0,229,160,.2)”,borderRadius:9,padding:10,display:“flex”,flexDirection:“column”,gap:8}}>
<div><Lbl>Skill</Lbl>
<select className=“inp” value={editSkill} onChange={e=>setEditSkill(e.target.value)}>
{/* Show current skill + any unassigned skills */}
{skills.filter(s=>s.id===sid||!sp[s.id]).map(s=><option key={s.id} value={s.id}>{s.name} ({s.cat})</option>)}
</select>
</div>
<div><Lbl>Proficiency</Lbl><ProfPicker value={editProf} onChange={setEditProf}/></div>
<div style={{display:“flex”,gap:7}}>
<button className="btn-p btn-sm" onClick={saveEdit}>Save</button>
<button className="btn-g btn-sm" onClick={cancelEdit}>Cancel</button>
</div>
</div>;
return <div key={sid} style={{display:“flex”,alignItems:“center”,gap:8,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:8,padding:“8px 10px”}}>
<span style={{width:7,height:7,borderRadius:2,background:sk.color,flexShrink:0,display:“inline-block”}}/>
<span className=“mono” style={{fontSize:11,color:“var(–text1)”,flex:1,textTransform:“uppercase”,letterSpacing:”.05em”}}>{sk.name}</span>
<div style={{display:“flex”,gap:3}}>
{PROF.map(p=><span key={p.v} onClick={()=>updProf(sid,p.v)} style={{width:11,height:11,borderRadius:3,cursor:“pointer”,background:p.v<=prof?sk.color:“var(–border2)”,display:“inline-block”}} title={p.l}/>)}
</div>
<PBadge v={prof} sm/>
<button className=“ib ib-sm” onClick={()=>startEdit(sid)} title=“Edit skill or level” style={{width:24,height:24,flexShrink:0}}><EIcon/></button>
<button onClick={()=>rem(sid)} style={{background:“transparent”,border:“none”,color:“var(–text3)”,fontSize:15,lineHeight:1,cursor:“pointer”,flexShrink:0}} onMouseEnter={e=>e.target.style.color=”#ff6666”} onMouseLeave={e=>e.target.style.color=“var(–text3)”}>×</button>
</div>;
})}
</div>
{adding
?<div style={{background:“var(–surface-card)”,border:“1px solid var(–border2)”,borderRadius:9,padding:12,display:“flex”,flexDirection:“column”,gap:9}}>
<div><Lbl>Skill</Lbl><select className=“inp” value={ns} onChange={e=>setNs(e.target.value)}>{skills.filter(s=>!sp[s.id]).map(s=><option key={s.id} value={s.id}>{s.name} ({s.cat})</option>)}</select></div>
<div><Lbl>Proficiency</Lbl><ProfPicker value={np} onChange={setNp}/></div>
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={add}>Add</button><button className=“btn-g btn-sm” onClick={()=>setAdding(false)}>Cancel</button></div>
</div>
:skills.filter(s=>!sp[s.id]).length>0
?<button onClick={()=>{setAdding(true);setEditSid(null);}} style={{border:“1px dashed var(–border2)”,borderRadius:6,padding:“7px 12px”,background:“var(–surface-card)”,color:“var(–text2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,letterSpacing:”.05em”,textTransform:“uppercase”,minHeight:34,width:“100%”}}>+ Add Skill</button>
:<div className=“mono” style={{fontSize:11,color:“var(–text3)”,textAlign:“center”,padding:“6px 0”}}>All skills assigned</div>
}

  </div>;
}

function RosterEditor({project,team,upsPr,getMember}){
const roster=project.roster||[];
const [adding,setAdding]=useState(false);
const [ne,setNe]=useState({id:uid(),mId:team[0]?.id||””,alloc:50,role:””,start:””,end:””});
const addE=()=>{upsPr({…project,roster:[…roster,{…ne,id:uid()}]});setAdding(false);setNe({id:uid(),mId:team[0]?.id||””,alloc:50,role:””,start:””,end:””});};
const remE=eid=>upsPr({…project,roster:roster.filter(r=>r.id!==eid)});
const updE=(eid,f,v)=>upsPr({…project,roster:roster.map(r=>r.id===eid?{…r,[f]:v}:r)});
return <div className="roster-panel">
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:8}}>
<span className=“mono” style={{fontSize:10,color:“var(–accent)”,textTransform:“uppercase”,letterSpacing:”.08em”}}>Roster ({roster.length} · {pFTE(project).toFixed(1)} FTE)</span>
<button onClick={()=>setAdding(true)} style={{border:“1px solid rgba(0,229,160,.25)”,borderRadius:7,padding:“3px 9px”,background:“transparent”,color:“rgba(0,229,160,.7)”,fontSize:10,fontFamily:”‘DM Mono’,monospace”,textTransform:“uppercase”,minHeight:26}}>+ Assign</button>
</div>
{roster.length===0&&!adding&&<div className=“mono” style={{textAlign:“center”,padding:7,color:“var(–text4)”,fontSize:11}}>No one assigned</div>}
<div style={{display:“grid”,gap:5}}>
{roster.map(r=>{const mb=getMember(r.mId);if(!mb)return null;const otherLoad=mb.load-((roster.find(x=>x.id===r.id)?.alloc)||0);const projTotal=otherLoad+r.alloc;const over=projTotal>mb.cap;return <div key={r.id} style={{display:“flex”,gap:6,alignItems:“center”,background:“var(–surface-card)”,border:`1px solid ${over?"rgba(255,68,68,.25)":"var(--border1)"}`,borderRadius:7,padding:“6px 8px”,flexWrap:“wrap”}}>
<div className="avatar" style={{width:22,height:22,borderRadius:5,fontSize:10,flexShrink:0}}>{mb.avatar}</div>
<div style={{flex:1,minWidth:90}}><div style={{fontSize:12,fontWeight:500,color:over?“var(–c-danger)”:“var(–text1)”}}>{mb.name}{over&&<span style={{fontSize:10,marginLeft:5,color:”#ff6666”}}>⚠ over</span>}</div><input value={r.role} onChange={e=>updE(r.id,“role”,e.target.value)} placeholder=“Role” style={{background:“transparent”,border:“none”,borderBottom:“1px solid var(–border2)”,color:“var(–text2)”,fontSize:11,outline:“none”,width:“100%”,padding:“1px 0”,fontFamily:”‘DM Mono’,monospace”}}/></div>
<div style={{display:“flex”,alignItems:“center”,gap:2}}><input type=“number” inputMode=“numeric” min=“1” max=“100” value={r.alloc} onChange={e=>updE(r.id,“alloc”,+e.target.value)} style={{background:over?“rgba(255,68,68,.1)”:“var(–surfaceRaise)”,border:`1px solid ${over?"rgba(255,68,68,.4)":"var(--border2)"}`,borderRadius:5,padding:“2px 5px”,color:over?“var(–c-danger)”:“var(–text1)”,fontSize:12,outline:“none”,width:42,textAlign:“center”,fontFamily:”‘DM Mono’,monospace”}}/><span className=“mono” style={{fontSize:10,color:“var(–text3)”}}>%</span></div>
{(()=>{const inv=r.start&&r.end&&r.end<r.start;return <>      <input type=“date” value={r.start} onChange={e=>updE(r.id,“start”,e.target.value)} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:5,padding:“2px 5px”,color:“var(–text1)”,fontSize:11,outline:“none”,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/>
<span style={{fontSize:10,color:“var(–text3)”}}>→</span>
<input type=“date” value={r.end} onChange={e=>updE(r.id,“end”,e.target.value)} style={{background:inv?“rgba(255,68,68,.1)”:“var(–surfaceRaise)”,border:`1px solid ${inv?"rgba(255,68,68,.5)":"var(--border2)"}`,borderRadius:5,padding:“2px 5px”,color:inv?”#ff9999”:“var(–text1)”,fontSize:11,outline:“none”,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/>{inv&&<span style={{fontSize:10,color:”#ff6666”,fontFamily:”‘DM Mono’,monospace”}}>!</span>}</>;})()}
<button className=“ib ib-d ib-sm” onClick={()=>remE(r.id)}><TIcon/></button>
</div>;})}
{adding&&<div style={{background:“rgba(0,229,160,.04)”,border:“1px solid rgba(0,229,160,.18)”,borderRadius:8,padding:10,display:“flex”,flexDirection:“column”,gap:8}}>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:9}}><div><Lbl>Member</Lbl><select className=“inp” value={ne.mId} onChange={e=>setNe(p=>({…p,mId:e.target.value}))}>{team.map(m=><option key={m.id} value={m.id}>{m.name} ({m.cap-m.load}% free)</option>)}</select></div><div><Lbl>Role</Lbl><input className=“inp” value={ne.role} onChange={e=>setNe(p=>({…p,role:e.target.value}))} placeholder=“Lead Designer”/></div></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr 1fr”,gap:9}}><div><Lbl>Alloc %</Lbl><input className=“inp” type=“number” inputMode=“numeric” min=“1” max=“100” value={ne.alloc} onChange={e=>setNe(p=>({…p,alloc:+e.target.value}))}/></div><div><Lbl>Start</Lbl><input className=“inp” type=“date” value={ne.start} onChange={e=>setNe(p=>({…p,start:e.target.value}))} style={{colorScheme:“dark”}}/></div><div><Lbl>End</Lbl><input className=“inp” type=“date” value={ne.end} onChange={e=>setNe(p=>({…p,end:e.target.value}))} style={{colorScheme:“dark”}}/></div></div>
{(()=>{const mb=team.find(m=>m.id===ne.mId);if(!mb)return null;const proj=mb.load+ne.alloc;const over=proj>mb.cap;return <div style={{padding:“6px 9px”,borderRadius:7,background:over?“rgba(255,68,68,.08)”:“rgba(255,255,255,.03)”,border:`1px solid ${over?"rgba(255,68,68,.25)":"var(--border1)"}`,fontSize:11,fontFamily:”‘DM Mono’,monospace”,color:over?”#ff6666”:“var(–text2)”}}>{mb.name}: {mb.load}% current + {ne.alloc}% = <strong style={{color:over?“var(–c-danger)”:“var(–c-success)”}}>{proj}%</strong> of {mb.cap}% cap{over?` ⚠ ${proj-mb.cap}% over`:””}</div>;})()}
{ne.start&&ne.end&&ne.end<ne.start&&<div style={{fontSize:11,color:”#ff6666”,fontFamily:”‘DM Mono’,monospace”,padding:“4px 8px”,background:“rgba(255,68,68,.08)”,borderRadius:6,border:“1px solid rgba(255,68,68,.2)”}}>⚠ End date is before start date</div>}
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={addE}>Assign</button><button className=“btn-g btn-sm” onClick={()=>setAdding(false)}>Cancel</button></div>
</div>}
</div>

  </div>;
}

function TracksEditor({project,team,upsPr}){
const tracks=project.tracks||[];
const [adding,setAdding]=useState(false);
const [nt,setNt]=useState({id:uid(),name:””,status:“planned”,ownId:””,start:””,end:””,desc:””,fte:0});
const addT=()=>{if(!nt.name.trim())return;upsPr({…project,tracks:[…tracks,{…nt,id:uid()}]});setAdding(false);setNt({id:uid(),name:””,status:“planned”,ownId:””,start:””,end:””,desc:””,fte:0});};
const remT=tid=>upsPr({…project,tracks:tracks.filter(t=>t.id!==tid)});
const updT=(tid,f,v)=>upsPr({…project,tracks:tracks.map(t=>t.id===tid?{…t,[f]:v}:t)});
return <div className="track-panel">
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:8}}>
{(()=>{const tFTE=tracks.reduce((s,t)=>s+(t.fte||0),0);const pTarget=project.fte||0;const over=pTarget>0&&tFTE>pTarget;const under=pTarget>0&&tFTE<pTarget;return <span className=“mono” style={{fontSize:10,color:“var(–accent2)”,textTransform:“uppercase”,letterSpacing:”.08em”}}>Tracks ({tracks.length}){tFTE>0&&<span style={{marginLeft:6,color:over?”#ff6666”:under?”#fb923c”:“var(–accent2)”}}>· {tFTE}%{pTarget>0?` / ${pTarget*100}% FTE`:””}{over?” ↑”:under?” ↓”:””}</span>}</span>;})()}
<button onClick={()=>setAdding(true)} style={{border:“1px solid rgba(56,189,248,.25)”,borderRadius:7,padding:“3px 9px”,background:“transparent”,color:“rgba(56,189,248,.7)”,fontSize:10,fontFamily:”‘DM Mono’,monospace”,textTransform:“uppercase”,minHeight:26}}>+ Track</button>
</div>
{tracks.length===0&&!adding&&<div className=“mono” style={{textAlign:“center”,padding:7,color:“var(–text4)”,fontSize:11}}>No tracks yet</div>}
<div style={{display:“grid”,gap:6}}>
{tracks.map(t=>{const st=tv(t.status);return <div key={t.id} style={{background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:8,padding:“8px 10px”}}>
<div style={{display:“flex”,alignItems:“flex-start”,gap:7}}>
<span style={{width:4,height:4,borderRadius:“50%”,background:st.c,marginTop:5,flexShrink:0,display:“inline-block”}}/>
<div style={{flex:1,minWidth:0}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,gap:7,flexWrap:“wrap”}}>
<input value={t.name} onChange={e=>updT(t.id,“name”,e.target.value)} style={{background:“transparent”,border:“none”,color:“var(–text1)”,fontSize:13,fontWeight:600,outline:“none”,flex:1,minWidth:70,fontFamily:”‘DM Sans’,sans-serif”}}/>
<div style={{display:“flex”,gap:5,alignItems:“center”,flexShrink:0}}>
<select value={t.status} onChange={e=>updT(t.id,“status”,e.target.value)} style={{background:“var(–surface-card)”,border:`1px solid ${st.c}50`,borderRadius:6,padding:“4px 9px”,color:st.c,fontSize:10,fontFamily:”‘DM Mono’,monospace”,outline:“none”,minHeight:26,fontWeight:600}}>{TRKST.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select>
<button className=“ib ib-d ib-sm” onClick={()=>remT(t.id)}><TIcon/></button>
</div>
</div>
<input value={t.desc} onChange={e=>updT(t.id,“desc”,e.target.value)} placeholder=“Description…” style={{background:“transparent”,border:“none”,borderBottom:“1px solid var(–border1)”,color:“var(–text2)”,fontSize:12,outline:“none”,width:“100%”,padding:“3px 0”,marginTop:4,fontFamily:”‘DM Sans’,sans-serif”}}/>
<div style={{display:“flex”,gap:10,marginTop:6,alignItems:“center”,flexWrap:“wrap”}}>
<div style={{display:“flex”,alignItems:“center”,gap:2}}><input type=“number” inputMode=“numeric” min=“0” max=“100” value={t.fte||””} onChange={e=>updT(t.id,“fte”,+e.target.value)} placeholder=“FTE%” style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:6,padding:“4px 7px”,color:“var(–text1)”,fontSize:11,outline:“none”,width:50,fontFamily:”‘DM Mono’,monospace”,minHeight:28}}/><span className=“mono” style={{fontSize:10,color:“var(–text3)”}}>%</span></div><select value={t.ownId||””} onChange={e=>updT(t.id,“ownId”,e.target.value)} style={{background:“var(–surface-card)”,border:“1px solid var(–border2)”,borderRadius:6,padding:“4px 9px”,color:“var(–text1)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,outline:“none”,minHeight:28}}><option value="">No owner</option>{team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
<input type=“date” value={t.start||””} onChange={e=>updT(t.id,“start”,e.target.value)} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:5,padding:“2px 6px”,color:“var(–text2)”,fontSize:11,outline:“none”,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/>
<span style={{fontSize:10,color:“var(–text3)”}}>→</span>
<input type=“date” value={t.end||””} onChange={e=>updT(t.id,“end”,e.target.value)} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:5,padding:“2px 6px”,color:“var(–text2)”,fontSize:11,outline:“none”,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/>
</div>
</div>
</div>
</div>;})}
{adding&&<div style={{background:“rgba(56,189,248,.04)”,border:“1px solid rgba(56,189,248,.2)”,borderRadius:8,padding:10,display:“flex”,flexDirection:“column”,gap:8}}>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:9}}><div><Lbl>Track Name</Lbl><input className=“inp” value={nt.name} onChange={e=>setNt(p=>({…p,name:e.target.value}))} onKeyDown={e=>e.key===“Enter”&&addT()} placeholder=“e.g. Discovery”/></div><div><Lbl>Status</Lbl><select className=“inp” value={nt.status} onChange={e=>setNt(p=>({…p,status:e.target.value}))}>{TRKST.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select></div></div>
<div><Lbl>Description</Lbl><input className=“inp” value={nt.desc} onChange={e=>setNt(p=>({…p,desc:e.target.value}))} placeholder=“What does this track cover?”/></div>
<div style={{display:“grid”,gridTemplateColumns:“80px 1fr 1fr 1fr”,gap:9}}><div><Lbl>FTE %</Lbl><input className=“inp” type=“number” inputMode=“numeric” min=“0” max=“100” value={nt.fte||””} onChange={e=>setNt(p=>({…p,fte:+e.target.value}))} placeholder=“0”/></div><div><Lbl>Owner</Lbl><select className=“inp” value={nt.ownId} onChange={e=>setNt(p=>({…p,ownId:e.target.value}))}><option value="">No owner</option>{team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div><div><Lbl>Start</Lbl><input className=“inp” type=“date” value={nt.start} onChange={e=>setNt(p=>({…p,start:e.target.value}))} style={{colorScheme:“dark”}}/></div><div><Lbl>End</Lbl><input className=“inp” type=“date” value={nt.end} onChange={e=>setNt(p=>({…p,end:e.target.value}))} style={{colorScheme:“dark”}}/></div></div>
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={addT}>Add Track</button><button className=“btn-g btn-sm” onClick={()=>setAdding(false)}>Cancel</button></div>
</div>}
</div>

  </div>;
}

function FormTracksEditor({tracks,onChange}){
const [adding,setAdding]=useState(false);
const [nt,setNt]=useState({name:””,status:“planned”,desc:””,fte:0});
const blank={name:””,status:“planned”,desc:””,fte:0};

const addT=()=>{
if(!nt.name.trim())return;
onChange([…tracks,{…nt,id:uid(),ownId:””,start:””,end:””,fte:nt.fte||0}]);
setAdding(false);setNt({…blank});
};
const remT=id=>onChange(tracks.filter(t=>t.id!==id));
const updT=(id,f,v)=>onChange(tracks.map(t=>t.id===id?{…t,[f]:v}:t));

return <div style={{display:“grid”,gap:6}}>
{tracks.map(t=>{
const st=tv(t.status);
return <div key={t.id} style={{display:“flex”,gap:8,alignItems:“flex-start”,background:“rgba(56,189,248,.03)”,border:`1px solid ${st.c}28`,borderRadius:9,padding:“9px 11px”}}>
<span style={{width:6,height:6,borderRadius:“50%”,background:st.c,marginTop:5,flexShrink:0,display:“inline-block”}}/>
<div style={{flex:1,minWidth:0,display:“grid”,gap:6}}>
<div style={{display:“grid”,gridTemplateColumns:“1fr auto”,gap:8,alignItems:“center”}}>
<input value={t.name} onChange={e=>updT(t.id,“name”,e.target.value)} style={{background:“transparent”,border:“none”,borderBottom:“1px solid var(–border2)”,color:“var(–text1)”,fontSize:13,fontWeight:600,outline:“none”,fontFamily:”‘DM Sans’,sans-serif”,padding:“2px 0”}} placeholder=“Track name”/>
<select value={t.status} onChange={e=>updT(t.id,“status”,e.target.value)} style={{background:“var(–surface-card)”,border:`1px solid ${st.c}50`,borderRadius:6,padding:“4px 9px”,color:st.c,fontSize:10,fontFamily:”‘DM Mono’,monospace”,outline:“none”,minHeight:26,fontWeight:600}}>
{TRKST.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}
</select>
</div>
<input value={t.desc} onChange={e=>updT(t.id,“desc”,e.target.value)} placeholder=“Description…” style={{background:“transparent”,border:“none”,borderBottom:“1px solid var(–border1)”,color:“var(–text2)”,fontSize:12,outline:“none”,fontFamily:”‘DM Sans’,sans-serif”,padding:“2px 0”}}/>
</div>
<button onClick={()=>remT(t.id)} className=“ib ib-d ib-sm” style={{marginTop:1,flexShrink:0}}><TIcon/></button>
</div>;
})}
{adding
?<div style={{background:“rgba(56,189,248,.04)”,border:“1px solid rgba(56,189,248,.2)”,borderRadius:9,padding:10,display:“grid”,gap:8}}>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:8}}>
<div><Lbl>Track Name</Lbl><input className=“inp” value={nt.name} onChange={e=>setNt(p=>({…p,name:e.target.value}))} onKeyDown={e=>e.key===“Enter”&&addT()} placeholder=“e.g. Discovery” autoFocus/></div>
<div><Lbl>Status</Lbl><select className=“inp” value={nt.status} onChange={e=>setNt(p=>({…p,status:e.target.value}))}>{TRKST.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select></div>
</div>
<div style={{display:“grid”,gridTemplateColumns:“80px 1fr”,gap:8}}><div><Lbl>FTE %</Lbl><input className=“inp” type=“number” inputMode=“numeric” min=“0” max=“100” value={nt.fte||””} onChange={e=>setNt(p=>({…p,fte:+e.target.value}))} placeholder=“0”/></div><div><Lbl>Description</Lbl><input className=“inp” value={nt.desc} onChange={e=>setNt(p=>({…p,desc:e.target.value}))} placeholder=“What does this track cover?”/></div></div>
<div style={{display:“flex”,gap:7}}><button className="btn-p btn-sm" onClick={addT}>Add</button><button className=“btn-g btn-sm” onClick={()=>{setAdding(false);setNt({…blank});}}>Cancel</button></div>
</div>
:<button onClick={()=>setAdding(true)} style={{border:“1px dashed rgba(var(–accent2-rgb),.3)”,borderRadius:8,padding:“7px 12px”,background:“transparent”,color:“var(–accent2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,letterSpacing:”.05em”,textTransform:“uppercase”,minHeight:34,width:“100%”}}>+ Add Track</button>
}

  </div>;
}

function doPrint(html){const w=window.open(””,”_blank”,“width=900,height=700”);if(!w){alert(“Allow popups to print.”);return;}w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>FLUX</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:system-ui,sans-serif;color:#111;padding:32px;max-width:880px;margin:0 auto;}h1{font-size:24px;font-weight:800;margin-bottom:4px;}h2{font-size:16px;font-weight:700;margin:20px 0 10px;}.sub{color:#666;font-size:13px;margin-bottom:20px;}.kg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}.kc{border:1px solid #e5e7eb;border-radius:8px;padding:14px;}.kv{font-size:22px;font-weight:700;font-family:monospace;}.kl{font-size:10px;color:#888;text-transform:uppercase;margin-top:3px;}.ks{font-size:12px;color:#059669;margin-top:3px;}.br{margin-bottom:9px;}.bt{display:flex;justify-content:space-between;margin-bottom:4px;font-size:13px;}.bk{background:#f3f4f6;border-radius:99px;height:7px;overflow:hidden;}.bf{height:100%;border-radius:99px;}.sec{break-inside:avoid;margin-bottom:20px;}table{width:100%;border-collapse:collapse;font-size:13px;}th{text-align:left;padding:6px 10px;font-size:10px;text-transform:uppercase;color:#888;border-bottom:1px solid #e5e7eb;}td{padding:8px 10px;border-bottom:1px solid #f3f4f6;}.bdg{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-family:monospace;text-transform:uppercase;font-weight:600;}@media print{@page{margin:1.5cm;}}</style></head><body>${html}<script>window.onload=()=>window.print();<\/script></body></html>`);w.document.close();}

// ═════════════════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

function ChatTab({twl,scs,projs,skills,gaps,gSk,gDi,goTab,setChatOpen}){
const [selected,setSelected]=useState(null);
const asc=scs.find(s=>s.active);
const ap=asc?projs.filter(p=>p.scId===asc.id&&p.type!==“side”):[];

// ── Deterministic query handlers ─────────────────────────────────
const queries={
overalloc:()=>{
const over=twl.filter(m=>m.load>m.cap).map(m=>({
name:m.name,role:m.role,load:m.load,cap:m.cap,delta:m.load-m.cap,
projects:ap.filter(p=>(p.roster||[]).find(r=>r.mId===m.id)).map(p=>({name:p.name,alloc:(p.roster||[]).find(r=>r.mId===m.id)?.alloc||0})),
}));
const near=twl.filter(m=>m.load<=m.cap&&m.load>=m.cap*.85).map(m=>({
name:m.name,role:m.role,load:m.load,cap:m.cap,
}));
return {
title:“Allocation Status”,
summary:over.length?`${over.length} person${over.length!==1?"s":""} over capacity`:“Everyone is within capacity”,
sentiment:over.length?“danger”:near.length?“warning”:“success”,
sections:[
over.length&&{heading:“Over capacity”,items:over,kind:“over”},
near.length&&{heading:“Near capacity (≥85%)”,items:near,kind:“near”},
].filter(Boolean),
goto:“team”,
};
},
coverage:()=>{
const rows=ap.map(p=>{
const actual=pFTE(p);const target=p.fte||0;
const cov=target>0?actual/target*100:null;
return {name:p.name,prio:p.prio,actual:actual.toFixed(1),target,cov:cov!==null?Math.round(cov):null};
});
const totalA=rows.reduce((a,r)=>a+parseFloat(r.actual),0);
const totalT=rows.reduce((a,r)=>a+r.target,0);
const gap=totalT-totalA;
return {
title:“FTE Coverage”,
summary:totalT>0?`${totalA.toFixed(1)} of ${totalT.toFixed(1)} FTE allocated (${Math.round(totalA/totalT*100)}%)${gap>0?` — ${gap.toFixed(1)} FTE short`:""}`:“No targets set”,
sentiment:totalT===0?“info”:totalA/totalT>=.9?“success”:totalA/totalT>=.7?“warning”:“danger”,
sections:[{heading:`Projects in ${asc?.name||"active scenario"}`,items:rows,kind:“coverage”}],
goto:“plan”,
};
},
blocked:()=>{
const rows=[];
ap.forEach(p=>{
(p.tracks||[]).filter(t=>t.status===“blocked”).forEach(t=>{
const owner=t.ownId?twl.find(m=>m.id===t.ownId):null;
rows.push({project:p.name,track:t.name,owner:owner?.name||“Unassigned”,prio:p.prio});
});
});
return {
title:“Blocked Tracks”,
summary:rows.length?`${rows.length} track${rows.length!==1?"s":""} blocked across ${new Set(rows.map(r=>r.project)).size} project${new Set(rows.map(r=>r.project)).size!==1?"s":""}`:“No blocked tracks”,
sentiment:rows.length?“danger”:“success”,
sections:rows.length?[{heading:“Needs attention”,items:rows,kind:“blocked”}]:[],
goto:“plan”,
};
},
gaps:()=>{
const bySkill={};
gaps.forEach(g=>{const k=g.sName;if(!bySkill[k])bySkill[k]=[];bySkill[k].push(g);});
const skillRows=Object.entries(bySkill).map(([name,list])=>({
skill:name,count:list.length,people:[…new Set(list.map(g=>g.mName))].length,
highest:Math.max(…list.map(g=>g.delta)),
})).sort((a,b)=>b.count-a.count);
const byPerson={};
gaps.forEach(g=>{if(!byPerson[g.mName])byPerson[g.mName]=[];byPerson[g.mName].push(g);});
const personRows=Object.entries(byPerson).map(([name,list])=>({
name,count:list.length,critical:list.filter(g=>g.prio===“Critical”||g.prio===“High”).length,
})).sort((a,b)=>b.critical-a.critical||b.count-a.count);
return {
title:“Skill Gaps”,
summary:gaps.length?`${gaps.length} gap${gaps.length!==1?"s":""} across ${personRows.length} member${personRows.length!==1?"s":""} and ${skillRows.length} skill${skillRows.length!==1?"s":""}`:“No skill gaps”,
sentiment:gaps.length?“warning”:“success”,
sections:gaps.length?[
{heading:“Top skills needed”,items:skillRows.slice(0,6),kind:“gapSkill”},
{heading:“People needing training”,items:personRows.slice(0,6),kind:“gapPerson”},
]:[],
goto:“analyze”,
};
},
suggest:()=>{
// For each high priority understaffed project, find best match
const understaffed=ap.filter(p=>(p.prio===“Critical”||p.prio===“High”)&&p.fte&&pFTE(p)<p.fte)
.sort((a,b)=>(a.prio===“Critical”?0:1)-(b.prio===“Critical”?0:1));
const suggestions=understaffed.slice(0,3).map(p=>{
// Score each member by skill match + available capacity
const available=twl.filter(m=>m.cap-m.load>=10);
const scored=available.map(m=>{
const skillMatch=Object.entries(p.sr||{}).reduce((s,[sid,req])=>{
const has=m.sp?.[sid]||0;return s+Math.min(has,req)*10;
},0);
const free=m.cap-m.load;
return {member:m,skillMatch,free,score:skillMatch+free};
}).sort((a,b)=>b.score-a.score).slice(0,3);
return {
project:p.name,prio:p.prio,gap:(p.fte-pFTE(p)).toFixed(1),
candidates:scored.map(s=>({name:s.member.name,role:s.member.role,free:s.free,match:s.skillMatch})),
};
});
return {
title:“Assignment Suggestions”,
summary:understaffed.length?`${understaffed.length} high-priority project${understaffed.length!==1?"s":""} understaffed`:“All high-priority projects fully staffed”,
sentiment:understaffed.length?“warning”:“success”,
sections:suggestions.length?[{heading:“Best-fit candidates”,items:suggestions,kind:“suggest”}]:[],
goto:“plan”,
};
},
summary:()=>{
const totalFTE=ap.reduce((a,p)=>a+pFTE(p),0);
const targetFTE=ap.reduce((a,p)=>a+(p.fte||0),0);
const over=twl.filter(m=>m.load>m.cap).length;
const blocked=ap.flatMap(p=>(p.tracks||[]).filter(t=>t.status===“blocked”)).length;
const critical=ap.filter(p=>p.prio===“Critical”).length;
const rows=[
{label:“Active scenario”,value:asc?.name||“None set”,kind:“text”},
{label:“Team”,value:`${twl.length} members`,sub:`${twl.filter(m=>m.cap-m.load>0).length} with capacity`,kind:“stat”},
{label:“Projects”,value:`${ap.length}`,sub:`${critical} critical`,kind:“stat”},
{label:“FTE coverage”,value:targetFTE>0?`${totalFTE.toFixed(1)} / ${targetFTE.toFixed(1)}`:`${totalFTE.toFixed(1)}`,sub:targetFTE>0?`${Math.round(totalFTE/targetFTE*100)}%`:“no target”,kind:“stat”},
{label:“Over capacity”,value:over,sub:over?“needs attention”:“all clear”,kind:“stat”,warn:over>0},
{label:“Blocked tracks”,value:blocked,sub:blocked?“blocking progress”:“none”,kind:“stat”,warn:blocked>0},
{label:“Skill gaps”,value:gaps.length,sub:gaps.length?“training opportunities”:“none”,kind:“stat”,warn:gaps.length>0},
];
return {
title:“Executive Summary”,
summary:`${asc?.name||"No active scenario"} — ${ap.length} projects, ${twl.length} team members`,
sentiment:over>0||blocked>0?“warning”:“info”,
sections:[{heading:“Key metrics”,items:rows,kind:“summary”}],
goto:“analyze”,
};
},
};

const prompts=[
{id:“overalloc”,icon:“⚠”,label:“Who’s overallocated?”},
{id:“coverage”,icon:“📊”,label:“FTE coverage”},
{id:“blocked”,icon:“🚧”,label:“Blocked tracks”},
{id:“gaps”,icon:“📈”,label:“Skill gaps”},
{id:“suggest”,icon:“💡”,label:“Assignment suggestions”},
{id:“summary”,icon:“📋”,label:“Summary for my manager”},
];

const result=selected?queries[selected]():null;
const sentimentCol={danger:“var(–c-danger)”,warning:“var(–c-warning)”,success:“var(–c-success)”,info:“var(–c-info)”}[result?.sentiment]||“var(–text2)”;

const goToTab=tab=>{setChatOpen&&setChatOpen(false);goTab(tab);};

return <div style={{display:“flex”,flexDirection:“column”,height:“calc(100dvh - 140px)”,minHeight:420}}>
{/* Quick stats header */}
<div style={{display:“grid”,gridTemplateColumns:“repeat(4,1fr)”,gap:6,marginBottom:14}}>
{[
{l:“Team”,v:twl.length},
{l:“Projects”,v:ap.length},
{l:“FTE”,v:ap.reduce((a,p)=>a+pFTE(p),0).toFixed(1)},
{l:“Gaps”,v:gaps.length,warn:gaps.length>0},
].map(s=><div key={s.l} style={{background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:6,padding:“8px 10px”,textAlign:“center”}}>
<div className=“mono” style={{fontSize:16,fontWeight:600,color:s.warn?“var(–c-warning)”:“var(–text1)”,lineHeight:1.1}}>{s.v}</div>
<div className=“mono” style={{fontSize:9,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”,marginTop:2}}>{s.l}</div>
</div>)}
</div>

```
{/* Prompt chips */}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
  {prompts.map(p=><button
    key={p.id}
    onClick={()=>setSelected(p.id)}
    style={{
      display:"flex",alignItems:"center",gap:8,
      padding:"10px 12px",
      borderRadius:6,
      border:`1px solid ${selected===p.id?"var(--accent)":"var(--border2)"}`,
      background:selected===p.id?"rgba(var(--accent-rgb),.08)":"var(--surface-card)",
      color:selected===p.id?"var(--accent)":"var(--text1)",
      fontSize:12,fontWeight:500,textAlign:"left",cursor:"pointer",
      transition:"all .12s",
    }}
  >
    <span style={{fontSize:15,flexShrink:0}}>{p.icon}</span>
    <span>{p.label}</span>
  </button>)}
</div>

{/* Result panel */}
<div style={{flex:1,overflowY:"auto",paddingRight:2}}>
  {!result&&<div style={{padding:"40px 20px",textAlign:"center",color:"var(--text3)"}}>
    <div style={{fontSize:36,marginBottom:12,opacity:.4}}>💬</div>
    <div style={{fontSize:13,fontWeight:500,color:"var(--text2)",marginBottom:4}}>Tap a question above</div>
    <div style={{fontSize:11}}>Get instant answers from your plan data</div>
  </div>}

  {result&&<div className="fu">
    {/* Result header */}
    <div style={{paddingBottom:12,marginBottom:14,borderBottom:"1px solid var(--border1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:sentimentCol}}/>
        <span style={{fontSize:11,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",fontFamily:"'DM Mono',monospace"}}>{result.title}</span>
      </div>
      <div style={{fontSize:14,fontWeight:600,color:sentimentCol,lineHeight:1.4}}>{result.summary}</div>
    </div>

    {/* Sections */}
    {result.sections.map((sec,si)=><div key={si} style={{marginBottom:18}}>
      <div className="mono" style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>{sec.heading}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {sec.items.map((item,i)=>{
          if(sec.kind==="over"||sec.kind==="near"){
            const over=sec.kind==="over";
            return <div key={i} style={{background:"var(--surface-card)",border:`1px solid ${over?"var(--c-danger)":"var(--c-warning)"}`,borderRadius:6,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13}}>{item.name}</span>
                <span className="mono" style={{fontSize:11,color:over?"var(--c-danger)":"var(--c-warning)",fontWeight:600}}>{item.load}% / {item.cap}%{over?` (+${item.delta}%)`:""}</span>
              </div>
              <div style={{fontSize:11,color:"var(--text3)"}}>{item.role}</div>
              {item.projects&&item.projects.length>0&&<div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                {item.projects.map((p,j)=><span key={j} className="badge badge-sm badge-neutral">{p.name} {p.alloc}%</span>)}
              </div>}
            </div>;
          }
          if(sec.kind==="coverage"){
            const cov=item.cov;
            const col=cov===null?"var(--text3)":cov>=90?"var(--c-success)":cov>=70?"var(--c-warning)":"var(--c-danger)";
            return <div key={i} style={{background:"var(--surface-card)",border:"1px solid var(--border1)",borderRadius:6,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13}}>{item.name}</span>
                <span className="mono" style={{fontSize:11,color:col,fontWeight:600}}>{cov!==null?`${cov}%`:"no target"}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"var(--text3)"}}>
                <span className="badge badge-sm" style={{background:`rgba(var(--c-${item.prio==="Critical"?"danger":item.prio==="High"?"warning":item.prio==="Medium"?"success":"info"}-rgb,128,128,128),.1)`,border:`1px solid var(--c-${item.prio==="Critical"?"danger":item.prio==="High"?"warning":item.prio==="Medium"?"success":"info"})`,color:`var(--c-${item.prio==="Critical"?"danger":item.prio==="High"?"warning":item.prio==="Medium"?"success":"info"})`}}>{item.prio}</span>
                <span className="mono">{item.actual} / {item.target||"—"} FTE</span>
              </div>
            </div>;
          }
          if(sec.kind==="blocked"){
            return <div key={i} style={{background:"var(--surface-card)",border:"1px solid var(--c-danger)",borderRadius:6,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13}}>{item.track}</span>
                <span className="mono" style={{fontSize:10,color:"var(--c-danger)"}}>BLOCKED</span>
              </div>
              <div style={{fontSize:11,color:"var(--text3)"}}>{item.project} · Owner: {item.owner}</div>
            </div>;
          }
          if(sec.kind==="gapSkill"){
            return <div key={i} style={{background:"var(--surface-card)",border:"1px solid var(--border1)",borderRadius:6,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{item.skill}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{item.people} {item.people===1?"person":"people"} · max gap +{item.highest}</div>
              </div>
              <span className="mono" style={{fontSize:12,fontWeight:600,color:"var(--c-warning)"}}>{item.count}</span>
            </div>;
          }
          if(sec.kind==="gapPerson"){
            return <div key={i} style={{background:"var(--surface-card)",border:"1px solid var(--border1)",borderRadius:6,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{item.count} gap{item.count!==1?"s":""}{item.critical>0?` · ${item.critical} critical`:""}</div>
              </div>
              <span className="mono" style={{fontSize:12,fontWeight:600,color:item.critical>0?"var(--c-danger)":"var(--c-warning)"}}>{item.critical||item.count}</span>
            </div>;
          }
          if(sec.kind==="suggest"){
            return <div key={i} style={{background:"var(--surface-card)",border:"1px solid var(--border1)",borderRadius:6,padding:"12px",marginBottom:4}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
                <span style={{fontWeight:600,fontSize:13}}>{item.project}</span>
                <span className="mono" style={{fontSize:10,color:"var(--c-warning)"}}>NEEDS +{item.gap} FTE</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {item.candidates.map((c,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",background:"var(--surface-hover)",borderRadius:4,fontSize:12}}>
                  <div>
                    <span style={{fontWeight:500}}>{c.name}</span>
                    <span style={{color:"var(--text3)",marginLeft:6,fontSize:11}}>{c.role}</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span className="mono badge badge-sm badge-ok">{c.free}% free</span>
                    {c.match>0&&<span className="mono badge badge-sm badge-accent">+{c.match} skill</span>}
                  </div>
                </div>)}
              </div>
            </div>;
          }
          if(sec.kind==="summary"){
            return <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"var(--surface-card)",border:"1px solid var(--border1)",borderRadius:6}}>
              <div>
                <div className="mono" style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>{item.label}</div>
                {item.sub&&<div style={{fontSize:11,color:item.warn?"var(--c-warning)":"var(--text3)"}}>{item.sub}</div>}
              </div>
              <div className="mono" style={{fontSize:15,fontWeight:600,color:item.warn?"var(--c-warning)":"var(--text1)"}}>{item.value}</div>
            </div>;
          }
          return null;
        })}
      </div>
    </div>)}

    {/* Drill-down action */}
    {result.goto&&<button className="btn-g" onClick={()=>goToTab(result.goto)} style={{width:"100%",marginTop:8}}>
      Open {result.goto==="team"?"Team":result.goto==="plan"?"Plan":"Analyze"} →
    </button>}
  </div>}
</div>
```

  </div>;
}

function TeamTab({twl,skills,discs,projs,scs,upsMember,delMember,gSk,gDi,upsSkill,toast,teamScFilter,setTeamScFilter}){
const blank={name:””,role:””,discId:””,sp:{},powers:[],cap:100,emp:“FTE”};
const [form,setForm]=useState(null);
const [editId,setEditId]=useState(null);
const [errs,setErrs]=useState({});
useEffect(()=>{const h=e=>{if(e.key===“Escape”&&form){setForm(null);setEditId(null);setErrs({});}};window.addEventListener(“keydown”,h);return()=>window.removeEventListener(“keydown”,h);},[form]);
const openNew=()=>{setForm({…blank,sp:{}});setEditId(null);setErrs({});};
const openEdit=m=>{setForm({…m,sp:{…m.sp}});setEditId(m.id);setErrs({});};
const close=()=>{setForm(null);setEditId(null);setErrs({});};
const save=()=>{const e={};if(!form.name.trim())e.name=“Required”;if(!form.role.trim())e.role=“Required”;if(form.cap<1||form.cap>100)e.cap=“1–100”;if(Object.keys(e).length){setErrs(e);return;}upsMember(editId?{…form,id:editId}:form);close();};
const promote=pw=>{upsSkill({id:uid(),name:pw.name,cat:“Superpower”,color:”#facc15”});upsMember({…form,id:editId||form.id,powers:(form.powers||[]).filter(p=>p.id!==pw.id)});toast(`"${pw.name}" promoted to Skill`);close();};

// Scoped projects and load
const scopedProjs=teamScFilter===“all”?projs:projs.filter(p=>p.scId===teamScFilter);
const scopedTwl=twl.map(m=>({…m,load:mLoad(m.id,scopedProjs)}));
const activeSc=scs.find(s=>s.id===teamScFilter);

return <div>
<SHead title=“Team Roster” sub={`${twl.length} members`} action={<button className="btn-p" onClick={openNew}>+ Add</button>}/>
{/* Scenario switcher */}
<div style={{display:“flex”,gap:6,marginBottom:16,flexWrap:“wrap”,alignItems:“center”}}>
<button className={teamScFilter===“all”?“vpill on”:“vpill”} onClick={()=>setTeamScFilter(“all”)} style={{minHeight:32,padding:“4px 12px”}}>All</button>
{scs.map(s=><button key={s.id} className={teamScFilter===s.id?“vpill on”:“vpill”} onClick={()=>setTeamScFilter(s.id)} style={{minHeight:32,padding:“4px 12px”,borderColor:teamScFilter===s.id?s.color+“66”:“var(–border2)”,color:teamScFilter===s.id?s.color:“var(–text2)”,background:teamScFilter===s.id?s.color+“12”:“var(–surface1)”}}>
<span style={{width:6,height:6,borderRadius:“50%”,background:s.color,display:“inline-block”,marginRight:5,flexShrink:0}}/>
{s.name}{s.active&&<span style={{marginLeft:5,fontSize:8,opacity:.7}}>★</span>}
</button>)}
</div>
{teamScFilter!==“all”&&<div style={{marginBottom:14,padding:“7px 11px”,background:`${activeSc?.color||"#888"}0a`,border:`1px solid ${activeSc?.color||"#888"}25`,borderRadius:8,fontSize:11,color:“var(–text2)”,fontFamily:”‘DM Mono’,monospace”}}>
Showing allocation for <span style={{color:activeSc?.color,fontWeight:600}}>{activeSc?.name}</span> · {scopedProjs.length} project{scopedProjs.length!==1?“s”:””}
</div>}
{form&&<div className="fpanel fp-g">
<p style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:700,fontSize:15,marginBottom:16,color:“var(–accent)”}}>{editId?“Edit Member”:“New Member”}</p>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:10}}>
<div><Lbl err={!!errs.name}>Name{errs.name&&` — ${errs.name}`}</Lbl><input className={errs.name?“inp inp-err”:“inp”} value={form.name} onChange={e=>{setForm(p=>({…p,name:e.target.value}));setErrs(p=>({…p,name:””}));}} onKeyDown={e=>e.key===“Enter”&&save()} placeholder=“Full name”/></div>
<div><Lbl err={!!errs.role}>Role{errs.role&&` — ${errs.role}`}</Lbl><input className={errs.role?“inp inp-err”:“inp”} value={form.role} onChange={e=>{setForm(p=>({…p,role:e.target.value}));setErrs(p=>({…p,role:””}));}} placeholder=“e.g. Senior UX Designer”/></div>
</div>
<div style={{marginBottom:10}}><Lbl>Discipline</Lbl><select className=“inp” value={form.discId||””} onChange={e=>setForm(p=>({…p,discId:e.target.value}))}><option value="">— None —</option>{discs.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:10}}>
<div><Lbl>Type</Lbl><select className=“inp” value={form.emp} onChange={e=>setForm(p=>({…p,emp:e.target.value}))}>{EMPT.map(t=><option key={t}>{t}</option>)}</select></div>
<div><Lbl err={!!errs.cap}>Capacity %{errs.cap&&` — ${errs.cap}`}</Lbl><input className={errs.cap?“inp inp-err”:“inp”} type=“number” inputMode=“numeric” min=“1” max=“100” value={form.cap} onChange={e=>{setForm(p=>({…p,cap:+e.target.value}));setErrs(p=>({…p,cap:””}));}}/></div>
</div>
<div style={{marginBottom:10,padding:“8px 10px”,background:“var(–surface-card)”,borderRadius:8,border:“1px solid var(–border1)”}}><div style={{display:“flex”,justifyContent:“space-between”,marginBottom:5,fontSize:11,color:“var(–text2)”}}><span className="mono">Available capacity</span><span className=“mono” style={{color:“var(–accent)”}}>{form.cap}%</span></div><CapBar used={0} total={form.cap}/></div>
<div style={{marginBottom:16}}><Lbl>Skill Proficiency</Lbl><MSkillEditor sp={form.sp} onChange={sp=>setForm(p=>({…p,sp}))} skills={skills}/></div>
<div style={{marginBottom:16}}><Lbl>⚡ Superpowers</Lbl><SuperpowersEditor powers={form.powers||[]} onChange={powers=>setForm(p=>({…p,powers}))} onPromote={promote}/></div>
<div style={{display:“flex”,gap:8,flexWrap:“wrap”}}><button className="btn-p" onClick={save}>Save</button><button className="btn-g" onClick={close}>Cancel</button></div>
</div>}
{scopedTwl.length===0?<Empty emoji="👥" title="No team members" sub="Add your first member" onAct={openNew} aLabel="Add Member"/>:
<div style={{display:“grid”,gap:10}}>
{scopedTwl.map((m,i)=>{const disc=gDi(m.discId);const pct=Math.round((m.load/m.cap)*100);const mp=scopedProjs.filter(p=>(p.roster||[]).some(r=>r.mId===m.id));
return <div key={m.id} className=“card fu” style={{padding:14,animationDelay:`${i*.04}s`}}>
<div style={{display:“flex”,gap:12,alignItems:“flex-start”}}>
<div className="avatar" style={{width:40,height:40,fontSize:13,flexShrink:0}}>{m.avatar}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,gap:8}}>
<div>
<div style={{fontWeight:600,fontSize:14}}>{m.name}</div>
<div className=“mono” style={{fontSize:11,color:“var(–text2)”,marginTop:2}}>{m.role}</div>
<div style={{display:“flex”,gap:5,flexWrap:“wrap”,marginTop:6,alignItems:“center”}}>
{disc&&<DBadge disc={disc}/>}
<span className={m.emp===“FTE”?“badge badge-accent”:“badge badge-warn”}>{m.emp}</span>
</div>
</div>
<div style={{display:“flex”,gap:2,flexShrink:0}}>
<button className=“ib” onClick={()=>openEdit(m)} title=“Edit”><EIcon/></button>
<button className=“ib ib-d” onClick={()=>delMember(m.id)} title=“Remove”><TIcon/></button>
</div>
</div>
<div style={{marginTop:10,marginBottom:10}}>
<div style={{display:“flex”,justifyContent:“space-between”,marginBottom:5}}>
<span className=“mono” style={{fontSize:11,color:“var(–text3)”}}>{pct}% allocated</span>
<span className="mono" style={{fontSize:11,fontWeight:500,color:m.load>m.cap?“var(–c-danger)”:m.load>m.cap*.85?“var(–c-warning)”:“var(–c-success)”}}>{m.load>m.cap?`⚠ ${m.load-m.cap}% over`:`${m.cap-m.load}% free`}</span>
</div>
<CapBar used={m.load} total={m.cap}/>
</div>
{mp.length>0&&<div style={{display:“flex”,flexWrap:“wrap”,gap:5,marginBottom:8}}>{mp.map(p=>{const e=(p.roster||[]).find(r=>r.mId===m.id);return e?<span key={p.id} className=“mono” style={{fontSize:10,padding:“2px 7px”,borderRadius:6,background:“var(–surface-card)”,border:“1px solid var(–border2)”,color:“var(–text2)”}}>{p.name} · {e.alloc}%</span>:null;})}</div>}
{Object.keys(m.sp||{}).length>0&&<div style={{display:“flex”,flexWrap:“wrap”,gap:5}}>{Object.entries(m.sp).map(([id,v])=>{const sk=gSk(id);if(!sk)return null;return <div key={id} style={{display:“flex”,alignItems:“center”,gap:5,background:`${sk.color}18`,border:`1.5px solid ${sk.color}`,borderRadius:7,padding:“3px 7px”}}><span className=“mono” style={{fontSize:10,color:sk.color,textTransform:“uppercase”,letterSpacing:”.05em”}}>{sk.name}</span><Pips v={v} color={sk.color}/></div>;})}</div>}
{(m.powers||[]).length>0&&<div style={{display:“flex”,flexWrap:“wrap”,gap:5,marginTop:5}}>{(m.powers||[]).map(pw=><div key={pw.id} style={{display:“flex”,alignItems:“center”,gap:5,background:“rgba(250,204,21,.05)”,border:“1px solid rgba(250,204,21,.15)”,borderRadius:7,padding:“3px 7px”}}><span style={{fontSize:10,flexShrink:0}}>⚡</span><span className=“mono” style={{fontSize:10,color:“rgba(250,204,21,.8)”,letterSpacing:”.03em”}}>{pw.name}</span><Pips v={pw.level} color="#facc15"/></div>)}</div>}
</div>
</div>
</div>;
})}
</div>}

  </div>;
}

function RecommendPanel({project,twl,skills,upsPr,onClose}){
const roster=project.roster||[];
const reqs=Object.entries(project.sr||{});

// Score every team member
const scored=twl.map(m=>{
// Skill score: sum of (member level / required level) capped at 1, per requirement
let skillScore=0;
const breakdown=reqs.map(([sid,req])=>{
const has=m.sp?.[sid]||0;
const ratio=Math.min(has/req,1);
skillScore+=ratio;
const sk=skills.find(s=>s.id===sid);
return {sid,name:sk?.name||sid,color:sk?.color||”#888”,has,req,ratio};
});
skillScore=reqs.length>0?skillScore/reqs.length:0; // 0–1
const freeCapacity=Math.max(0,m.cap-m.load);
const capScore=freeCapacity/100; // 0–1
const total=skillScore*0.7+capScore*0.3;
const onRoster=roster.some(r=>r.mId===m.id);
return {m,skillScore,capScore,freeCapacity,total,breakdown,onRoster};
});

// Sort: already-assigned last, then by total score desc
const ranked=scored
.filter(x=>x.total>0||x.onRoster)
.sort((a,b)=>a.onRoster-b.onRoster||b.total-a.total)
.slice(0,6);

const addToRoster=mId=>{
const already=roster.some(r=>r.mId===mId);
if(already)return;
upsPr({…project,roster:[…roster,{id:uid(),mId,alloc:50,role:””,start:””,end:””}]});
};

if(ranked.length===0)return <div style={{marginTop:10,padding:“14px 12px”,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:10,fontSize:13,color:“var(–text2)”,textAlign:“center”}}>No matching teammates found.</div>;

return <div style={{marginTop:10,background:“rgba(167,139,250,.05)”,border:“1px solid rgba(167,139,250,.2)”,borderRadius:10,padding:“12px 14px”}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:12}}>
<span style={{fontSize:12,fontFamily:”‘DM Mono’,monospace”,color:“var(–accent2)”,textTransform:“uppercase”,letterSpacing:”.08em”}}>✦ Recommended Teammates</span>
<button onClick={onClose} style={{background:“transparent”,border:“none”,color:“var(–text3)”,fontSize:16,lineHeight:1,cursor:“pointer”}}>×</button>
</div>
<div style={{display:“grid”,gap:8}}>
{ranked.map(({m,skillScore,freeCapacity,total,breakdown,onRoster})=>{
const pct=Math.round(total*100);
const barColor=pct>=70?“var(–accent)”:pct>=40?“var(–accent2)”:“var(–accent2)”;
return <div key={m.id} style={{background:“var(–surface-card)”,border:`1px solid ${onRoster?"rgba(0,229,160,.25)":"var(--border1)"}`,borderRadius:9,padding:“10px 12px”}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<div className="avatar" style={{width:32,height:32,fontSize:11,flexShrink:0}}>{m.avatar}</div>
<div style={{flex:1,minWidth:0}}>
<div style={{display:“flex”,alignItems:“center”,gap:7,marginBottom:3}}>
<span style={{fontWeight:600,fontSize:13}}>{m.name}</span>
{onRoster&&<span className="badge badge-sm badge-accent">On roster</span>}
</div>
<div style={{fontSize:11,color:“var(–text2)”,fontFamily:”‘DM Mono’,monospace”}}>{m.role}</div>
</div>
{/* Match score bar */}
<div style={{textAlign:“right”,flexShrink:0}}>
<div style={{fontFamily:”‘DM Mono’,monospace”,fontSize:15,fontWeight:500,color:barColor}}>{pct}%</div>
<div style={{fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”}}>match</div>
</div>
{onRoster
?<div style={{width:28,height:28,display:“flex”,alignItems:“center”,justifyContent:“center”,flexShrink:0,color:“var(–accent)”,fontSize:16}}>✓</div>
:<button onClick={()=>addToRoster(m.id)} className=“btn-p btn-sm” style={{flexShrink:0,padding:“5px 11px”,minHeight:28,fontSize:10}} title=“Add to roster”>+ Add</button>
}
</div>
{/* Skill breakdown */}
<div style={{marginTop:8,display:“flex”,flexWrap:“wrap”,gap:5}}>
{breakdown.map(b=>{
const met=b.has>=b.req;
const partial=!met&&b.has>0;
return <div key={b.sid} style={{display:“flex”,alignItems:“center”,gap:4,padding:“3px 7px”,borderRadius:6,background:met?`${b.color}15`:partial?“rgba(251,146,60,.1)”:“var(–surface1)”,border:`1px solid ${met?b.color+"35":partial?"rgba(251,146,60,.3)":"var(--border2)"}`}}>
<span style={{fontSize:10,fontFamily:”‘DM Mono’,monospace”,color:met?b.color:partial?”#fb923c”:“var(–text3)”,textTransform:“uppercase”}}>{b.name}</span>
<span style={{fontSize:10,fontFamily:”‘DM Mono’,monospace”,color:“var(–text3)”}}>{b.has>0?pv(b.has).s:”—”}</span>
{!met&&<span style={{fontSize:10,color:“var(–text3)”}}>/{pv(b.req).s}</span>}
{met&&<span style={{fontSize:10,color:b.color}}>✓</span>}
</div>;
})}
</div>
{/* Capacity indicator */}
<div style={{marginTop:6,display:“flex”,alignItems:“center”,gap:6}}>
<div style={{flex:1,background:“var(–surface-card)”,borderRadius:99,height:3,overflow:“hidden”}}>
<div style={{width:`${clamp((freeCapacity/100)*100,0,100)}%`,height:“100%”,borderRadius:99,background:freeCapacity>=30?“var(–c-success)”:freeCapacity>=10?“var(–c-warning)”:“var(–c-danger)”,transition:“width .4s”}}/>
</div>
<span style={{fontSize:10,fontFamily:”‘DM Mono’,monospace”,color:“var(–text3)”,whiteSpace:“nowrap”}}>{freeCapacity}% free</span>
</div>
</div>;
})}
</div>

  </div>;
}

function MatrixView({scs,projs,twl,matrixOrder,setMatrixOrder}){
const [dragId,setDragId]=useState(null);
const [dragOver,setDragOver]=useState(null);

// Init order from scs if not yet set, keep in sync with new scenarios
const defaultOrder=()=>{const active=scs.filter(s=>s.active).map(s=>s.id);const rest=scs.filter(s=>!s.active).map(s=>s.id);return […active,…rest];};
const order=matrixOrder||defaultOrder();
const ordered=order.map(id=>scs.find(s=>s.id===id)).filter(Boolean);
const missing=scs.filter(s=>!order.includes(s.id));
const allOrdered=[…ordered,…missing];

const onDragStart=id=>setDragId(id);
const onDragOver=(e,id)=>{e.preventDefault();if(id!==dragId)setDragOver(id);};
const onDrop=(e,targetId)=>{
e.preventDefault();
if(!dragId||dragId===targetId)return;
const active=scs.find(s=>s.active);
// Active scenario cannot be displaced from position 0
setMatrixOrder(prev=>{
const ids=[…prev,…missing.map(s=>s.id)];
const from=ids.indexOf(dragId);
const to=ids.indexOf(targetId);
if(from===-1||to===-1)return ids;
// Block dragging over the active scenario’s slot
if(active&&targetId===active.id)return ids;
// Block dragging the active scenario away from top
if(active&&dragId===active.id)return ids;
const next=[…ids];
next.splice(from,1);
next.splice(to,0,dragId);
return next;
});
setDragId(null);setDragOver(null);
};
const onDragEnd=()=>{setDragId(null);setDragOver(null);};

return <div style={{display:“grid”,gap:20}}>
<div style={{fontSize:12,color:“var(–text3)”,fontFamily:”‘DM Mono’,monospace”}}>Drag to reorder · active scenario pinned first</div>
{allOrdered.map(s=>{
const sP=projs.filter(p=>p.scId===s.id);
// Only show members who appear on at least one project in this scenario
const memberIds=new Set(sP.flatMap(p=>(p.roster||[]).map(r=>r.mId)));
const members=twl.filter(m=>memberIds.has(m.id));
const cols=sP.length;
const isDragging=dragId===s.id;
const isOver=dragOver===s.id;
const isActive=s.active;

```
  return <div
    key={s.id}
    draggable={!isActive}
    onDragStart={()=>onDragStart(s.id)}
    onDragOver={e=>onDragOver(e,s.id)}
    onDrop={e=>onDrop(e,s.id)}
    onDragEnd={onDragEnd}
    style={{
      opacity:isDragging?.4:1,
      transform:isOver?"translateY(-2px)":"none",
      transition:"opacity .15s,transform .15s",
      borderRadius:8,
      border:`1px solid ${isOver?s.color+"60":s.color+"25"}`,
      overflow:"hidden",
      cursor:isActive?"default":"grab",
    }}
  >
    {/* Scenario header */}
    <div style={{background:`linear-gradient(90deg,${s.color}12,transparent)`,padding:"10px 14px",display:"flex",alignItems:"center",gap:9,borderBottom:`1px solid ${s.color}20`}}>
      {!isActive&&<span style={{color:"var(--text4)",fontSize:12,lineHeight:1,userSelect:"none",marginRight:2}}>⠿</span>}
      <span style={{width:9,height:9,borderRadius:"50%",background:s.color,display:"inline-block",flexShrink:0}}/>
      <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontWeight:800,fontSize:14,flex:1}}>{s.name}</span>
      {isActive&&<span className="badge badge-accent" style={{background:`${s.color}18`,borderColor:s.color,color:s.color}}>Active</span>}
      <span className="mono" style={{fontSize:10,color:"var(--text3)"}}>{sP.length} project{sP.length!==1?"s":""} · {members.length} member{members.length!==1?"s":""}</span>
    </div>

    {sP.length===0
      ?<div className="mono" style={{textAlign:"center",padding:"14px",color:"var(--text4)",fontSize:11}}>No projects in this scenario</div>
      :<div style={{padding:"10px 12px",overflowX:"auto"}}>
        <div style={{minWidth:Math.max(360,120+cols*110)}}>
          {/* Column headers — project names */}
          <div style={{display:"grid",gridTemplateColumns:`120px repeat(${cols},1fr)`,gap:5,marginBottom:5}}>
            <div/>
            {sP.map(p=><div key={p.id} className="mono" style={{fontSize:10,color:"var(--text2)",textTransform:"uppercase",textAlign:"center",padding:"5px 4px",background:"var(--surface-card)",borderRadius:7,lineHeight:1.3}}>
              <Dot prio={p.prio}/><br/>
              {p.name.length>13?p.name.slice(0,13)+"…":p.name}
              {p.stage&&<div style={{marginTop:3}}><span style={{fontSize:8,padding:"1px 5px",borderRadius:3,background:`${sv(p.stage).c}18`,color:sv(p.stage).c,border:`1px solid ${sv(p.stage).c}30`}}>{sv(p.stage).l}</span></div>}
            </div>)}
          </div>

          {/* Member rows */}
          {members.map(m=><div key={m.id} style={{display:"grid",gridTemplateColumns:`120px repeat(${cols},1fr)`,gap:5,marginBottom:5}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--surface-card)",borderRadius:7,padding:"5px 7px"}}>
              <div className="avatar" style={{width:20,height:20,borderRadius:5,fontSize:10,flexShrink:0}}>{m.avatar}</div>
              <span style={{fontSize:11,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name.split(" ")[0]}</span>
            </div>
            {sP.map(p=>{
              const e=(p.roster||[]).find(r=>r.mId===m.id);
              const a=e?.alloc||0;
              const c=a>=80?"var(--accent)":a>=40?"var(--accent2)":a>0?"var(--accent2)":"transparent";
              return <div key={p.id} className="mono" style={{textAlign:"center",padding:"5px 4px",borderRadius:7,background:a>0?`${c}18`:"rgba(255,255,255,.02)",border:`1px solid ${a>0?`${c}35`:"rgba(255,255,255,.06)"}`,fontSize:12,color:a>0?c:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:32}}>{a>0?`${a}%`:"—"}</div>;
            })}
          </div>)}

          {/* FTE totals row */}
          <div style={{display:"grid",gridTemplateColumns:`120px repeat(${cols},1fr)`,gap:5,marginTop:4,paddingTop:8,borderTop:"1px solid var(--border1)"}}>
            <div className="mono" style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",display:"flex",alignItems:"center",paddingLeft:7}}>FTEs</div>
            {sP.map(p=>{
              const actual=pFTE(p);const target=p.fte||0;
              const over=target>0&&actual>target;const under=target>0&&actual<target;
              return <div key={p.id} className="mono" style={{textAlign:"center",padding:"5px 4px",borderRadius:7,background:over?"rgba(255,68,68,.1)":under?"rgba(251,146,60,.1)":"rgba(var(--accent-rgb),.08)",border:`1px solid ${over?"rgba(255,68,68,.3)":under?"rgba(251,146,60,.3)":"rgba(var(--accent-rgb),.2)"}`,fontSize:12,color:over?"#ff6666":under?"#fb923c":"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}>
                <span>{actual.toFixed(1)}</span>
                {target>0&&<span style={{fontSize:8,opacity:.6}}>/{target}</span>}
              </div>;
            })}
          </div>
        </div>
      </div>
    }
  </div>;
})}
```

  </div>;
}

function ProjectsTab({scs,projs,twl,skills,discs,upsSc,delSc,upsPr,delPr,gSk,gDi,gMb}){
const bP={name:””,type:“full”,stage:1,sr:{},prio:“Medium”,due:””,scId:null,fte:0,owner:””,notes:””,roster:[],tracks:[]};
const [pF,setPF]=useState(null);const [pId,setPId]=useState(null);const [pE,setPE]=useState({});
const [projSearch,setProjSearch]=useState(””);
useEffect(()=>{const h=e=>{if(e.key===“Escape”)setPF(null);};window.addEventListener(“keydown”,h);return()=>window.removeEventListener(“keydown”,h);},[]);
const saveP=()=>{if(!pF.name.trim()){setPE({name:“Required”});return;}upsPr(pId?{…pF,id:pId}:pF);setPF(null);setPId(null);setPE({});};
return <div>
<SHead title=“Projects” sub={`${projs.length} projects`} action={<button className=“btn-p” onClick={()=>{setPF({…bP});setPId(null);setPE({});}}>+ Project</button>}/>
{pF&&<div className="fpanel fp-b">
<p style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:700,fontSize:15,marginBottom:16,color:“var(–accent2)”}}>{pId?“Edit Project”:“New Project”}</p>
<div style={{marginBottom:10}}><Lbl err={!!pE.name}>Name{pE.name&&` — ${pE.name}`}</Lbl><input className={pE.name?“inp inp-err”:“inp”} value={pF.name} onChange={e=>{setPF(p=>({…p,name:e.target.value}));setPE({});}} placeholder=“Project name”/></div>
<div style={{marginBottom:10}}><Lbl>Scenario</Lbl><select className=“inp” value={pF.scId||””} onChange={e=>setPF(p=>({…p,scId:e.target.value||null}))}><option value="">— Backlog (no scenario) —</option>{scs.map(s=><option key={s.id} value={s.id}>{s.name}{s.active?” ★”:””}</option>)}</select></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:10}}>
<div><Lbl>Project Owner</Lbl><input className=“inp” value={pF.owner||””} onChange={e=>setPF(p=>({…p,owner:e.target.value}))} placeholder=“Name or team”/></div>
<div><Lbl>Stage</Lbl><div style={{display:“flex”,gap:5,marginTop:2}}>{STAGE.map(s=><button key={s.v} onClick={()=>setPF(p=>({…p,stage:s.v}))} style={{flex:1,padding:“7px 4px”,borderRadius:7,border:`1.5px solid ${pF.stage===s.v?s.c+"66":"rgba(255,255,255,.1)"}`,background:pF.stage===s.v?s.c+“18”:“rgba(255,255,255,.04)”,color:pF.stage===s.v?s.c:“rgba(255,255,255,.35)”,fontSize:10,fontFamily:”‘DM Mono’,monospace”,lineHeight:1.3,minHeight:46,display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,gap:2}}><span style={{fontSize:14,fontWeight:700}}>{s.v}</span><span style={{fontSize:10,letterSpacing:”.04em”,textTransform:“uppercase”}}>{s.l}</span></button>)}</div></div>
</div>
<div style={{marginBottom:10}}><Lbl>Notes</Lbl><textarea className=“inp” value={pF.notes||””} onChange={e=>setPF(p=>({…p,notes:e.target.value}))} placeholder=“Context, background, constraints, or anything the team should know…” style={{minHeight:80,resize:“vertical”,lineHeight:1.6}}/></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr 1fr”,gap:10,marginBottom:10}}><div><Lbl>Priority</Lbl><select className=“inp” value={pF.prio} onChange={e=>setPF(p=>({…p,prio:e.target.value}))}>{[“Critical”,“High”,“Medium”,“Low”].map(pr=><option key={pr}>{pr}</option>)}</select></div><div><Lbl>Deadline</Lbl><input className=“inp” type=“date” value={pF.due} onChange={e=>setPF(p=>({…p,due:e.target.value}))} style={{colorScheme:“dark”}}/></div><div><Lbl>Target FTEs</Lbl><input className=“inp” type=“number” inputMode=“decimal” min=“0” max=“20” step=“0.5” value={pF.fte||””} onChange={e=>setPF(p=>({…p,fte:Math.min(20,+e.target.value)}))} placeholder=“e.g. 2”/><span style={{fontSize:10,color:“var(–text3)”,marginTop:3,display:“block”}}>Planned headcount</span></div></div>
<div style={{marginBottom:14}}><Lbl>Project Type</Lbl><div style={{display:“flex”,gap:6,marginTop:2}}><button onClick={()=>setPF(p=>({…p,type:“full”}))} style={{flex:1,padding:“8px 10px”,borderRadius:8,border:`1.5px solid ${(pF.type||"full")==="full"?"rgba(var(--accent2-rgb),.5)":"var(--border2)"}`,background:(pF.type||“full”)===“full”?“rgba(var(–accent2-rgb),.1)”:“var(–surface1)”,color:(pF.type||“full”)===“full”?“var(–accent2)”:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,textAlign:“center”}}><div style={{fontWeight:600,marginBottom:2}}>Full Project</div><div style={{fontSize:10,opacity:.7}}>Tracks · Skills · Stage</div></button><button onClick={()=>setPF(p=>({…p,type:“side”}))} style={{flex:1,padding:“8px 10px”,borderRadius:8,border:`1.5px solid ${pF.type==="side"?"rgba(var(--accent-rgb),.5)":"var(--border2)"}`,background:pF.type===“side”?“rgba(var(–accent-rgb),.1)”:“var(–surface1)”,color:pF.type===“side”?“var(–accent)”:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,textAlign:“center”}}><div style={{fontWeight:600,marginBottom:2}}>◈ Side Project</div><div style={{fontSize:10,opacity:.7}}>Capacity hold · No tracks</div></button></div></div>
{(pF.type||“full”)===“full”&&<div style={{marginBottom:10}}><Lbl>Skill Requirements</Lbl><SREditor reqs={pF.sr} onChange={sr=>setPF(p=>({…p,sr}))} skills={skills}/></div>}
{(pF.type||“full”)===“full”&&<div style={{marginBottom:16}}><Lbl>Tracks</Lbl><FormTracksEditor tracks={pF.tracks||[]} onChange={tracks=>setPF(p=>({…p,tracks}))}/></div>}
<div style={{display:“flex”,gap:8,flexWrap:“wrap”}}><button className="btn-p" onClick={saveP}>Save</button><button className=“btn-g” onClick={()=>{setPF(null);setPId(null);setPE({});}}>Cancel</button></div>
</div>}
<div style={{display:“flex”,gap:8,marginBottom:14,alignItems:“center”}}>
<input value={projSearch} onChange={e=>setProjSearch(e.target.value)} placeholder=“Search projects…” style={{flex:1,background:“var(–surface-raise)”,border:“1.5px solid var(–border2)”,borderRadius:9,padding:“9px 13px”,color:“var(–text1)”,fontFamily:”‘DM Sans’,sans-serif”,fontSize:13,outline:“none”}} onFocus={e=>e.target.style.borderColor=“rgba(0,229,160,.4)”} onBlur={e=>e.target.style.borderColor=“var(–border2)”}/>
</div>
{(()=>{
const q=projSearch.toLowerCase();
const filtered=projs.filter(p=>!q||p.name.toLowerCase().includes(q));
const backlog=filtered.filter(p=>!p.scId);
const byScenario=scs.map(s=>({s,ps:filtered.filter(p=>p.scId===s.id)}));
const groups=[{label:“Backlog”,color:“var(–text4)”,ps:backlog,scId:null},…byScenario.map(({s,ps})=>({label:s.name,color:s.color,active:s.active,scId:s.id,ps}))];
return <div style={{display:“grid”,gap:14}}>
{groups.map(g=><div key={g.label}>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:8}}>
<span style={{width:8,height:8,borderRadius:“50%”,background:g.color,display:“inline-block”,flexShrink:0}}/>
<span style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:700,fontSize:13,color:g.color}}>{g.label}</span>
{g.active&&<span className=“mono” style={{fontSize:10,padding:“1px 7px”,borderRadius:4,background:“rgba(var(–accent-rgb),.12)”,color:“var(–accent)”,border:“1px solid rgba(var(–accent-rgb),.3)”,textTransform:“uppercase”}}>Active</span>}
<span className=“mono” style={{fontSize:10,color:“var(–text3)”}}>{g.ps.length} project{g.ps.length!==1?“s”:””}</span>
</div>
{g.ps.length===0?<div style={{fontSize:11,color:“var(–text3)”,padding:“10px 14px”,background:“var(–surface-card)”,borderRadius:8,border:“1px dashed var(–border1)”,fontFamily:”‘DM Mono’,monospace”}}>{g.label===“Backlog”?<span>No unassigned projects — projects without a scenario land here. <span style={{color:“rgba(0,229,160,.6)”}}>Assign one from the scenario dropdown ↗</span></span>:<span>No projects in this scenario</span>}</div>:
<div style={{display:“grid”,gap:8}}>
{g.ps.map(p=>{const actual=pFTE(p);const target=p.fte||0;const over=target>0&&actual>target;const under=target>0&&actual<target;
return <div key={p.id} style={{background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:10,padding:“11px 12px”}}>
{/* Top bar: actions flush right */}
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:8,gap:8}}>
<div style={{display:“flex”,alignItems:“center”,gap:8,flexWrap:“wrap”,minWidth:0}}>
<span style={{fontWeight:700,fontSize:15,lineHeight:1.2}}>{p.name}</span>
{p.type===“side”&&<SideBadge/>}{p.stage&&<StageBadge v={p.stage}/>}
</div>
<div style={{display:“flex”,alignItems:“center”,gap:4,flexShrink:0}}>
<select value={p.scId||””} onChange={e=>upsPr({…p,scId:e.target.value||null})} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:7,padding:“4px 8px”,color:“var(–text2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,outline:“none”,maxWidth:120}}>
<option value="">Backlog</option>
{scs.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
</select>
{p.type===“side”&&<button className=“ib” onClick={()=>upsPr({…p,type:“full”})} title=“Promote to Full Project” style={{fontSize:10,fontFamily:”‘DM Mono’,monospace”,color:“rgba(167,139,250,.6)”,width:“auto”,padding:“0 7px”,letterSpacing:”.04em”}}>PROMOTE</button>}
<button className=“ib” onClick={()=>upsPr({…p,id:uid(),name:p.name+” (copy)”,roster:[],tracks:[…(p.tracks||[]).map(t=>({…t,id:uid()}))]})} title=“Duplicate” style={{color:“var(–text3)”}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
<button className=“ib” onClick={()=>{setPF({…p,sr:{…p.sr},roster:[…(p.roster||[])],tracks:[…(p.tracks||[])]});setPId(p.id);setPE({});}} title=“Edit”><EIcon/></button>
<button className=“ib ib-d” onClick={()=>delPr(p.id)} title=“Delete”><TIcon/></button>
</div>
</div>
{/* Full-width content */}
<div style={{width:“100%”}}>
{/* Priority · Owner · Deadline · FTE · Assigned */}
<div style={{display:“flex”,gap:7,alignItems:“center”,flexWrap:“wrap”,marginBottom:6}}>
<span className=“badge” style={{background:`${PC[p.prio]||"#888"}20`,border:`1.5px solid ${PC[p.prio]||"#888"}`,color:PC[p.prio]||”#888”}}>{p.prio}</span>
{p.owner&&<><span style={{fontSize:11,color:“var(–text2)”,fontWeight:500}}>{p.owner}</span><span className=“mono” style={{fontSize:10,color:“var(–text4)”,textTransform:“uppercase”,letterSpacing:”.05em”}}>owner</span></>}
{p.due&&<span className=“mono” style={{fontSize:10,color:“var(–text2)”}}>📅 {fd(p.due)}</span>}
<FBadge n={actual.toFixed(1)} actual={actual} target={target}/>
{(p.roster||[]).length>0&&<span className=“mono” style={{fontSize:10,color:“var(–text3)”}}>{(p.roster||[]).length} assigned</span>}
</div>
{/* Notes */}
{p.notes&&<div style={{marginBottom:8,fontSize:12,color:“var(–text3)”,lineHeight:1.55,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:7,padding:“6px 9px”,width:“100%”}}>{p.notes}</div>}
{/* Tracks — full projects only */}
{p.type!==“side”&&(p.tracks||[]).length>0&&<div style={{display:“grid”,gap:5,width:“100%”}}>
{(p.tracks||[]).map(t=>{
const st=tv(t.status);
const updT=(f,v)=>upsPr({…p,tracks:(p.tracks||[]).map(x=>x.id===t.id?{…x,[f]:v}:x)});
const remT=()=>upsPr({…p,tracks:(p.tracks||[]).filter(x=>x.id!==t.id)});
return <div key={t.id} style={{background:“var(–surface-card)”,border:`1px solid ${st.c}25`,borderRadius:8,padding:“8px 10px”,width:“100%”}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,gap:7,marginBottom:5}}>
<div style={{display:“flex”,alignItems:“center”,gap:6,flex:1,minWidth:0}}>
<span style={{width:5,height:5,borderRadius:“50%”,background:st.c,flexShrink:0,display:“inline-block”}}/>
<input value={t.name} onChange={e=>updT(“name”,e.target.value)} style={{background:“transparent”,border:“none”,borderBottom:“1px solid var(–border2)”,color:“var(–text1)”,fontSize:13,fontWeight:600,outline:“none”,flex:1,minWidth:0,fontFamily:”‘DM Sans’,sans-serif”,padding:“1px 0”,width:“100%”}}/>
</div>
<div style={{display:“flex”,gap:5,alignItems:“center”,flexShrink:0}}>
<select value={t.status} onChange={e=>updT(“status”,e.target.value)} style={{background:“var(–surface-card)”,border:`1px solid ${st.c}50`,borderRadius:6,padding:“4px 9px”,color:st.c,fontSize:10,fontFamily:”‘DM Mono’,monospace”,outline:“none”,minHeight:26,fontWeight:600}}>{TRKST.map(s=><option key={s.id} value={s.id}>{s.l}</option>)}</select>
<button className="ib ib-d ib-sm" onClick={remT}><TIcon/></button>
</div>
</div>
<input value={t.desc||””} onChange={e=>updT(“desc”,e.target.value)} placeholder=“Description…” style={{background:“transparent”,border:“none”,borderBottom:“1px solid var(–border1)”,color:“var(–text2)”,fontSize:12,outline:“none”,width:“100%”,padding:“3px 0”,marginBottom:6,fontFamily:”‘DM Sans’,sans-serif”}}/>
<div style={{display:“flex”,gap:8,alignItems:“center”,flexWrap:“wrap”}}>
<div style={{display:“flex”,alignItems:“center”,gap:2}}><input type=“number” inputMode=“numeric” min=“0” max=“100” value={t.fte||””} onChange={e=>updT(“fte”,+e.target.value)} placeholder=“FTE%” style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:6,padding:“4px 7px”,color:“var(–text1)”,fontSize:11,outline:“none”,width:50,fontFamily:”‘DM Mono’,monospace”,minHeight:28}}/><span className=“mono” style={{fontSize:10,color:“var(–text3)”}}>%</span></div>
<select value={t.ownId||””} onChange={e=>updT(“ownId”,e.target.value)} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:6,padding:“2px 7px”,color:“var(–text2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,outline:“none”,flex:1,minWidth:100}}><option value="">No owner</option>{twl.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
<input type=“date” value={t.start||””} onChange={e=>updT(“start”,e.target.value)} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:5,padding:“2px 6px”,color:“var(–text2)”,fontSize:11,outline:“none”,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/>
<span style={{fontSize:10,color:“var(–text3)”}}>→</span>
<input type=“date” value={t.end||””} onChange={e=>updT(“end”,e.target.value)} style={{background:“var(–surface-raise)”,border:“1px solid var(–border2)”,borderRadius:5,padding:“2px 6px”,color:“var(–text2)”,fontSize:11,outline:“none”,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/>
</div>
</div>;
})}
</div>}
{p.type!==“side”&&(p.tracks||[]).some(t=>t.fte>0)&&(()=>{const tFTE=(p.tracks||[]).reduce((s,t)=>s+(t.fte||0),0);const tgt=(p.fte||0)*100;const over=tgt>0&&tFTE>tgt;const under=tgt>0&&tFTE<tgt;return <div style={{marginTop:4,padding:“4px 10px”,background:“rgba(var(–accent2-rgb),.04)”,border:“1px solid rgba(var(–accent2-rgb),.12)”,borderRadius:7,display:“flex”,justifyContent:“space-between”,alignItems:“center”}}><span className=“mono” style={{fontSize:10,color:“var(–accent2)”,textTransform:“uppercase”,letterSpacing:”.06em”}}>Track FTE total</span><span className=“mono” style={{fontSize:10,color:over?”#ff6666”:under?”#fb923c”:“var(–accent2)”}}>{tFTE}%{tgt>0?` / ${tgt}%`:””}{over?” ↑”:under?” ↓”:””}</span></div>;})()}
</div>
</div>;})}
</div>}
</div>)}
</div>;
})()}

  </div>;
}

function ScenariosTab({scs,projs,twl,skills,discs,upsSc,delSc,upsPr,delPr,gSk,gDi,gMb,matrixOrder,setMatrixOrder}){
const [view,setView]=useState(“list”);
const bS={name:””,desc:””,color:SCC[0],active:false};
const bP={name:””,type:“full”,stage:1,sr:{},prio:“Medium”,due:””,scId:null,fte:0,owner:””,notes:””,roster:[],tracks:[]};
const [sF,setSF]=useState(null);const [sId,setSId]=useState(null);const [sE,setSE]=useState({});
const [pF,setPF]=useState(null);const [pId,setPId]=useState(null);const [pE,setPE]=useState({});
const [exp,setExp]=useState([]);
const [recPid,setRecPid]=useState(null);
useEffect(()=>{const h=e=>{if(e.key===“Escape”){setSF(null);setPF(null);}};window.addEventListener(“keydown”,h);return()=>window.removeEventListener(“keydown”,h);},[]);
const toggleExp=id=>setExp(p=>p.includes(id)?p.filter(x=>x!==id):[…p,id]);
const saveS=()=>{if(!sF.name.trim()){setSE({name:“Required”});return;}upsSc(sId?{…sF,id:sId}:sF);setSF(null);setSId(null);setSE({});};
const saveP=()=>{if(!pF.name.trim()){setPE({name:“Required”});return;}upsPr(pId?{…pF,id:pId}:pF);setPF(null);setPId(null);setPE({});};
const mc=p=>twl.filter(m=>Object.entries(p.sr||{}).every(([sid,req])=>(m.sp?.[sid]||0)>=req)&&(m.cap-m.load)>0).length;
return <div>
<SHead title=“Scenarios” sub={`${scs.length} scenarios`} action={<button className=“btn-p” onClick={()=>{setSF({…bS});setSId(null);setSE({});}}>+ Scenario</button>}/>
<div style={{display:“flex”,gap:7,marginBottom:18,flexWrap:“wrap”}}>
{[{id:“list”,l:“📋 Scenarios”},{id:“compare”,l:“⚖️ Compare”},{id:“matrix”,l:“🔢 Matrix”}].map(v=><button key={v.id} className={view===v.id?“vpill on”:“vpill”} onClick={()=>setView(v.id)}>{v.l}</button>)}
</div>
{view===“compare”&&<div style={{display:“grid”,gap:14}}>
{scs.map(s=>{const sP=projs.filter(p=>p.scId===s.id);const ftes=+sP.reduce((a,p)=>a+pFTE(p),0).toFixed(1);const targetFTE=sP.reduce((a,p)=>a+(p.fte||0),0);const ftePct=targetFTE>0?Math.round(ftes/targetFTE*100):null;const trks=sP.flatMap(p=>p.tracks||[]);const blk=trks.filter(t=>t.status===“blocked”).length;const ppl=new Set(sP.flatMap(p=>(p.roster||[]).map(r=>r.mId))).size;
return <div key={s.id} className=“card” style={{padding:18,border:`1px solid ${s.color}28`}}>
<div style={{display:“flex”,alignItems:“center”,gap:9,marginBottom:14}}><span style={{width:10,height:10,borderRadius:“50%”,background:s.color,display:“inline-block”,flexShrink:0}}/><span style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:800,fontSize:16,flex:1}}>{s.name}</span>{s.active&&<span className=“badge badge-accent” style={{background:`${s.color}18`,borderColor:s.color,color:s.color}}>Active</span>}</div>
<div style={{display:“grid”,gridTemplateColumns:“repeat(3,1fr)”,gap:9,marginBottom:14}}>
{[{l:“Projects”,v:sP.length,c:“var(–text1)”},{l:“FTEs”,v:ftes.toFixed(1),c:“var(–accent)”},{l:“People”,v:ppl,c:“var(–accent2)”},{l:“Tracks”,v:trks.length,c:“var(–accent2)”},{l:“Blocked”,v:blk,c:blk>0?”#ff4444”:“var(–text3)”},{l:“Critical”,v:sP.filter(p=>p.prio===“Critical”).length,c:sP.filter(p=>p.prio===“Critical”).length>0?”#ff4444”:“var(–text3)”}].map(x=><div key={x.l} style={{textAlign:“center”,background:“var(–surface-card)”,borderRadius:9,padding:“9px 7px”}}><div className="mono" style={{fontSize:18,fontWeight:500,color:x.c}}>{x.v}</div><div className=“mono” style={{fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”,marginTop:3}}>{x.l}</div></div>)}
</div>
{targetFTE>0&&<div><div style={{display:“flex”,justifyContent:“space-between”,marginBottom:5,fontSize:11}}><span style={{color:“var(–text2)”}}>FTE Coverage</span><span className="mono" style={{color:ftePct>100?”#ff4444”:ftePct>80?”#ffaa00”:s.color}}>{ftes} / {targetFTE} target</span></div><div style={{background:“var(–surface-card)”,borderRadius:99,height:5,overflow:“hidden”}}><div style={{width:`${Math.min(ftePct||0,100)}%`,background:ftePct>100?”#ff4444”:ftePct<80?”#ffaa00”:s.color,height:“100%”,borderRadius:99}}/></div></div>}
</div>;})}
</div>}
{view===“matrix”&&<MatrixView scs={scs} projs={projs} twl={twl} matrixOrder={matrixOrder} setMatrixOrder={setMatrixOrder}/>}
{view===“list”&&<>
{sF&&<div className="fpanel fp-g">
<p style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:700,fontSize:15,marginBottom:16,color:“var(–accent)”}}>{sId?“Edit Scenario”:“New Scenario”}</p>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:10}}><div><Lbl err={!!sE.name}>Name{sE.name&&` — ${sE.name}`}</Lbl><input className={sE.name?“inp inp-err”:“inp”} value={sF.name} onChange={e=>{setSF(p=>({…p,name:e.target.value}));setSE({});}} onKeyDown={e=>e.key===“Enter”&&saveS()} placeholder=“e.g. Q3 Roadmap”/></div><div><Lbl>Description</Lbl><input className=“inp” value={sF.desc} onChange={e=>setSF(p=>({…p,desc:e.target.value}))} placeholder=“Short description”/></div></div>
<div style={{display:“flex”,gap:18,alignItems:“center”,marginBottom:16,flexWrap:“wrap”}}><div><Lbl>Color</Lbl><div style={{display:“flex”,gap:8,marginTop:4}}>{SCC.map(c=><button key={c} onClick={()=>setSF(p=>({…p,color:c}))} style={{width:22,height:22,borderRadius:6,background:c,border:“none”,outline:sF.color===c?“2.5px solid #fff”:“2.5px solid transparent”,boxShadow:sF.color===c?`0 0 10px ${c}`:“none”}}/>)}</div></div>
<div style={{marginTop:16}}><Lbl>Status</Lbl><div style={{display:“flex”,gap:7,marginTop:4}}><button onClick={()=>setSF(p=>({…p,active:true}))} style={{padding:“5px 13px”,borderRadius:7,border:`1.5px solid ${sF.active?"rgba(var(--accent-rgb),.5)":"var(--border2)"}`,background:sF.active?“rgba(var(–accent-rgb),.12)”:“var(–surface1)”,color:sF.active?“var(–accent)”:“var(–text2)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,minHeight:32}}>● Active</button><button onClick={()=>setSF(p=>({…p,active:false}))} style={{padding:“5px 13px”,borderRadius:7,border:`1.5px solid ${!sF.active?"var(--border3)":"var(--border1)"}`,background:!sF.active?“var(–surface2)”:“var(–surface1)”,color:!sF.active?“var(–text1)”:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,minHeight:32}}>Draft</button></div></div>
</div>
{sId&&(()=>{const sP=projs.filter(p=>p.scId===sId);const totalFTE=sP.reduce((a,p)=>a+pFTE(p),0);const targetFTE=sP.reduce((a,p)=>a+(p.fte||0),0);if(!sP.length)return null;const ftePct=targetFTE>0?Math.round(totalFTE/targetFTE*100):null;return <div style={{marginBottom:14,padding:“9px 12px”,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:9}}><div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:ftePct!==null?6:0}}><span className=“mono” style={{fontSize:10,color:“var(–text2)”,textTransform:“uppercase”,letterSpacing:”.07em”}}>{sP.length} project{sP.length!==1?“s”:””} · {totalFTE.toFixed(1)} FTE assigned</span>{targetFTE>0&&<span className="mono" style={{fontSize:10,color:ftePct>100?”#ff6666”:ftePct<80?”#fb923c”:“var(–accent)”}}>{ftePct}% of {targetFTE} FTE target</span>}</div>{ftePct!==null&&<div style={{background:“var(–surface-card)”,borderRadius:99,height:4,overflow:“hidden”}}><div style={{width:`${Math.min(ftePct,100)}%`,height:“100%”,borderRadius:99,background:ftePct>100?”#ff4444”:ftePct<80?”#fb923c”:“var(–accent)”}}/></div>}</div>;})()}
<div style={{display:“flex”,gap:8,flexWrap:“wrap”}}><button className="btn-p" onClick={saveS}>Save</button><button className=“btn-g” onClick={()=>{setSF(null);setSId(null);setSE({});}}>Cancel</button></div>
</div>}
{pF&&<div className="fpanel fp-b">
<p style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:700,fontSize:15,marginBottom:16,color:“var(–accent2)”}}>{pId?“Edit Project”:“New Project”}</p>
<div style={{marginBottom:10}}><Lbl err={!!pE.name}>Name{pE.name&&` — ${pE.name}`}</Lbl><input className={pE.name?“inp inp-err”:“inp”} value={pF.name} onChange={e=>{setPF(p=>({…p,name:e.target.value}));setPE({});}} placeholder=“Project name”/></div>
<div style={{marginBottom:10}}><Lbl>Scenario</Lbl><select className=“inp” value={pF.scId||””} onChange={e=>setPF(p=>({…p,scId:e.target.value||null}))}><option value="">— Backlog (no scenario) —</option>{scs.map(s=><option key={s.id} value={s.id}>{s.name}{s.active?” ★”:””}</option>)}</select></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:10,marginBottom:10}}>
<div><Lbl>Project Owner</Lbl><input className=“inp” value={pF.owner||””} onChange={e=>setPF(p=>({…p,owner:e.target.value}))} placeholder=“Name or team”/></div>
<div><Lbl>Stage</Lbl><div style={{display:“flex”,gap:5,marginTop:2}}>{STAGE.map(s=><button key={s.v} onClick={()=>setPF(p=>({…p,stage:s.v}))} style={{flex:1,padding:“7px 4px”,borderRadius:7,border:`1.5px solid ${pF.stage===s.v?s.c+"66":"rgba(255,255,255,.1)"}`,background:pF.stage===s.v?s.c+“18”:“rgba(255,255,255,.04)”,color:pF.stage===s.v?s.c:“rgba(255,255,255,.35)”,fontSize:10,fontFamily:”‘DM Mono’,monospace”,lineHeight:1.3,minHeight:46,display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,gap:2}}><span style={{fontSize:14,fontWeight:700}}>{s.v}</span><span style={{fontSize:10,letterSpacing:”.04em”,textTransform:“uppercase”}}>{s.l}</span></button>)}</div></div>
</div>
<div style={{marginBottom:10}}><Lbl>Notes</Lbl><textarea className=“inp” value={pF.notes||””} onChange={e=>setPF(p=>({…p,notes:e.target.value}))} placeholder=“Context, background, constraints, or anything the team should know…” style={{minHeight:80,resize:“vertical”,lineHeight:1.6}}/></div>
<div style={{display:“grid”,gridTemplateColumns:“1fr 1fr 1fr”,gap:10,marginBottom:10}}><div><Lbl>Priority</Lbl><select className=“inp” value={pF.prio} onChange={e=>setPF(p=>({…p,prio:e.target.value}))}>{[“Critical”,“High”,“Medium”,“Low”].map(pr=><option key={pr}>{pr}</option>)}</select></div><div><Lbl>Deadline</Lbl><input className=“inp” type=“date” value={pF.due} onChange={e=>setPF(p=>({…p,due:e.target.value}))} style={{colorScheme:“dark”}}/></div><div><Lbl>Target FTEs</Lbl><input className=“inp” type=“number” inputMode=“decimal” min=“0” max=“20” step=“0.5” value={pF.fte||””} onChange={e=>setPF(p=>({…p,fte:Math.min(20,+e.target.value)}))} placeholder=“e.g. 2”/><span style={{fontSize:10,color:“var(–text3)”,marginTop:3,display:“block”}}>Planned headcount</span></div></div>
<div style={{marginBottom:14}}><Lbl>Project Type</Lbl><div style={{display:“flex”,gap:6,marginTop:2}}><button onClick={()=>setPF(p=>({…p,type:“full”}))} style={{flex:1,padding:“8px 10px”,borderRadius:8,border:`1.5px solid ${(pF.type||"full")==="full"?"rgba(var(--accent2-rgb),.5)":"var(--border2)"}`,background:(pF.type||“full”)===“full”?“rgba(var(–accent2-rgb),.1)”:“var(–surface1)”,color:(pF.type||“full”)===“full”?“var(–accent2)”:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,textAlign:“center”}}><div style={{fontWeight:600,marginBottom:2}}>Full Project</div><div style={{fontSize:10,opacity:.7}}>Tracks · Skills · Stage</div></button><button onClick={()=>setPF(p=>({…p,type:“side”}))} style={{flex:1,padding:“8px 10px”,borderRadius:8,border:`1.5px solid ${pF.type==="side"?"rgba(var(--accent-rgb),.5)":"var(--border2)"}`,background:pF.type===“side”?“rgba(var(–accent-rgb),.1)”:“var(–surface1)”,color:pF.type===“side”?“var(–accent)”:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,textAlign:“center”}}><div style={{fontWeight:600,marginBottom:2}}>◈ Side Project</div><div style={{fontSize:10,opacity:.7}}>Capacity hold · No tracks</div></button></div></div>
{(pF.type||“full”)===“full”&&<div style={{marginBottom:10}}><Lbl>Skill Requirements</Lbl><SREditor reqs={pF.sr} onChange={sr=>setPF(p=>({…p,sr}))} skills={skills}/></div>}
{(pF.type||“full”)===“full”&&<div style={{marginBottom:16}}><Lbl>Tracks</Lbl><FormTracksEditor tracks={pF.tracks||[]} onChange={tracks=>setPF(p=>({…p,tracks}))}/></div>}
<div style={{display:“flex”,gap:8,flexWrap:“wrap”}}><button className="btn-p" onClick={saveP}>Save</button><button className=“btn-g” onClick={()=>{setPF(null);setPId(null);setPE({});}}>Cancel</button></div>
</div>}
{scs.length===0?<Empty emoji=“🗂” title=“No scenarios” sub=“Create a scenario to group projects” onAct={()=>{setSF({…bS});setSId(null);setSE({});}} aLabel=“Add Scenario”/>:
<div style={{display:“grid”,gap:14}}>
{scs.map(s=>{const sP=projs.filter(p=>p.scId===s.id);const isExp=exp.includes(s.id);const ftes=sP.reduce((a,p)=>a+pFTE(p),0);
return <div key={s.id} style={{border:`1px solid ${s.color}25`,borderRadius:8,overflow:“hidden”}}>
<div style={{background:`linear-gradient(90deg,${s.color}0d,transparent)`,padding:“12px 14px”,borderBottom:“1px solid var(–border1)”,display:“flex”,alignItems:“center”,gap:10}}>
<span style={{width:10,height:10,borderRadius:“50%”,background:s.color,display:“inline-block”,flexShrink:0}}/>
<div style={{flex:1,minWidth:0}}>
<div style={{display:“flex”,alignItems:“center”,gap:8,flexWrap:“wrap”}}><span style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:800,fontSize:15}}>{s.name}</span>{s.active&&<span className=“badge badge-accent” style={{background:`${s.color}18`,borderColor:s.color,color:s.color}}>Active</span>}<FBadge n={ftes.toFixed(1)}/></div>
{s.desc&&<div style={{fontSize:12,color:“var(–text3)”,marginTop:3}}>{s.desc}</div>}
</div>
<div style={{display:“flex”,gap:2,flexShrink:0}}>
{!s.active&&<button className=“ib” onClick={()=>upsSc({…s,active:true})} title=“Set as active scenario” style={{fontSize:10,fontFamily:”‘DM Mono’,monospace”,color:“var(–accent)”,width:“auto”,padding:“0 7px”,letterSpacing:”.04em”}}>SET ACTIVE</button>}
<button className=“ib” onClick={()=>{setSF({…s});setSId(s.id);setSE({});}} title=“Edit”><EIcon/></button><button className=“ib ib-d” onClick={()=>delSc(s.id)} title=“Delete”><TIcon/></button><button className=“ib” onClick={()=>toggleExp(s.id)}><CIcon open={isExp}/></button>
</div>
</div>
<div className={isExp?“acc-body open”:“acc-body”}><div style={{padding:“10px 13px 13px”}}>
<div className=“mono” style={{fontSize:10,color:“var(–text3)”,padding:“2px 0 7px”,borderBottom:“1px solid var(–border1)”,display:“flex”,justifyContent:“space-between”,marginBottom:10}}><span>{sP.length} project{sP.length!==1?“s”:””}</span><span>{ftes.toFixed(1)} FTEs</span></div>
{sP.length===0&&<div className=“mono” style={{textAlign:“center”,padding:12,color:“var(–text4)”,fontSize:12}}>No projects</div>}
<div style={{display:“grid”,gap:10}}>
{sP.map(p=>{const disc=gDi(p.discId);const tbs=TRKST.reduce((acc,st)=>({…acc,[st.id]:(p.tracks||[]).filter(t=>t.status===st.id).length}),{});
return <div key={p.id} style={{background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:10,padding:“11px 12px”}}>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,gap:8}}>
<div style={{flex:1,minWidth:0}}>
<div style={{display:“flex”,alignItems:“flex-start”,gap:7,marginBottom:5}}><Dot prio={p.prio}/><div>
<div style={{display:“flex”,alignItems:“center”,gap:7}}><span style={{fontWeight:600,fontSize:14,lineHeight:1.2}}>{p.name}</span>{p.type===“side”&&<SideBadge/>}</div>
<div style={{display:“flex”,gap:5,flexWrap:“wrap”,marginTop:4,alignItems:“center”}}>{disc&&<DBadge disc={disc}/>}{(()=>{const actual=pFTE(p);const target=p.fte||0;return <FBadge n={actual.toFixed(1)} actual={actual} target={target}/>;})()}<span className=“mono” style={{fontSize:11,color:“var(–text3)”}}>{p.prio}{p.due?` · ${fd(p.due)}`:””}</span></div>
{(p.tracks||[]).length>0&&<div style={{display:“flex”,gap:5,flexWrap:“wrap”,marginTop:6}}>{TRKST.filter(st=>tbs[st.id]>0).map(st=><span key={st.id} className=“mono” style={{fontSize:10,padding:“2px 7px”,borderRadius:12,background:`${st.c}18`,border:`1px solid ${st.c}35`,color:st.c,textTransform:“uppercase”}}>{st.l} {tbs[st.id]}</span>)}</div>}
</div></div>
{p.type!==“side”&&Object.keys(p.sr||{}).length>0&&<div style={{display:“flex”,flexWrap:“wrap”,gap:5,marginTop:7}}>{Object.entries(p.sr).map(([sid,req])=>{const sk=gSk(sid);if(!sk)return null;return <div key={sid} style={{display:“flex”,alignItems:“center”,gap:4,background:`${sk.color}18`,border:`1.5px solid ${sk.color}`,borderRadius:7,padding:“3px 7px”}}><span className=“mono” style={{fontSize:10,color:sk.color,textTransform:“uppercase”}}>{sk.name}</span><Pips v={req} color={sk.color}/></div>;})}</div>}
{p.owner&&<div style={{display:“flex”,alignItems:“center”,gap:5,marginTop:6}}><span style={{fontSize:11,color:“var(–text2)”}}>{p.owner}</span><span className=“mono” style={{fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.05em”}}>owner</span></div>}
{p.notes&&<div style={{marginTop:6,fontSize:12,color:“var(–text3)”,lineHeight:1.55,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:7,padding:“6px 9px”}}>{p.notes}</div>}
</div>
<div style={{display:“flex”,alignItems:“center”,gap:3,flexShrink:0}}>
{p.type!==“side”&&<span className="mono" style={{fontSize:11,color:mc(p)>0?“var(–c-success)”:“var(–c-danger)”,marginRight:3}}>{mc(p)}✓</span>}
{p.type===“side”&&<button className=“ib” onClick={()=>upsPr({…p,type:“full”,tracks:[]})} title=“Promote to Full Project” style={{fontSize:10,fontFamily:”‘DM Mono’,monospace”,color:“rgba(167,139,250,.6)”,width:“auto”,padding:“0 7px”,letterSpacing:”.04em”}}>PROMOTE</button>}
{p.type!==“side”&&Object.keys(p.sr||{}).length>0&&<button className=“ib” onClick={()=>setRecPid(recPid===p.id?null:p.id)} title=“Recommend teammates” style={{color:recPid===p.id?”#a78bfa”:“rgba(255,255,255,.3)”}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M20 8l2 2-2 2"/></svg></button>}
<button className=“ib” onClick={()=>{setPF({…p,sr:{…p.sr},roster:[…(p.roster||[])],tracks:[…(p.tracks||[])]});setPId(p.id);setPE({});}} title=“Edit”><EIcon/></button>
<button className=“ib ib-d” onClick={()=>delPr(p.id)} title=“Delete”><TIcon/></button>
</div>
</div>
<RosterEditor project={p} team={twl} upsPr={upsPr} getMember={gMb}/>
{p.type!==“side”&&<TracksEditor project={p} team={twl} upsPr={upsPr}/>}
{recPid===p.id&&<RecommendPanel project={p} twl={twl} skills={skills} upsPr={upsPr} onClose={()=>setRecPid(null)}/>}
</div>;})}
</div>
<button onClick={()=>{setPF({…bP,scId:s.id});setPId(null);setPE({});}} style={{border:“1px dashed var(–border2)”,borderRadius:9,padding:9,background:“transparent”,color:“var(–text3)”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,letterSpacing:”.05em”,textTransform:“uppercase”,minHeight:38,width:“100%”,marginTop:10}}>+ Add Project</button>
</div></div>
</div>;})}
</div>}
</>}

  </div>;
}

function TimelineTab({twl,projs,scs,upsPr}){
const [editing,setEditing]=useState(null);
// Local static palette — CSS var strings can’t be used for hex alpha math
const TCOLS=[”#61afef”,”#98c379”,”#e5c07b”,”#c678dd”,”#e06c75”,”#56b6c2”,”#d19a66”];
const scenarioProjs=scs.map(s=>({s,ps:projs.filter(p=>p.scId===s.id)})).filter(({ps})=>ps.length>0);
const allD=projs.filter(p=>p.scId).flatMap(p=>(p.roster||[]).flatMap(r=>[r.start,r.end].filter(Boolean)));
const minD=allD.length?new Date(Math.min(…allD.map(d=>new Date(d+“T12:00:00”)))):new Date();
const maxD=allD.length?new Date(Math.max(…allD.map(d=>new Date(d+“T12:00:00”)))):new Date(Date.now()+90*86400000);
const span=Math.max((maxD-minD)/86400000,1);
const pX=d=>d?Math.max(0,Math.min(100,((new Date(d+“T12:00:00”)-minD)/86400000)/span*100)):null;
const pW=(s,e)=>{
if(!s&&!e)return 100; // no dates — full width placeholder
if(!s||!e)return Math.max(2,((new Date((e||s)+“T12:00:00”)-minD)/86400000)/span*100);
return Math.max(2,((new Date(e+“T12:00:00”)-new Date(s+“T12:00:00”))/86400000)/span*100);
};
const months=[];let cur=new Date(minD.getFullYear(),minD.getMonth(),1);
while(cur<=maxD){
const p=((cur-minD)/86400000)/span*100;
if(p>=0&&p<=100)months.push({label:cur.toLocaleDateString(“en-US”,{month:“short”,year:“2-digit”}),pct:p});
cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);
}
const todayPct=(()=>{const t=((new Date()-minD)/86400000)/span*100;return t>=0&&t<=100?t:null;})();

const updRoster=(proj,rosterId,field,val)=>{
upsPr({…proj,roster:(proj.roster||[]).map(r=>r.id===rosterId?{…r,[field]:val}:r)});
};

return <div>
<SHead title=“Timeline” sub={`${scs.length} scenarios · ${projs.filter(p=>p.scId).length} projects`}/>
{scenarioProjs.length===0?<Empty emoji="📅" title="No projects" sub="Add projects to a scenario to see them here"/>:
<div style={{display:“grid”,gap:24}}>
<div style={{overflowX:“auto”}}>
<div style={{minWidth:520}}>
{/* Month axis */}
<div style={{position:“relative”,height:20,marginLeft:140,marginBottom:4,borderBottom:“1px solid var(–border1)”}}>
{months.map((m,i)=><span key={i} className=“mono” style={{position:“absolute”,left:`${m.pct}%`,fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”,whiteSpace:“nowrap”,transform:“translateX(-2px)”}}>{m.label}</span>)}
{todayPct!==null&&<span className=“mono” style={{position:“absolute”,left:`${todayPct}%`,fontSize:9,color:“var(–c-primary)”,transform:“translateX(-50%)”,whiteSpace:“nowrap”,bottom:2,fontWeight:600,letterSpacing:”.04em”}}>TODAY</span>}
</div>
{/* Scenario sections */}
{scenarioProjs.map(({s,ps})=>{
const membersInScenario=twl.filter(m=>ps.some(p=>(p.roster||[]).some(r=>r.mId===m.id)));
return <div key={s.id} style={{marginBottom:24}}>
{/* Scenario label */}
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:10,paddingBottom:6,borderBottom:“1px solid var(–border1)”}}>
<span style={{width:8,height:8,borderRadius:“50%”,background:s.color,display:“inline-block”,flexShrink:0}}/>
<span style={{fontWeight:600,fontSize:13,color:“var(–text1)”}}>{s.name}</span>
{s.active&&<span className="badge badge-sm badge-accent">Active</span>}
<span className=“mono” style={{fontSize:10,color:“var(–text3)”}}>{ps.length} project{ps.length!==1?“s”:””}</span>
</div>
{/* Member rows — one row per project assignment */}
{membersInScenario.map(m=>{
const entries=ps.flatMap(p=>(p.roster||[]).filter(r=>r.mId===m.id).map(r=>({…r,proj:p})));
if(!entries.length)return null;
const tot=entries.reduce((a,r)=>a+r.alloc,0);
const over=tot>m.cap;
return <div key={m.id} style={{marginBottom:10}}>
{/* Member name + alloc summary — spans full width */}
<div style={{display:“flex”,alignItems:“baseline”,gap:8,marginBottom:4,paddingLeft:0}}>
<span style={{fontWeight:600,fontSize:12,color:“var(–text1)”}}>{m.name}</span>
<span className=“mono” style={{fontSize:10,color:over?“var(–c-danger)”:“var(–text3)”}}>{tot}%{over?” ⚠”:””}</span>
</div>
{/* One track row per project entry */}
{entries.map(e=>{
const col=TCOLS[ps.indexOf(e.proj)%TCOLS.length];
const left=pX(e.start)??0;
const width=pW(e.start,e.end);
const isEditing=editing?.rosterId===e.id;
const noDates=!e.start&&!e.end;
return <div key={e.id} style={{marginBottom:3}}>
<div style={{display:“flex”,alignItems:“center”}}>
{/* Row indent to align with grid */}
<div style={{width:140,flexShrink:0,paddingRight:10,paddingLeft:8}}>
<span className=“mono” style={{fontSize:10,color:col,overflow:“hidden”,textOverflow:“ellipsis”,whiteSpace:“nowrap”,display:“block”}}>{e.proj.name}</span>
</div>
{/* Single-project bar track */}
<div style={{flex:1,position:“relative”,height:22,background:“var(–surface-hover)”,borderRadius:3,overflow:“hidden”}}>
{months.map((mo,i)=><div key={i} style={{position:“absolute”,top:0,bottom:0,left:`${mo.pct}%`,width:1,background:“var(–border1)”,pointerEvents:“none”}}/>)}
{todayPct!==null&&<div style={{position:“absolute”,top:0,bottom:0,left:`${todayPct}%`,width:1.5,background:“var(–c-primary)”,zIndex:3,pointerEvents:“none”}}/>}
<div
onClick={()=>setEditing(isEditing?null:{rosterId:e.id,projId:e.proj.id})}
title={`${e.proj.name} · ${e.alloc}%${noDates?" · No dates set":""}`}
style={{
position:“absolute”,top:2,height:“calc(100% - 4px)”,
left:`${left}%`,width:`${Math.max(width,2)}%`,
background:isEditing?col+“55”:col+“28”,
border:`1.5px solid ${isEditing?col:col+"90"}`,
borderRadius:3,
display:“flex”,alignItems:“center”,padding:“0 6px”,
fontSize:10,fontFamily:”‘DM Mono’,monospace”,
color:col,whiteSpace:“nowrap”,overflow:“hidden”,
cursor:“pointer”,zIndex:1,
opacity:noDates?.45:1,
transition:“background .12s,border-color .12s”,
}}
>
{width>6?`${e.alloc}%`:””}
</div>
</div>
</div>
{/* Inline editor */}
{isEditing&&(()=>{
const proj=ps.find(p=>p.id===e.proj.id);
if(!proj)return null;
return <div style={{marginLeft:140,marginTop:3,marginBottom:4,background:“var(–surface-card)”,border:`1px solid var(--border2)`,borderLeft:`2px solid ${col}`,borderRadius:“0 6px 6px 0”,padding:“10px 12px”}}>
<div style={{fontSize:11,fontWeight:600,color:“var(–text1)”,marginBottom:8,fontFamily:”‘DM Mono’,monospace”,textTransform:“uppercase”,letterSpacing:”.05em”}}>{proj.name} — {e.role||“No role”}</div>
<div style={{display:“flex”,gap:10,alignItems:“flex-end”,flexWrap:“wrap”}}>
<div><span className="lbl">Role</span><input value={e.role||””} onChange={ev=>updRoster(proj,e.id,“role”,ev.target.value)} className=“inp” style={{width:130,padding:“5px 8px”,fontSize:12}}/></div>
<div><span className="lbl">Alloc %</span><input type=“number” inputMode=“numeric” min=“1” max=“100” value={e.alloc} onChange={ev=>updRoster(proj,e.id,“alloc”,+ev.target.value)} className=“inp” style={{width:70,padding:“5px 8px”,fontSize:12,fontFamily:”‘DM Mono’,monospace”}}/></div>
<div><span className="lbl">Start</span><input type=“date” value={e.start||””} onChange={ev=>updRoster(proj,e.id,“start”,ev.target.value)} className=“inp” style={{fontSize:12,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/></div>
<div><span className="lbl">End</span><input type=“date” value={e.end||””} onChange={ev=>updRoster(proj,e.id,“end”,ev.target.value)} className=“inp” style={{fontSize:12,fontFamily:”‘DM Mono’,monospace”,colorScheme:“dark”}}/></div>
<button onClick={()=>setEditing(null)} className=“btn-g btn-sm”>Done</button>
</div>
</div>;
})()}
</div>;
})}
</div>;
})}
{/* Project legend */}
<div style={{display:“flex”,flexWrap:“wrap”,gap:10,marginTop:8,paddingLeft:140}}>
{ps.map((p,i)=><div key={p.id} style={{display:“flex”,alignItems:“center”,gap:5}}>
<span style={{width:8,height:8,borderRadius:2,background:TCOLS[i%TCOLS.length],display:“inline-block”,flexShrink:0}}/>
<span style={{fontSize:11,color:“var(–text2)”}}>{p.name}</span>
</div>)}
</div>
</div>;
})}
</div>
</div>
</div>}

  </div>;
}

function GrowthTab({gaps,twl,gSk}){
const [view,setView]=useState(“gaps”);
const byPerson=gaps.length?[…new Set(gaps.map(g=>g.mId))].map(id=>{const m=twl.find(x=>x.id===id);if(!m)return null;const mg=gaps.filter(g=>g.mId===id);return{m,gaps:mg,priGaps:mg.filter(g=>g.prio===“Critical”||g.prio===“High”).length};}).filter(Boolean).sort((a,b)=>b.priGaps-a.priGaps||b.gaps.length-a.gaps.length):[];
const bySkill=gaps.length?[…new Set(gaps.map(g=>g.sid))].map(sid=>{const sg=gaps.filter(g=>g.sid===sid);const sk=gSk(sid);return{sk,gaps:sg,count:new Set(sg.map(g=>g.mId)).size};}).sort((a,b)=>b.count-a.count):[];
return <div>
<SHead title=“Growth & Training” sub={gaps.length?`${gaps.length} gaps · ${byPerson.length} members`:“Skill gap analysis”}/>
{gaps.length===0&&<div style={{textAlign:“center”,padding:“32px 20px”,background:“var(–surface-card)”,border:“1px dashed var(–border2)”,borderRadius:8}}>
<div style={{fontSize:28,marginBottom:10}}>🎉</div>
<div style={{fontWeight:600,fontSize:14,marginBottom:5}}>No skill gaps detected</div>
<div style={{fontSize:13,color:“var(–text3)”,marginBottom:14,lineHeight:1.6,maxWidth:320,margin:“0 auto 14px”}}>Everyone on the active scenario meets the proficiency requirements for their assigned projects. Gaps appear when a project requires a skill level higher than a team member currently has.</div>
<div style={{display:“flex”,gap:8,justifyContent:“center”,flexWrap:“wrap”}}><span style={{fontSize:11,fontFamily:”‘DM Mono’,monospace”,padding:“4px 10px”,borderRadius:12,background:“rgba(0,229,160,.08)”,border:“1px solid rgba(0,229,160,.2)”,color:“rgba(0,229,160,.7)”}}>Set skill requirements on projects →</span></div>
</div>}
{gaps.length>0&&<React.Fragment>
<div style={{display:“flex”,gap:7,marginBottom:18,flexWrap:“wrap”}}>{[{id:“gaps”,l:“All Gaps”},{id:“person”,l:“By Person”},{id:“skill”,l:“By Skill”}].map(v=><button key={v.id} className={view===v.id?“vpill on”:“vpill”} onClick={()=>setView(v.id)}>{v.l}</button>)}</div>
{view===“gaps”&&<div style={{display:“grid”,gap:9}}>{gaps.map((g,i)=>{const sk=gSk(g.sid);return <div key={i} className=“card” style={{padding:“12px 14px”,borderLeft:`3px solid ${PC[g.prio]||"#888"}`,borderRadius:“0 12px 12px 0”}}>
<div style={{display:“flex”,justifyContent:“space-between”,gap:10,flexWrap:“wrap”}}>
<div style={{flex:1,minWidth:180}}>
<div style={{display:“flex”,alignItems:“center”,gap:8,marginBottom:6}}><div className="avatar" style={{width:26,height:26,borderRadius:7,fontSize:10,flexShrink:0}}>{ini(g.mName)}</div><div><div style={{fontWeight:600,fontSize:13}}>{g.mName}</div><div className=“mono” style={{fontSize:11,color:“var(–text3)”}}>→ {g.pName}</div></div></div>
<div style={{display:“flex”,alignItems:“center”,gap:8,flexWrap:“wrap”}}>{sk&&<span className=“mono” style={{fontSize:11,color:sk.color,background:`${sk.color}18`,border:`1.5px solid ${sk.color}`,padding:“3px 8px”,borderRadius:6,textTransform:“uppercase”}}>{sk.name}</span>}<PBadge v={g.cur} sm/><span style={{color:“var(–text3)”}}>→</span><PBadge v={g.req} sm/><span className="badge badge-sm badge-warn">+{g.delta}</span></div>
<div style={{marginTop:9,display:“flex”,gap:3}}>{PROF.map(p=><span key={p.v} style={{flex:1,height:5,borderRadius:2,display:“inline-block”,background:p.v<=g.cur?sk?.color||“var(–accent)”:p.v<=g.req?“rgba(251,146,60,.35)”:“var(–border2)”}}/>)}</div>
</div>
<span className=“mono” style={{fontSize:10,padding:“3px 8px”,borderRadius:5,background:`${PC[g.prio]||"#888"}18`,border:`1px solid ${PC[g.prio]||"#888"}35`,color:PC[g.prio]||”#888”,textTransform:“uppercase”,flexShrink:0,alignSelf:“flex-start”}}>{g.prio}</span>
</div>
</div>;})}
</div>}
{view===“person”&&<div style={{display:“grid”,gap:11}}>{byPerson.map(bp=><div key={bp.m.id} className="card" style={{padding:14}}>
<div style={{display:“flex”,alignItems:“center”,gap:10,marginBottom:10}}><div className="avatar" style={{width:36,height:36,fontSize:12,flexShrink:0}}>{bp.m.avatar}</div><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{bp.m.name}</div><div className=“mono” style={{fontSize:11,color:“var(–text2)”,marginTop:2}}>{bp.m.role}</div></div><div style={{textAlign:“right”}}><div className=“mono” style={{fontSize:18,fontWeight:500,color:”#fb923c”}}>{bp.gaps.length}</div><div className=“mono” style={{fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”}}>gaps</div></div></div>
<div style={{display:“grid”,gap:5}}>{bp.gaps.map((g,j)=>{const sk=gSk(g.sid);return <div key={j} style={{display:“flex”,alignItems:“center”,gap:7,padding:“6px 9px”,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:8,flexWrap:“wrap”}}>{sk&&<span className=“mono” style={{fontSize:10,color:sk.color,background:`${sk.color}15`,border:`1px solid ${sk.color}28`,padding:“2px 7px”,borderRadius:5,textTransform:“uppercase”,whiteSpace:“nowrap”}}>{sk.name}</span>}<div style={{display:“flex”,alignItems:“center”,gap:5,flex:1}}><Pips v={g.cur} color={sk?.color||”#888”}/><span style={{color:“var(–text3)”}}>→</span><Pips v={g.req} color="#fb923c"/></div><span className=“mono” style={{fontSize:10,color:“var(–text3)”,whiteSpace:“nowrap”}}>{g.pName}</span></div>;})}
</div>
{bp.priGaps>0&&<div className=“badge badge-warn” style={{width:“100%”,marginTop:8,padding:“8px 10px”,borderRadius:8,fontSize:11,justifyContent:“flex-start”}}>⚡ {bp.priGaps} high-priority gap{bp.priGaps!==1?“s”:””}</div>}
</div>)}</div>}
{view===“skill”&&<div style={{display:“grid”,gap:11}}>{bySkill.map(bs=><div key={bs.sk?.id||“u”} className=“card” style={{padding:14}}>
<div style={{display:“flex”,alignItems:“center”,gap:10,marginBottom:10}}><span style={{width:10,height:36,borderRadius:3,background:bs.sk?.color||”#888”,display:“inline-block”,flexShrink:0}}/><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{bs.sk?.name||“Unknown”}</div><div className=“mono” style={{fontSize:11,color:“var(–text2)”,marginTop:2,textTransform:“uppercase”,letterSpacing:”.05em”}}>{bs.sk?.cat}</div></div><div style={{textAlign:“right”}}><div className=“mono” style={{fontSize:18,fontWeight:500,color:bs.sk?.color||”#888”}}>{bs.count}</div><div className=“mono” style={{fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”}}>affected</div></div></div>
<div style={{display:“flex”,flexWrap:“wrap”,gap:6,marginBottom:9}}>{bs.gaps.map((g,j)=><div key={j} style={{display:“flex”,alignItems:“center”,gap:5,padding:“5px 8px”,background:“var(–surface-card)”,border:“1px solid var(–border1)”,borderRadius:8}}><span style={{fontSize:12,fontWeight:500}}>{g.mName.split(” “)[0]}</span><PBadge v={g.cur} sm/><span style={{color:“var(–text3)”}}>→</span><PBadge v={g.req} sm/></div>)}</div>
<div style={{padding:“8px 10px”,background:“var(–surface-card)”,borderRadius:8,border:“1px solid var(–border1)”,fontSize:12,color:“var(–text2)”,lineHeight:1.5}}>💡 A shared <strong style={{color:“var(–text1)”}}>{bs.sk?.name}</strong> workshop addresses {bs.count} member{bs.count!==1?“s”:””} — highest ROI.</div>
</div>)}</div>}
</React.Fragment>}

  </div>;
}

function ReportsTab({twl,projs,scs,discs,gaps,gSk,gDi,goTab}){
const asc=scs.find(s=>s.active);const ap=asc?projs.filter(p=>p.scId===asc.id):[];
const totFTE=ap.reduce((a,p)=>a+pFTE(p),0);const totTarget=ap.reduce((a,p)=>a+(p.fte||0),0);
const uData=twl.map(m=>({name:m.name,pct:Math.round(m.load/m.cap*100),id:m.id}));
const gData=twl.map(m=>({name:m.name,n:gaps.filter(g=>g.mId===m.id).length,id:m.id})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
const dData=discs.map(d=>({name:d.name,n:twl.filter(m=>m.discId===d.id).length,color:d.color})).filter(x=>x.n>0);
const tSt=TRKST.map(s=>({…s,n:ap.flatMap(p=>p.tracks||[]).filter(t=>t.status===s.id).length})).filter(x=>x.n>0);
const maxG=Math.max(…gData.map(x=>x.n),1);
const handlePrint=()=>{const kpis=[{l:“Team”,v:twl.length,s:`${twl.filter(m=>m.cap-m.load>0).length} avail`},{l:“FTEs”,v:totFTE.toFixed(1),s:“staffed”},{l:“Target”,v:totTarget>0?totTarget.toFixed(1):”—”,s:“planned FTEs”},{l:“Gaps”,v:gaps.length,s:“training needed”}];const html=`<h1>FLUX Report</h1><p class="sub">${asc?.name||"All"} · ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p><div class="kg">${kpis.map(k=>`<div class="kc"><div class="kv">${k.v}</div><div class="kl">${k.l}</div><div class="ks">${k.s}</div></div>`).join("")}</div><div class="sec"><h2>Team Utilization</h2>${uData.map(d=>`<div class="br"><div class="bt"><span>${d.name}</span><span>${d.pct}%</span></div><div class="bk"><div class=“bf” style=“width:${d.pct}%;background:${d.pct>=90?”#ef4444”:d.pct>=70?”#f59e0b”:”#10b981”}”></div></div></div>`).join("")}</div>${gData.length?`<div class="sec"><h2>Gaps</h2>${gData.map(d=>`<div class="br"><div class="bt"><span>${d.name}</span><span>${d.n}</span></div><div class="bk"><div class="bf" style="width:${Math.round(d.n/maxG*100)}%;background:#f97316"></div></div></div>`).join(””)}</div>`:""}<div class="sec"><h2>Projects</h2><table><thead><tr><th>Project</th><th>Priority</th><th>FTEs</th><th>Target</th><th>Tracks</th><th>Due</th></tr></thead><tbody>${ap.map(p=>`<tr><td>${p.name}</td><td><span class=“bdg” style=“background:${PC[p.prio]||”#888”}20;color:${PC[p.prio]||”#888”}”>${p.prio}</span></td><td>${pFTE(p).toFixed(1)}</td><td>${p.fte||”—”}</td><td>${(p.tracks||[]).length}</td><td>${p.due?fd(p.due):”—”}</td></tr>`).join("")}</tbody></table></div>`;doPrint(html);};
const RC=({title,target,link,children})=><div className="card" style={{padding:18,marginBottom:12}}><div style={{display:“flex”,justifyContent:“space-between”,alignItems:“center”,marginBottom:13}}><span style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontSize:15,fontWeight:700}}>{title}</span><button onClick={()=>goTab(target)} style={{background:“transparent”,border:“none”,fontSize:11,fontFamily:”‘DM Mono’,monospace”,color:“rgba(0,229,160,.7)”,letterSpacing:”.06em”,textTransform:“uppercase”}}>{link} →</button></div>{children}</div>;
return <div>
<div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:18}}><div><h2 style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontSize:21,fontWeight:800,lineHeight:1.1}}>Reports</h2><p style={{fontSize:13,color:“var(–text3)”,marginTop:4}}>{asc?.name||“All”} · {new Date().toLocaleDateString(“en-US”,{month:“long”,year:“numeric”})}</p></div><button className=“btn-g” onClick={handlePrint} style={{display:“flex”,alignItems:“center”,gap:7}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print</button></div>
<div style={{display:“grid”,gridTemplateColumns:“repeat(2,1fr)”,gap:9,marginBottom:16}}>
{[{emoji:“👥”,value:twl.length,label:“Team Size”,sub:`${twl.filter(m=>m.cap-m.load>0).length} available`,target:“team”},{emoji:“📊”,value:totFTE.toFixed(1),label:“Active FTEs”,sub:totTarget>0?`of ${totTarget.toFixed(1)} target`:“staffed”,target:“scenarios”,warn:totTarget>0&&totFTE<totTarget*0.8},{emoji:“⚡”,value:gaps.length,label:“Training Gaps”,sub:“need attention”,target:“growth”,warn:gaps.length>0},{emoji:“🎯”,value:totTarget>0?`${Math.round(totFTE/totTarget*100)}%`:”—”,label:“FTE Coverage”,sub:totTarget>0?`${totFTE.toFixed(1)} of ${totTarget} FTEs`:“no targets set”,target:“scenarios”,warn:totTarget>0&&totFTE<totTarget*0.8}].map(c=><div key={c.label} className=“card” onClick={()=>goTab(c.target)} style={{padding:“13px 15px”,cursor:“pointer”,borderColor:c.warn?“rgba(251,146,60,.25)”:“var(–border1)”}}><div style={{display:“flex”,justifyContent:“space-between”,alignItems:“flex-start”,marginBottom:5}}><div className=“mono” style={{fontSize:20,fontWeight:500,color:c.warn?”#fb923c”:“var(–text1)”}}>{c.value}</div><span style={{fontSize:17,opacity:.7}}>{c.emoji}</span></div><div className=“mono” style={{fontSize:10,color:“var(–text3)”,textTransform:“uppercase”,letterSpacing:”.06em”}}>{c.label}</div><div style={{fontSize:12,color:c.warn?”#fb923c”:“var(–accent)”,marginTop:3}}>{c.sub}</div><div className=“mono” style={{fontSize:10,color:“var(–text3)”,marginTop:6}}>View {c.target} →</div></div>)}
</div>
<RC title="Team Utilization" target="team" link="View Team"><div style={{display:“grid”,gap:9}}>{uData.map(d=><div key={d.id} onClick={()=>goTab(“team”)} style={{cursor:“pointer”}}><div style={{display:“flex”,justifyContent:“space-between”,marginBottom:4}}><span style={{fontSize:13,fontWeight:500}}>{d.name}</span><span className="mono" style={{fontSize:12,color:d.pct>=90?“var(–c-danger)”:d.pct>=70?“var(–c-warning)”:“var(–c-success)”}}>{d.pct}%</span></div><div style={{background:“var(–surface-card)”,borderRadius:99,height:6,overflow:“hidden”}}><div style={{width:`${d.pct}%`,height:“100%”,borderRadius:99,background:d.pct>=90?“var(–c-danger)”:d.pct>=70?“var(–c-warning)”:“var(–c-success)”,transition:“width .5s”}}/></div></div>)}</div></RC>
{tSt.length>0&&<RC title="Track Status" target="scenarios" link="View Scenarios"><div style={{display:“flex”,flexWrap:“wrap”,gap:9}}>{tSt.map(s=><div key={s.id} onClick={()=>goTab(“scenarios”)} style={{flex:“1 1 110px”,background:`${s.c}09`,border:`1px solid ${s.c}28`,borderRadius:10,padding:“11px 13px”,cursor:“pointer”}}><div className="mono" style={{fontSize:22,fontWeight:500,color:s.c}}>{s.n}</div><TkBadge status={s.id}/></div>)}</div></RC>}
{gData.length>0&&<RC title="Training Gaps" target="growth" link="View Growth"><div style={{display:“grid”,gap:9}}>{gData.map(d=><div key={d.id} onClick={()=>goTab(“growth”)} style={{cursor:“pointer”}}><div style={{display:“flex”,justifyContent:“space-between”,marginBottom:4}}><span style={{fontSize:13,fontWeight:500}}>{d.name}</span><span className=“mono” style={{fontSize:12,color:”#fb923c”}}>{d.n} gap{d.n!==1?“s”:””}</span></div><div style={{background:“var(–surface-card)”,borderRadius:99,height:6,overflow:“hidden”}}><div style={{width:`${Math.round(d.n/maxG*100)}%`,height:“100%”,borderRadius:99,background:”#fb923c”,transition:“width .5s”}}/></div></div>)}</div></RC>}
{dData.length>0&&<RC title="Team by Discipline" target="team" link="View Team"><div style={{display:“flex”,gap:9,flexWrap:“wrap”}}>{dData.map(d=><div key={d.name} onClick={()=>goTab(“team”)} style={{flex:“1 1 110px”,background:`${d.color}10`,border:`1px solid ${d.color}28`,borderRadius:10,padding:“11px 13px”,cursor:“pointer”}}><div className="mono" style={{fontSize:22,fontWeight:500,color:d.color}}>{d.n}</div><div style={{fontSize:11,color:“var(–text2)”,marginTop:3}}>{d.name}</div><div style={{height:3,borderRadius:2,background:d.color,marginTop:8}}/></div>)}</div></RC>}
<RC title="Project Summary" target="scenarios" link="View Scenarios"><div style={{overflowX:“auto”}}><table style={{width:“100%”,borderCollapse:“collapse”,fontSize:12}}><thead><tr style={{borderBottom:“1px solid var(–border2)”}}>{[“Project”,“Priority”,“FTEs”,“Target”,“Tracks”,“Due”].map(h=><th key={h} className=“mono” style={{padding:“5px 9px”,textAlign:“left”,fontSize:10,color:“var(–text2)”,textTransform:“uppercase”,letterSpacing:”.08em”,whiteSpace:“nowrap”}}>{h}</th>)}</tr></thead><tbody>{ap.map(p=>{const actual=pFTE(p);const target=p.fte||0;const bl=(p.tracks||[]).filter(t=>t.status===“blocked”).length;const over=target>0&&actual>target;const under=target>0&&actual<target;return <tr key={p.id} onClick={()=>goTab(“scenarios”)} style={{borderBottom:“1px solid var(–border1)”,cursor:“pointer”}} onMouseEnter={e=>e.currentTarget.style.background=“var(–surface-hover)”} onMouseLeave={e=>e.currentTarget.style.background=“transparent”}><td style={{padding:“7px 9px”,fontWeight:500}}>{p.name}</td><td style={{padding:“7px 9px”}}><span className=“badge badge-sm” style={{background:`${PC[p.prio]||"#888"}20`,border:`1.5px solid ${PC[p.prio]||"#888"}`,color:PC[p.prio]||”#888”}}>{p.prio}</span></td><td className=“mono” style={{padding:“7px 9px”,color:over?”#ff6666”:under?”#fb923c”:“var(–accent)”}}>{actual.toFixed(1)}</td><td className=“mono” style={{padding:“7px 9px”,color:“var(–text2)”}}>{target||”—”}</td><td style={{padding:“7px 9px”,color:bl>0?”#ff4444”:“var(–text2)”}}>{(p.tracks||[]).length}{bl>0?` (${bl} blocked)`:””}</td><td className=“mono” style={{padding:“7px 9px”,fontSize:11,color:“var(–text2)”}}>{p.due?fd(p.due):”—”}</td></tr>;})}</tbody></table></div></RC>

  </div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME — Command Center
// ═════════════════════════════════════════════════════════════════════════════

function HomeTab({twl,scs,projs,gaps,upsPr,goTab,setPlanView}){
const asc=scs.find(s=>s.active);
// Scope everything to the active scenario — warnings about stretch/hypothetical
// scenarios on the home page created noise and false alarms
const ap=asc?projs.filter(p=>p.scId===asc.id&&p.type!==“side”):[];
// Recompute member load against ONLY the active scenario’s projects so warnings
// reflect current reality, not aggregated load across every planning variant
const scopedTwl=twl.map(m=>({…m,load:mLoad(m.id,ap)}));
// Scope skill gaps to active scenario projects as well
const scopedGaps=asc?gaps.filter(g=>ap.find(p=>p.id===g.pid)):[];
const [dragMid,setDragMid]=useState(null);
const [dropPid,setDropPid]=useState(null);
const [lastDrop,setLastDrop]=useState(null);

const dropProjs=ap
.slice().sort((a,b)=>[“Critical”,“High”,“Medium”,“Low”].indexOf(a.prio)-[“Critical”,“High”,“Medium”,“Low”].indexOf(b.prio))
.slice(0,6);

const onDrop=(p)=>{
if(!dragMid)return;
const existing=(p.roster||[]).find(r=>r.mId===dragMid);
const updated=existing
?{…p,roster:(p.roster||[]).map(r=>r.mId===dragMid?{…r,alloc:Math.min(r.alloc+10,100)}:r)}
:{…p,roster:[…(p.roster||[]),{id:uid(),mId:dragMid,alloc:50,role:””,start:””,end:””}]};
upsPr(updated);
setLastDrop({mId:dragMid,pId:p.id});
setTimeout(()=>setLastDrop(null),1200);
setDragMid(null);setDropPid(null);
};

// ── Next Best Action engine (scoped to active scenario) ───────────────────
const nba=(()=>{
if(!asc)return null; // no scenario — handled by dedicated empty state below
// 1. Over-capacity member — find the project with highest alloc and see if
//    an available member could take some of that load
const overM=scopedTwl.filter(m=>m.load>m.cap).sort((a,b)=>(b.load-b.cap)-(a.load-a.cap));
if(overM.length){
const m=overM[0];
const excess=m.load-m.cap;
const heaviestEntry=ap
.flatMap(p=>(p.roster||[]).filter(r=>r.mId===m.id).map(r=>({r,p})))
.sort((a,b)=>b.r.alloc-a.r.alloc)[0];
const freeM=heaviestEntry&&scopedTwl
.filter(x=>x.id!==m.id&&(x.cap-x.load)>=20&&!(heaviestEntry.p.roster||[]).some(r=>r.mId===x.id))
.sort((a,b)=>(b.cap-b.load)-(a.cap-a.load))[0];
if(heaviestEntry&&freeM){
return {
action:`Move some of ${m.name.split(" ")[0]}'s ${heaviestEntry.p.name} work to ${freeM.name.split(" ")[0]}`,
who:`${m.name} is ${excess}% over · ${freeM.name} has ${freeM.cap-freeM.load}% free`,
why:`Reduces ${m.name.split(" ")[0]}'s overcapacity and keeps ${heaviestEntry.p.name} on track`,
sev:“critical”,onAct:()=>goTab(“team”)
};
}
if(heaviestEntry){
return {
action:`Reduce ${m.name.split(" ")[0]}'s allocation on ${heaviestEntry.p.name}`,
who:`${m.name} is carrying ${m.load}% against a ${m.cap}% capacity`,
why:`Removes ${excess}% overcapacity before it causes burnout or slippage`,
sev:“critical”,onAct:()=>goTab(“team”)
};
}
}

```
// 2. High-priority project with no roster
const unstaffed=ap
  .filter(p=>(p.roster||[]).length===0)
  .sort((a,b)=>["Critical","High","Medium","Low"].indexOf(a.prio)-["Critical","High","Medium","Low"].indexOf(b.prio))[0];
if(unstaffed){
  const freeM=scopedTwl.filter(m=>m.cap-m.load>=20).sort((a,b)=>(b.cap-b.load)-(a.cap-a.load))[0];
  return {
    action:`Staff ${unstaffed.name}${freeM?` — start with ${freeM.name.split(" ")[0]}`:""}`,
    who:freeM?`${freeM.name} has ${freeM.cap-freeM.load}% capacity available`:`No one assigned to a ${unstaffed.prio.toLowerCase()} priority project`,
    why:`${unstaffed.prio} priority project has zero coverage`,
    sev:"high",onAct:()=>{setPlanView("projects");goTab("plan");}
  };
}

// 3. Under-FTE project with available capacity somewhere
const underFTE=ap
  .filter(p=>{const t=p.fte||0;return t>0&&pFTE(p)<t*.7;})
  .sort((a,b)=>["Critical","High","Medium","Low"].indexOf(a.prio)-["Critical","High","Medium","Low"].indexOf(b.prio))[0];
if(underFTE){
  const needed=((underFTE.fte||0)-pFTE(underFTE)).toFixed(1);
  const freeM=scopedTwl.filter(m=>m.cap-m.load>=20&&!(underFTE.roster||[]).some(r=>r.mId===m.id)).sort((a,b)=>(b.cap-b.load)-(a.cap-a.load))[0];
  return {
    action:`Add ${freeM?freeM.name.split(" ")[0]+" to":"headcount to"} ${underFTE.name}`,
    who:freeM?`${freeM.name} has ${freeM.cap-freeM.load}% free and isn't on this project`:`${underFTE.name} needs ~${needed} more FTE`,
    why:`Project is ${needed} FTE short of target — risking delivery`,
    sev:"high",onAct:()=>{setPlanView("projects");goTab("plan");}
  };
}

// 4. Critical skill gap — most urgent by delta (scoped)
const cg=scopedGaps.filter(g=>g.prio==="Critical").sort((a,b)=>b.delta-a.delta)[0];
if(cg){
  return {
    action:`Upskill ${cg.mName.split(" ")[0]} in ${cg.sName} before ${cg.pName} progresses`,
    who:`${cg.mName} is at level ${cg.cur} · project requires level ${cg.req}`,
    why:`Critical skill gap of +${cg.delta} blocks delivery on ${cg.pName}`,
    sev:"medium",onAct:()=>goTab("analyze")
  };
}

// 5. Blocked track on highest-priority project
const blocked=ap
  .flatMap(p=>(p.tracks||[]).filter(t=>t.status==="blocked").map(t=>({t,p})))
  .sort((a,b)=>["Critical","High","Medium","Low"].indexOf(a.p.prio)-["Critical","High","Medium","Low"].indexOf(b.p.prio))[0];
if(blocked){
  const owner=blocked.t.ownId?scopedTwl.find(m=>m.id===blocked.t.ownId):null;
  return {
    action:`Unblock the "${blocked.t.name}" track on ${blocked.p.name}`,
    who:owner?`${owner.name} owns this track`:`No owner assigned to this track`,
    why:`Blocked track is holding up a ${blocked.p.prio.toLowerCase()} priority project`,
    sev:"medium",onAct:()=>{setPlanView("projects");goTab("plan");}
  };
}

// 6. Backlog projects sitting unassigned
const backlogCount=projs.filter(p=>!p.scId).length;
if(backlogCount){
  return {
    action:`Triage ${backlogCount} backlog project${backlogCount>1?"s":""} into ${asc.name}`,
    who:"Unassigned projects aren't visible in planning or capacity views",
    why:"Backlog work is hidden from FTE and gap analysis",
    sev:"low",onAct:()=>{setPlanView("projects");goTab("plan");}
  };
}

return null;
```

})();

const sevStyle={
critical:{border:“var(–c-danger)”, accent:“var(–c-danger)”, label:“Critical”},
high:    {border:“var(–c-warning)”,accent:“var(–c-warning)”,label:“High”},
medium:  {border:“var(–c-warning)”,accent:“var(–c-warning)”,label:“Medium”},
low:     {border:“var(–c-info)”,   accent:“var(–c-info)”,   label:“Low”},
};

// ── Banner engine (scoped to active scenario) ─────────────────────────────
const banners=[];

if(asc){
// Over-allocated members (scoped)
const over=scopedTwl.filter(m=>m.load>m.cap);
if(over.length){
banners.push({
id:“overalloc”,sev:0,
color:“var(–c-danger)”,
icon:“⚠”,
title:`${over.length} member${over.length>1?"s are":" is"} over capacity`,
body:over.map(m=>`${m.name.split(" ")[0]} ${m.load-m.cap}% over`).join(” · “),
action:“Rebalance”,
onAct:()=>{goTab(“team”);}
});
}

```
// Projects with no roster (scoped)
const unstaffed=ap.filter(p=>(p.roster||[]).length===0&&p.prio!=="Low");
if(unstaffed.length){
  banners.push({
    id:"unstaffed",sev:1,
    color:"var(--c-warning)",
    icon:"◎",
    title:`${unstaffed.length} project${unstaffed.length>1?"s":""} ${unstaffed.length>1?"have":"has"} no assigned team`,
    body:unstaffed.map(p=>p.name).join(" · "),
    action:"Assign",
    onAct:()=>{setPlanView("projects");goTab("plan");}
  });
}

// Under-staffed FTE (scoped)
const underFTE=ap.filter(p=>{const t=p.fte||0;return t>0&&pFTE(p)<t*.7;});
if(underFTE.length){
  banners.push({
    id:"underfte",sev:1,
    color:"var(--c-warning)",
    icon:"↓",
    title:`${underFTE.length} project${underFTE.length>1?"s are":" is"} under FTE target`,
    body:underFTE.map(p=>`${p.name} ${pFTE(p).toFixed(1)}/${p.fte}`).join(" · "),
    action:"Add FTE",
    onAct:()=>{setPlanView("projects");goTab("plan");}
  });
}

// Critical gaps (scoped)
const critGaps=scopedGaps.filter(g=>g.prio==="Critical");
if(critGaps.length){
  banners.push({
    id:"critgaps",sev:2,
    color:"var(--c-warning)",
    icon:"△",
    title:`${critGaps.length} critical skill gap${critGaps.length>1?"s":""} need${critGaps.length===1?"s":""} attention`,
    body:[...new Set(critGaps.map(g=>g.mName))].join(" · "),
    action:"Review",
    onAct:()=>goTab("analyze")
  });
}

// Opportunity: unassigned backlog projects
const backlog=projs.filter(p=>!p.scId);
if(backlog.length){
  banners.push({
    id:"backlog",sev:3,
    color:"var(--c-info)",
    icon:"→",
    title:`${backlog.length} project${backlog.length>1?"s":""} in backlog`,
    body:"Not assigned to any scenario",
    action:"Triage",
    onAct:()=>{setPlanView("projects");goTab("plan");}
  });
}
```

}

const visibleBanners=banners.sort((a,b)=>a.sev-b.sev).slice(0,5);

// ── Key projects ──────────────────────────────────────────────────────────
const keyProjs=ap
.filter(p=>p.prio===“Critical”||p.prio===“High”||(p.roster||[]).length===0)
.sort((a,b)=>[“Critical”,“High”,“Medium”,“Low”].indexOf(a.prio)-[“Critical”,“High”,“Medium”,“Low”].indexOf(b.prio))
.slice(0,4);

// ── Team snapshot (scoped) ────────────────────────────────────────────────
const available=scopedTwl.filter(m=>m.load<m.cap);
const overCap=scopedTwl.filter(m=>m.load>m.cap);
const atCap=scopedTwl.filter(m=>m.load===m.cap);

return <div>
<div style={{marginBottom:20}}>
<div style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:800,fontSize:22,letterSpacing:”-.02em”,marginBottom:3}}>
{asc?<>Planning <span style={{color:“var(–accent)”}}>{asc.name}</span></>:<span style={{color:“var(–text2)”}}>Home</span>}
</div>
<div className=“mono” style={{fontSize:11,color:“var(–text3)”}}>
{asc
?`${twl.length} members · ${ap.length} projects · ${ap.reduce((a,p)=>a+(p.tracks||[]).length,0)} tracks`
:`${scs.length} scenarios · ${projs.length} projects · no active scenario`}
</div>
</div>

```
{/* No active scenario — show a focused empty state */}
{!asc&&<div style={{background:"var(--surface-card)",border:"1px solid var(--c-info)",borderRadius:8,padding:"20px",marginBottom:16,textAlign:"center"}}>
  <div style={{fontSize:24,marginBottom:8,opacity:.6}}>◈</div>
  <div style={{fontWeight:600,fontSize:15,color:"var(--text1)",marginBottom:4}}>No active scenario</div>
  <div style={{fontSize:12,color:"var(--text3)",marginBottom:14,maxWidth:340,margin:"0 auto 14px"}}>Warnings and suggestions focus on your active plan. Set one as active to see what needs attention.</div>
  <button className="btn-p" onClick={()=>{setPlanView("scenarios");goTab("plan");}}>Choose Active Scenario</button>
</div>}

{/* Next Best Action */}
{nba&&sevStyle[nba.sev]&&<div style={{background:"var(--surface-card)",border:`1px solid ${sevStyle[nba.sev].border}`,borderRadius:8,padding:"16px",marginBottom:12}}>
  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
      <span className="mono" style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"var(--surface-hover)",color:sevStyle[nba.sev].accent,border:`1px solid ${sevStyle[nba.sev].accent}`,textTransform:"uppercase",letterSpacing:".06em"}}>{sevStyle[nba.sev].label}</span>
      <span className="mono" style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em"}}>Next Best Action</span>
    </div>
    <button onClick={nba.onAct} className="btn-p btn-sm" style={{flexShrink:0}}>Go →</button>
  </div>
  <div style={{fontFamily:"'Inter',system-ui,sans-serif",fontWeight:600,fontSize:15,lineHeight:1.35,color:"var(--text1)",marginBottom:8}}>{nba.action}</div>
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <div style={{display:"flex",gap:8,alignItems:"baseline"}}><span className="mono" style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",flexShrink:0,minWidth:28}}>Who</span><span style={{fontSize:12,color:"var(--text2)"}}>{nba.who}</span></div>
    <div style={{display:"flex",gap:8,alignItems:"baseline"}}><span className="mono" style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",flexShrink:0,minWidth:28}}>Why</span><span style={{fontSize:12,color:"var(--text2)"}}>{nba.why}</span></div>
  </div>
</div>}

{/* Banners */}
{visibleBanners.length>0&&<div style={{display:"grid",gap:8,marginBottom:20}}>
  {visibleBanners.map(b=><div key={b.id} style={{background:"var(--surface-card)",border:`1px solid ${b.color}`,borderRadius:6,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,minWidth:0,overflow:"hidden"}}>
    <span style={{fontSize:16,flexShrink:0,width:20,textAlign:"center",color:b.color}}>{b.icon}</span>
    <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
      <div style={{fontWeight:600,fontSize:12,color:"var(--text1)",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.title}</div>
      <div className="mono" style={{fontSize:10,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.body}</div>
    </div>
    <button onClick={b.onAct} className="btn-g btn-sm" style={{flexShrink:0,borderColor:b.color,color:b.color}}>{b.action}</button>
  </div>)}
</div>}

<div style={{display:"grid",gap:14}}>
  {/* Drag-and-drop assign panel */}
  <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span className="lbl" style={{marginBottom:0}}>Assign</span>
        <span className="mono" style={{fontSize:10,color:"var(--text3)",letterSpacing:".06em"}}>DRAG MEMBER → PROJECT</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"start"}}>
        {/* Members column */}
        <div style={{display:"grid",gap:5}}>
          {scopedTwl.map(m=>{
            const pct=Math.round(m.load/m.cap*100);
            const over=m.load>m.cap;
            const c=over?"var(--c-danger)":m.load>m.cap*.85?"var(--c-warning)":"var(--c-success)";
            const dragging=dragMid===m.id;
            return <div
              key={m.id}
              draggable
              onDragStart={()=>setDragMid(m.id)}
              onDragEnd={()=>{setDragMid(null);setDropPid(null);}}
              style={{
                display:"flex",alignItems:"center",gap:8,
                background:dragging?"rgba(0,229,160,.08)":"rgba(255,255,255,.03)",
                border:`1px solid ${dragging?"rgba(0,229,160,.4)":"rgba(255,255,255,.08)"}`,
                borderRadius:9,padding:"8px 10px",cursor:"grab",
                opacity:dragging?.5:1,transition:"opacity .15s,border .15s",
                userSelect:"none",
              }}
            >
              <div className="avatar" style={{width:26,height:26,borderRadius:7,fontSize:10,flexShrink:0}}>{m.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name.split(" ")[0]}</div>
                <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                  <div style={{flex:1,background:"rgba(255,255,255,.08)",borderRadius:99,height:3,overflow:"hidden"}}>
                    <div style={{width:`${Math.min(pct,100)}%`,background:c,height:"100%",borderRadius:99}}/>
                  </div>
                  <span className="mono" style={{fontSize:10,color:c,flexShrink:0}}>{m.load}%</span>
                </div>
              </div>
            </div>;
          })}
        </div>
        {/* Projects column */}
        <div style={{display:"grid",gap:5}}>
          {dropProjs.map(p=>{
            const isOver=dropPid===p.id;
            const justDropped=lastDrop?.pId===p.id;
            const assigned=(p.roster||[]).map(r=>twl.find(m=>m.id===r.mId)).filter(Boolean);
            const actual=pFTE(p);const target=p.fte||0;
            const under=target>0&&actual<target*.7;
            return <div
              key={p.id}
              onDragOver={e=>{e.preventDefault();setDropPid(p.id);}}
              onDragLeave={()=>setDropPid(null)}
              onDrop={()=>onDrop(p)}
              style={{
                background:justDropped?"rgba(var(--c-success-rgb,34,197,94),.06)":isOver?"var(--surface-hover)":"var(--surface-card)",
                border:`1.5px ${isOver?"solid":"solid"} ${justDropped?"rgba(0,229,160,.5)":isOver?"rgba(0,229,160,.35)":under?"rgba(251,146,60,.25)":"rgba(255,255,255,.07)"}`,
                borderRadius:9,padding:"9px 11px",
                transition:"background .1s,border .1s",
              }}
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:5}}>
                <div style={{fontSize:12,fontWeight:600,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{p.name}</div>
                <span className="mono" style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:`${PC[p.prio]||"#888"}18`,color:PC[p.prio]||"#888",flexShrink:0,textTransform:"uppercase"}}>{p.prio}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                <div style={{display:"flex",gap:3,flexWrap:"wrap",flex:1}}>
                  {assigned.length===0
                    ?<span className="mono" style={{fontSize:10,color:isOver?"var(--accent)":"var(--text4)"}}>
                        {isOver?"Drop to assign":"No team"}
                      </span>
                    :assigned.map(m=>{
                      const r=(p.roster||[]).find(x=>x.mId===m.id);
                      const flash=lastDrop?.mId===m.id&&lastDrop?.pId===p.id;
                      return <span key={m.id} className="mono" style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:flash?"rgba(var(--accent-rgb),.2)":"var(--surface1)",color:flash?"var(--accent)":"var(--text2)",transition:"background .3s,color .3s"}}>{m.avatar}{r?` ${r.alloc}%`:""}</span>;
                    })
                  }
                </div>
                <span className="mono" style={{fontSize:10,color:under?"#fb923c":"rgba(255,255,255,.3)",flexShrink:0}}>
                  {actual.toFixed(1)}{target>0?`/${target}`:""} FTE
                </span>
              </div>
              {isOver&&dragMid&&<div style={{marginTop:5,fontSize:10,color:"#00e5a0",fontFamily:"'DM Mono',monospace"}}>{(p.roster||[]).find(r=>r.mId===dragMid)?`+10% to ${twl.find(x=>x.id===dragMid)?.name.split(" ")[0]}`:`Add ${twl.find(x=>x.id===dragMid)?.name.split(" ")[0]} at 50%`}</div>}
            </div>;
          })}
        </div>
      </div>
    </>
</div>
```

  </div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// PLAN — Projects · Scenarios · Timeline
// ═════════════════════════════════════════════════════════════════════════════

function PlanTab(props){
const {planView,setPlanView}=props;
return <div>
<div style={{display:“flex”,gap:6,marginBottom:18,flexWrap:“wrap”}}>
{[{id:“projects”,l:“Projects”},{id:“scenarios”,l:“Scenarios”},{id:“timeline”,l:“Timeline”}].map(v=><button key={v.id} className={planView===v.id?“vpill on”:“vpill”} onClick={()=>setPlanView(v.id)}>{v.l}</button>)}
</div>
{planView===“projects”  && <ProjectsTab  {…props}/>}
{planView===“scenarios” && <ScenariosTab {…props}/>}
{planView===“timeline”  && <TimelineTab  {…props}/>}

  </div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// ANALYZE — Growth · Reports
// ═════════════════════════════════════════════════════════════════════════════

function AnalyzeTab(props){
const {analyzeView,setAnalyzeView}=props;
return <div>
<div style={{display:“flex”,gap:6,marginBottom:18,flexWrap:“wrap”}}>
{[{id:“growth”,l:“Growth”},{id:“reports”,l:“Reports”}].map(v=><button key={v.id} className={analyzeView===v.id?“vpill on”:“vpill”} onClick={()=>setAnalyzeView(v.id)}>{v.l}</button>)}
</div>
{analyzeView===“growth”  && <GrowthTab  {…props}/>}
{analyzeView===“reports” && <ReportsTab {…props}/>}

  </div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARE — PDF generation (module level to avoid nested template literal depth)
// ═════════════════════════════════════════════════════════════════════════════
function buildSharePdf(scs,projs,twl,gaps,gSk){
const fd=d=>{try{return new Date(d).toLocaleDateString(“en-US”,{month:“short”,day:“numeric”,year:“numeric”});}catch(e){return d;}};
const pct=(a,b)=>b>0?Math.round(a/b*100):null;
const pfx=p=>(p.roster||[]).reduce((s,r)=>s+((r.alloc||0)/100),0);
const PC2={Critical:”#dc2626”,High:”#d97706”,Medium:”#16a34a”,Low:”#2563eb”};

const scData=scs.map(s=>{
const sp=projs.filter(p=>p.scId===s.id);
const fte=sp.reduce((a,p)=>a+pfx(p),0);
const target=sp.reduce((a,p)=>a+(p.fte||0),0);
const people=new Set(sp.flatMap(p=>(p.roster||[]).map(r=>r.mId))).size;
const blocked=sp.flatMap(p=>(p.tracks||[]).filter(t=>t.status===“blocked”)).length;
return {s,sp,fte,target,people,blocked};
});

// Comparison table rows — no nested templates
const compRows=scData.map(function(d){
const cov=pct(d.fte,d.target);
const covCol=cov===null?”#888”:cov>=90?”#16a34a”:cov>=70?”#d97706”:”#dc2626”;
const dot=”<span style='display:inline-block;width:10px;height:10px;border-radius:50%;background:"+d.s.color+";margin-right:6px;vertical-align:middle;'></span>”;
const activeTag=d.s.active?” <span class='tag'>Active</span>”:””;
const covStr=cov!==null?cov+”%”:”—”;
const blkStr=d.blocked||”—”;
return “<tr><td>”+dot+”<strong>”+d.s.name+”</strong>”+activeTag+”</td>”
+”<td>”+d.sp.length+”</td><td>”+d.people+”</td>”
+”<td>”+d.fte.toFixed(1)+”</td><td>”+(d.target||”—”)+”</td>”
+”<td style='color:"+covCol+";font-weight:600'>”+covStr+”</td>”
+”<td style='color:"+(d.blocked>0?"#dc2626":"#888")+"'>”+blkStr+”</td></tr>”;
}).join(””);

const compTable=”<table><thead><tr>”
+”<th>Scenario</th><th>Projects</th><th>People</th>”
+”<th>FTE Staffed</th><th>FTE Target</th><th>Coverage</th><th>Blocked</th>”
+”</tr></thead><tbody>”+compRows+”</tbody></table>”;

// Per-scenario sections
const scSections=scData.map(function(d){
const rosterSet=new Set(d.sp.flatMap(p=>(p.roster||[]).map(r=>r.mId)));

```
const memberRows=twl.filter(m=>rosterSet.has(m.id)).map(function(m){
  const mProjs=d.sp.filter(p=>(p.roster||[]).find(r=>r.mId===m.id));
  const alloc=mProjs.reduce(function(a,p){const r=(p.roster||[]).find(r=>r.mId===m.id);return a+(r?r.alloc||0:0);},0);
  const loadPct=Math.round(alloc/m.cap*100);
  const col=loadPct>=90?"#dc2626":loadPct>=70?"#d97706":"#16a34a";
  const bar="<div style='background:#e5e7eb;border-radius:4px;height:6px;width:80px;display:inline-block;vertical-align:middle;overflow:hidden'>"
    +"<div style='width:"+Math.min(loadPct,100)+"%;height:100%;background:"+col+";border-radius:4px'></div></div>"
    +" <span style='color:"+col+";font-size:11px'>"+loadPct+"%</span>";
  return "<tr><td>"+m.name+"</td><td style='color:#888'>"+(m.role||"—")+"</td>"
    +"<td>"+(mProjs.map(p=>p.name).join(", ")||"—")+"</td>"
    +"<td>"+alloc+"%</td><td>"+bar+"</td></tr>";
}).join("");

const projRows=d.sp.map(function(p){
  const actual=pfx(p);const target=p.fte||0;
  const tracks=(p.tracks||[]);
  const blocked=tracks.filter(t=>t.status==="blocked").length;
  const done=tracks.filter(t=>t.status==="complete").length;
  const col=PC2[p.prio]||"#888";
  const tag="<span class='tag' style='background:"+col+"20;color:"+col+"'>"+p.prio+"</span>";
  const trackStr=tracks.length+" track"+(tracks.length!==1?"s":"")
    +(blocked>0?" <span style='color:#dc2626'>("+blocked+" blocked)</span>":"")
    +(done>0?" <span style='color:#16a34a'>("+done+" done)</span>":"");
  return "<tr><td><strong>"+p.name+"</strong></td><td>"+tag+"</td>"
    +"<td>"+actual.toFixed(1)+" / "+(target||"—")+" FTE</td>"
    +"<td>"+(p.roster||[]).length+" people</td>"
    +"<td>"+trackStr+"</td>"
    +"<td style='color:#888'>"+(p.due?fd(p.due):"—")+"</td></tr>";
}).join("");

const scGaps=gaps.filter(g=>d.sp.find(p=>p.id===g.pid));
const gapRows=scGaps.slice(0,8).map(function(g){
  const sk=gSk(g.sid);
  return "<tr><td>"+g.mName+"</td>"
    +"<td style='color:"+(sk?sk.color:"#888")+"'>"+(sk?sk.name:"—")+"</td>"
    +"<td>Level "+g.cur+" → "+g.req+" (+"+g.delta+")</td>"
    +"<td style='color:#888'>"+g.pName+"</td></tr>";
}).join("");

const projSection=d.sp.length
  ?"<table><thead><tr><th>Name</th><th>Priority</th><th>FTE</th><th>Roster</th><th>Tracks</th><th>Due</th></tr></thead><tbody>"+projRows+"</tbody></table>"
  :"<p class='empty'>No projects</p>";
const memberSection=memberRows
  ?"<table><thead><tr><th>Name</th><th>Role</th><th>Projects</th><th>Alloc</th><th>Load</th></tr></thead><tbody>"+memberRows+"</tbody></table>"
  :"<p class='empty'>No assignments</p>";
const gapSection=gapRows
  ?"<h3>Skill Gaps ("+scGaps.length+")</h3><table><thead><tr><th>Member</th><th>Skill</th><th>Gap</th><th>Project</th></tr></thead><tbody>"+gapRows+"</tbody></table>"
  :"";
const descLine=d.s.desc?"<p class='sub'>"+d.s.desc+"</p>":"";

return "<div class='sc-block'>"
  +"<div class='sc-header' style='border-left:4px solid "+d.s.color+"'>"
  +"<h2 style='color:"+d.s.color+"'>"+d.s.name+"</h2>"+descLine+"</div>"
  +"<h3>Projects ("+d.sp.length+")</h3>"+projSection
  +"<h3>Team Allocation ("+rosterSet.size+" people)</h3>"+memberSection
  +gapSection+"</div>";
```

}).join(””);

const dateStr=new Date().toLocaleDateString(“en-US”,{month:“long”,day:“numeric”,year:“numeric”});
const html=”<div class='header'><h1>FLUX \u2014 Resource Plan</h1>”
+”<p class='sub'>Generated “+dateStr+” \u00b7 “+scs.length+” scenario”+(scs.length!==1?“s”:””)+” \u00b7 “+twl.length+” team members</p></div>”
+”<div class='sec'><h2>Scenario Comparison</h2>”+compTable+”</div>”
+scSections;

const css=”*{box-sizing:border-box;margin:0;padding:0;}”
+“body{font-family:-apple-system,BlinkMacSystemFont,‘Segoe UI’,sans-serif;color:#111;padding:32px;max-width:920px;margin:0 auto;font-size:13px;line-height:1.5;}”
+“h1{font-size:26px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px;}”
+“h2{font-size:15px;font-weight:700;margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;}”
+“h3{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#666;margin:14px 0 6px;}”
+”.header{margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #111;}”
+”.sub{color:#666;font-size:12px;margin-top:4px;}”
+”.sec{margin-bottom:24px;}”
+”.sc-block{margin-bottom:32px;page-break-inside:avoid;}”
+”.sc-header{padding:10px 14px;background:#f9fafb;border-radius:0 8px 8px 0;margin-bottom:12px;}”
+”.empty{color:#999;font-style:italic;font-size:12px;padding:8px 0;}”
+“table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px;}”
+“th{text-align:left;padding:5px 9px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#888;border-bottom:1.5px solid #e5e7eb;white-space:nowrap;}”
+“td{padding:7px 9px;border-bottom:1px solid #f3f4f6;vertical-align:middle;}”
+“tr:last-child td{border-bottom:none;}”
+”.tag{display:inline-block;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase;font-family:monospace;}”
+”@media print{@page{margin:1.5cm;size:A4;}body{padding:0;}.sc-block{page-break-inside:avoid;}}”;

doPrint(”<style>”+css+”</style>”+html);
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARE MODAL
// ═════════════════════════════════════════════════════════════════════════════
function ShareModal({scs,projs,twl,gaps,gSk,discs,onClose}){
const [mode,setMode]=useState(“pdf”);
const [copied,setCopied]=useState(false);

const shareLink=useMemo(()=>{
try{
const payload={scs,projs,team:twl.map(function(m){const o=Object.assign({},m);delete o.load;return o;}),ts:Date.now()};
const b64=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
return window.location.origin+window.location.pathname+”?plan=”+b64;
}catch(e){return window.location.href;}
},[scs,projs,twl]);

const copyLink=()=>{
navigator.clipboard.writeText(shareLink).then(()=>{
setCopied(true);setTimeout(()=>setCopied(false),2000);
});
};

return <div className=“overlay” onClick={e=>e.target===e.currentTarget&&onClose()}>
<div style={{background:“var(–surface-card)”,border:“1px solid var(–border2)”,borderRadius:10,padding:0,maxWidth:520,width:“calc(100% - 32px)”,margin:“auto”,marginTop:“8vh”,overflow:“hidden”,}}>
{/* Header */}
<div style={{display:“flex”,alignItems:“center”,justifyContent:“space-between”,padding:“16px 20px”,borderBottom:“1px solid var(–border1)”}}>
<div style={{display:“flex”,alignItems:“center”,gap:10}}>
<div style={{width:32,height:32,borderRadius:8,background:“var(–accent)”,display:“flex”,alignItems:“center”,justifyContent:“center”}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
</div>
<div>
<div style={{fontFamily:”‘Inter’,system-ui,sans-serif”,fontWeight:800,fontSize:15,color:“var(–text1)”}}>Share Plan</div>
<div style={{fontSize:11,color:“var(–text3)”,fontFamily:”‘DM Mono’,monospace”}}>{scs.length} scenario{scs.length!==1?“s”:””} · {projs.length} projects · {twl.length} members</div>
</div>
</div>
<button className="ib" onClick={onClose}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
</div>

```
  {/* Mode tabs */}
  <div style={{display:"flex",padding:"12px 20px 0",gap:6}}>
    {[{id:"pdf",icon:"🖨",label:"PDF Report"},{id:"link",icon:"🔗",label:"Share Link"}].map(m=>(
      <button key={m.id} onClick={()=>setMode(m.id)} className={mode===m.id?"vpill on":"vpill"} style={{fontSize:11,minHeight:32,padding:"4px 14px"}}>
        {m.icon} {m.label}
      </button>
    ))}
  </div>

  {/* PDF mode */}
  {mode==="pdf"&&<div style={{padding:"20px"}}>
    <div style={{background:"var(--surface-raise)",border:"1px solid var(--border1)",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
      <div style={{fontWeight:600,fontSize:13,color:"var(--text1)",marginBottom:8}}>What's included</div>
      {[
        `Scenario comparison table (${scs.length} scenarios)`,
        "Per-scenario project tables with priority, FTE, tracks",
        `Team allocation per scenario (${twl.length} members)`,
        gaps.length>0?`Skill gap summary (${gaps.length} gaps)`:"Skill gap summary",
        "Print-optimised layout, A4-ready"
      ].map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{color:"var(--c-success)",fontSize:12,flexShrink:0}}>✓</span>
          <span style={{fontSize:12,color:"var(--text2)"}}>{item}</span>
        </div>
      ))}
    </div>
    <button className="btn-p" onClick={()=>buildSharePdf(scs,projs,twl,gaps,gSk)} style={{width:"100%"}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Open Print Preview
    </button>
    <p style={{fontSize:11,color:"var(--text3)",textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace"}}>Opens in new tab → Print or Save as PDF</p>
  </div>}

  {/* Link mode */}
  {mode==="link"&&<div style={{padding:"20px"}}>
    <div style={{background:"var(--surface-raise)",border:"1px solid var(--border1)",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
      <div style={{fontWeight:600,fontSize:13,color:"var(--text1)",marginBottom:6}}>Shareable link</div>
      <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.5,marginBottom:12}}>
        Encodes your full plan — all scenarios, projects, and team — into a URL. Anyone with the link can open FLUX and see your exact plan.
      </p>
      <div style={{background:"var(--surface-card)",border:"1px solid var(--border2)",borderRadius:8,padding:"10px 12px",fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--text2)",wordBreak:"break-all",lineHeight:1.6,maxHeight:80,overflow:"hidden",position:"relative"}}>
        {shareLink.slice(0,120)}{shareLink.length>120?"…":""}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,background:"linear-gradient(transparent,var(--surface-card))"}}/>
      </div>
    </div>
    <button className="btn-p" onClick={copyLink} style={{width:"100%",background:copied?"var(--c-success)":"var(--accent)"}}>
      {copied
        ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
        : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Link</>
      }
    </button>
    <div style={{marginTop:12,display:"flex",gap:8,alignItems:"flex-start",padding:"10px 12px",background:"rgba(var(--c-warning-rgb,234,88,12),.06)",border:"1px solid rgba(var(--c-warning-rgb,234,88,12),.2)",borderRadius:8}}>
      <span style={{fontSize:14,flexShrink:0}}>ℹ</span>
      <p style={{fontSize:11,color:"var(--text2)",lineHeight:1.5}}>Link reflects your plan at this moment. Changes made after copying won't be included.</p>
    </div>
  </div>}
</div>
```

  </div>;
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOT APP — defined last, after all components it uses
// ═════════════════════════════════════════════════════════════════════════════
export default function App(){
const [discs,setDiscs]=useState(D0);
const [skills,setSkills]=useState(SK0);
const [team,setTeam]=useState(TM0);
const [scs,setScs]=useState(SC0);
const [projs,setProjs]=useState(PR0);
const [tab,setTab]=useState(“home”);
const [teamScFilter,setTeamScFilter]=useState(“all”);
const [matrixOrder,setMatrixOrder]=useState(null);
const [planView,setPlanView]=useState(“projects”);
const [analyzeView,setAnalyzeView]=useState(“growth”);
const [chatOpen,setChatOpen]=useState(false);
const [shortcutsOpen,setShortcutsOpen]=useState(false);
const [themeId,setThemeId]=useState(“onedark”);
const [shareOpen,setShareOpen]=useState(false);
const theme=THEMES[themeId]||THEMES.onedark;
const [conf,setConf]=useState(null);
const [toasts,setToasts]=useState([]);

// Load shared plan from URL on first render
useEffect(()=>{
try{
const params=new URLSearchParams(window.location.search);
const encoded=params.get(“plan”);
if(!encoded)return;
const json=decodeURIComponent(escape(atob(encoded)));
const data=JSON.parse(json);
if(data.scs)setScs(data.scs);
if(data.projs)setProjs(data.projs);
if(data.team)setTeam(data.team);
// Clean URL after loading
window.history.replaceState({},””,window.location.pathname);
}catch(e){console.warn(“Could not load shared plan:”,e);}
},[]);

const toast=(msg,type=“ok”)=>{const id=uid();setToasts(p=>[…p.slice(-1),{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),2500);};
const ask=(msg,fn)=>setConf({msg,onOk:()=>{fn();setConf(null);}});

const upsDisc=d=>{const e=discs.find(x=>x.id===d.id);setDiscs(p=>e?p.map(x=>x.id===d.id?d:x):[…p,{…d,id:uid()}]);toast(e?“Updated”:“Added”);};
const delDisc=id=>ask(“Delete discipline?”,()=>{setDiscs(p=>p.filter(x=>x.id!==id));setTeam(p=>p.map(m=>m.discId===id?{…m,discId:null}:m));setProjs(p=>p.map(r=>r.discId===id?{…r,discId:null}:r));toast(“Deleted”,“err”);});
const upsSkill=s=>{const e=skills.find(x=>x.id===s.id);setSkills(p=>e?p.map(x=>x.id===s.id?s:x):[…p,{…s,id:uid()}]);toast(e?“Updated”:“Added”);};
const delSkill=id=>ask(“Delete skill?”,()=>{setSkills(p=>p.filter(x=>x.id!==id));setTeam(p=>p.map(m=>{const sp={…m.sp};delete sp[id];return{…m,sp};}));setProjs(p=>p.map(r=>{const sr={…r.sr};delete sr[id];return{…r,sr};}));toast(“Deleted”,“err”);});
const upsMember=m=>{const isNew=!team.find(x=>x.id===m.id);setTeam(p=>isNew?[…p,{…m,id:uid(),avatar:ini(m.name)}]:p.map(x=>x.id===m.id?m:x));toast(isNew?“Added”:“Updated”);};
const delMember=id=>ask(“Remove member?”,()=>{setTeam(p=>p.filter(x=>x.id!==id));setProjs(p=>p.map(r=>({…r,roster:(r.roster||[]).filter(x=>x.mId!==id),tracks:(r.tracks||[]).map(t=>t.ownId===id?{…t,ownId:null}:t)})));toast(“Removed”,“err”);});
const upsSc=s=>{
const e=scs.find(x=>x.id===s.id);
// If marking active, deactivate all others first
if(s.active){
setScs(p=>(e?p.map(x=>x.id===s.id?s:{…x,active:false}):[…p.map(x=>({…x,active:false})),{…s,id:uid()}]));
} else {
setScs(p=>e?p.map(x=>x.id===s.id?s:x):[…p,{…s,id:uid()}]);
}
toast(e?“Updated”:“Created”);
};
const delSc=id=>{const n=projs.filter(p=>p.scId===id).length;ask(`Delete scenario and ${n} project${n!==1?'s':''}? This cannot be undone.`,()=>{setScs(p=>p.filter(x=>x.id!==id));setProjs(p=>p.filter(x=>x.scId!==id));toast(“Deleted”,“err”);});};
const upsPr=p=>{const e=projs.find(x=>x.id===p.id);setProjs(prev=>e?prev.map(x=>x.id===p.id?p:x):[…prev,{…p,id:uid(),roster:p.roster||[],tracks:p.tracks||[]}]);toast(e?“Updated”:“Added”);};
const delPr=id=>ask(“Delete project?”,()=>{setProjs(p=>p.filter(x=>x.id!==id));toast(“Deleted”,“err”);});

const gSk=id=>skills.find(s=>s.id===id);
const gDi=id=>discs.find(d=>d.id===id);
const gMb=id=>team.find(m=>m.id===id);

const twl=useMemo(()=>team.map(m=>({…m,load:mLoad(m.id,projs)})),[team,projs]);
const gaps=useMemo(()=>buildGaps(twl,projs,scs,skills),[twl,projs,scs,skills]);
const BC={home:gaps.filter(g=>g.prio===“Critical”||g.prio===“High”).length,plan:projs.length,team:team.length,analyze:gaps.length};
const TICON={home:“M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10”,plan:“M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z”,team:“M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75”,analyze:“M18 20V10M12 20V4M6 20v-6”};

const sh={discs,skills,scs,projs,twl,gaps,gSk,gDi,gMb,upsDisc,delDisc,upsSkill,delSkill,upsMember,delMember,upsSc,delSc,upsPr,delPr,ask,toast,goTab:setTab,teamScFilter,setTeamScFilter,matrixOrder,setMatrixOrder,planView,setPlanView,analyzeView,setAnalyzeView,chatOpen,setChatOpen,shortcutsOpen,setShortcutsOpen,shareOpen,setShareOpen};

return <div style={{minHeight:“100vh”,background:“var(–bg)”,}}>
<style>{getCSS(theme)}</style>
{conf&&<Confirm msg={conf.msg} onOk={conf.onOk} onCancel={()=>setConf(null)}/>}
{shareOpen&&<ShareModal scs={scs} projs={projs} twl={twl} gaps={gaps} gSk={gSk} discs={discs} onClose={()=>setShareOpen(false)}/>}

```
{/* Toast stack */}
<div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:6}}>
  {toasts.map(t=><div key={t.id} className="fu" style={{background:"var(--surface-card)",border:`1px solid ${t.type==="err"?"var(--c-danger)":"var(--c-success)"}`,borderRadius:8,padding:"9px 16px",fontSize:13,color:"var(--text1)",display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",}}><span style={{color:t.type==="err"?"#ff6666":"#00e5a0"}}>{t.type==="err"?"✕":"✓"}</span>{t.msg}</div>)}
</div>

{/* Chat overlay */}
{chatOpen&&<>
  <div className="overlay" onClick={()=>setChatOpen(false)}/>
  <div className="drawer" style={{height:"80dvh",display:"flex",flexDirection:"column"}}>
    <div className="drawer-handle"/>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px 8px"}}>
      <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontWeight:700,fontSize:15}}>Plan Advisor</span>
      <button onClick={()=>setChatOpen(false)} className="ib" style={{color:"var(--text2)"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <div style={{flex:1,overflow:"hidden",padding:"0 16px 16px"}}>
      <ChatTab {...sh}/>
    </div>
  </div>
</>}

{/* Shortcuts sheet */}
{shortcutsOpen&&<>
  <div className="overlay" onClick={()=>setShortcutsOpen(false)}/>
  <div className="drawer">
    <div className="drawer-handle"/>
    <div style={{padding:"14px 20px 24px",display:"grid",gap:10}}>
      <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontWeight:800,fontSize:15,marginBottom:2}}>Quick Actions</span>
      {[
        {l:"New Project",icon:"＋",desc:"Add to active scenario",act:()=>{setPlanView("projects");setTab("plan");setShortcutsOpen(false);}},
        {l:"Assign Resource",icon:"→",desc:"Staff an open project",act:()=>{setPlanView("projects");setTab("plan");setShortcutsOpen(false);}},
        {l:"Compare Scenarios",icon:"⊞",desc:"Side-by-side FTE view",act:()=>{setPlanView("scenarios");setTab("plan");setShortcutsOpen(false);}},
        {l:"Review Gaps",icon:"△",desc:`${gaps.length} gap${gaps.length!==1?"s":""} identified`,act:()=>{setAnalyzeView("growth");setTab("analyze");setShortcutsOpen(false);},warn:gaps.length>0},
        {l:"Team Capacity",icon:"◎",desc:"View allocation overview",act:()=>{setTab("team");setShortcutsOpen(false);}},
      ].map(a=><button key={a.l} onClick={a.act} style={{background:a.warn?"rgba(251,146,60,.06)":"rgba(255,255,255,.03)",border:`1px solid ${a.warn?"rgba(251,146,60,.2)":"rgba(255,255,255,.08)"}`,borderRadius:8,padding:"13px 16px",textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:18,color:a.warn?"#fb923c":"#00e5a0",width:24,textAlign:"center",flexShrink:0}}>{a.icon}</span>
        <div>
          <div style={{fontWeight:600,fontSize:13,color:"var(--text1)",marginBottom:2}}>{a.l}</div>
          <div className="mono" style={{fontSize:10,color:"var(--text3)"}}>{a.desc}</div>
        </div>
      </button>)}
    </div>
  </div>
</>}

{/* Top nav */}
<nav className="topnav">
  <div style={{display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:28,height:28,borderRadius:7,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
    <span style={{fontFamily:"'Inter',system-ui,sans-serif",fontSize:15,fontWeight:800,letterSpacing:"-.02em"}}>FLUX</span>
  </div>
  <div className="tnav">
    {TABS.map(t=>{const on=tab===t;const bc=BC[t];const lbl={home:"Home",plan:"Plan",team:"Team",analyze:"Analyze"}[t];return <button key={t} className={on?"tnav-btn on":"tnav-btn"} onClick={()=>setTab(t)}>{lbl}{bc>0&&<span className="mono" style={{fontSize:10,padding:"1px 5px",borderRadius:12,background:t==="analyze"?"rgba(251,146,60,.2)":on?"rgba(var(--accent-rgb),.15)":"var(--border1)",color:t==="analyze"?"#fb923c":on?"var(--accent)":"var(--text3)"}}>{bc}</span>}{on&&<span className="tnav-line"/>}</button>;})}
  </div>
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <span className="mono" style={{fontSize:10,color:"var(--text3)"}}>{twl.filter(m=>m.cap-m.load>0).length}/{team.length} avail</span>
    <select className="theme-select" value={themeId} onChange={e=>setThemeId(e.target.value)}>{Object.values(THEMES).map(th=><option key={th.id} value={th.id}>{th.dark?"🌙":"☀️"} {th.label}</option>)}</select>
    <button onClick={()=>setShareOpen(true)} style={{width:32,height:32,borderRadius:8,background:"rgba(var(--accent-rgb),.1)",border:"1px solid rgba(var(--accent-rgb),.25)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} title="Share Plan">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    </button>
    <button onClick={()=>setChatOpen(true)} style={{width:32,height:32,borderRadius:8,background:"rgba(var(--accent-rgb),.1)",border:"1px solid rgba(var(--accent-rgb),.25)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} title="Plan Advisor">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    </button>
  </div>
</nav>

<div className="page">
  {tab==="home"    && <HomeTab    {...sh}/>}
  {tab==="plan"    && <PlanTab    {...sh}/>}
  {tab==="team"    && <TeamTab    {...sh}/>}
  {tab==="analyze" && <AnalyzeTab {...sh}/>}
</div>

{/* Bottom nav */}
<nav className="bnav">
  {TABS.map(t=>{const on=tab===t;const bc=BC[t];const icon=TICON[t];const lbl={home:"Home",plan:"Plan",team:"Team",analyze:"Analyze"}[t];return <button key={t} className="bni" onClick={()=>setTab(t)}>
    <div style={{position:"relative"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on?"var(--accent)":"var(--ib-color)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon.split("M").filter(Boolean).map((d,i)=><path key={i} d={`M${d}`}/>)}</svg>{bc>0&&<span style={{position:"absolute",top:-4,right:-6,fontSize:8,fontFamily:"'DM Mono',monospace",padding:"1px 4px",borderRadius:10,background:t==="analyze"?"#fb923c":on?"var(--accent)":"var(--border3)",color:t==="analyze"||on?"var(--on-accent)":"var(--text2)",lineHeight:1.4}}>{bc}</span>}</div>
    <span className="mono" style={{fontSize:8,letterSpacing:".06em",textTransform:"uppercase",color:on?"#00e5a0":"rgba(255,255,255,.35)"}}>{lbl}</span>
    {on&&<span style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:18,height:2,background:"#00e5a0",borderRadius:"2px 2px 0 0"}}/>}
  </button>;})}
</nav>

{/* Shortcuts FAB */}
<button className="fab" onClick={()=>setShortcutsOpen(p=>!p)} title="Quick actions">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
</button>
```

  </div>;
}