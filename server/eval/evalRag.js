const fs = require('fs');
const path = require('path');
const dataset = JSON.parse(fs.readFileSync(path.join(__dirname, 'dataset.json'), 'utf8'));
function tokenize(t){return String(t).toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean)}
function vec(text,vocab){const c=new Map();for(const t of tokenize(text))c.set(t,(c.get(t)||0)+1);return vocab.map(w=>c.get(w)||0)}
function cos(a,b){let d=0,na=0,nb=0;for(let i=0;i<a.length;i++){d+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i]}return(!na||!nb)?0:d/Math.sqrt(na*nb)}
const vocab=[...new Set(dataset.corpusChunks.flatMap(c=>tokenize(c.chunkText)))];
function retrieve(q,k=3,min=0.08){
  const qv=vec(q,vocab);
  return dataset.corpusChunks.map(c=>({...c,score:cos(qv,vec(c.chunkText,vocab))})).sort((a,b)=>b.score-a.score).slice(0,k).filter(c=>c.score>=min);
}
let rSum=0,rN=0,mSum=0,mN=0;
for(const ex of dataset.examples){
  const pred=retrieve(ex.question);
  if(ex.relevantChunkIndices.length){
    const set=new Set(pred.map(p=>p.chunkIndex));
    let hit=0; for(const r of ex.relevantChunkIndices) if(set.has(r)) hit++;
    rSum+=hit/ex.relevantChunkIndices.length; rN++;
    let rr=0; for(let i=0;i<pred.length;i++) if(ex.relevantChunkIndices.includes(pred[i].chunkIndex)){rr=1/(i+1);break}
    mSum+=rr; mN++;
  }
}
const out={metrics:{recallAtK:rN?rSum/rN:null,mrr:mN?mSum/mN:null},evaluatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'results/latest.json'),JSON.stringify(out,null,2));
console.log(JSON.stringify(out.metrics));
