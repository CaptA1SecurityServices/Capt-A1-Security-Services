const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('Homepage retains the four original services, photos, descriptions and enquiry destinations',()=>{
  const html=fs.readFileSync('index.html','utf8');
  const expected=require('./fixtures/home-core-content.json');
  const section=html.match(/<section[^>]+id="services"[\s\S]*?<\/section>/)[0];
  const cards=[...section.matchAll(/<article class="service-card">([\s\S]*?)<\/article>/g)].map(m=>{const s=m[1];return {heading:s.match(/<h3>(.*?)<\/h3>/)[1],body:s.match(/<p>(.*?)<\/p>/)[1],link:s.match(/<a class="text-link" href="([^"]+)">(.*?) <span/).slice(1),image:s.match(/<img[^>]+src="([^"]+)"/)[1],alt:s.match(/<img[^>]+alt="([^"]+)"/)[1]}});
  assert.deepEqual(cards,expected.cards);
  const normalise=s=>s.replace(/\r\n?/g,'\n');
  assert.equal(normalise(section.match(/<div class="service-directory">([\s\S]*?)<\/div>/)[1].trim()),normalise(expected.directory));
  assert.ok(section.includes('Core services.'));
});

// Exercise the shipped controller, including the short-desktop regression.
function motionBrowser({width=1366,height=580,reduced=false,overflow=false}={}) {
  const events={}, classes=new Set();
  const style=()=>({setProperty(k,v){this[k]=v},getPropertyValue(k){return this[k]||''}});
  const element=()=>({style:style(),addEventListener(){},setAttribute(){}});
  const cards=Array.from({length:4},()=>({...element(),clientHeight:260,scrollHeight:overflow?310:260,offsetHeight:310}));
  const scenes=cards.map(element),steps=cards.map(element),progress=element(),orbit=element();
  const track={...element(),scrollWidth:2200,querySelectorAll:()=>cards};
  const viewport={clientWidth:1180};
  const runway={...element(),offsetHeight:1800,classList:{add(...names){names.forEach(n=>classes.add(n))},remove(...names){names.forEach(n=>classes.delete(n))}},querySelector:s=>({'.core-window':viewport,'.core-track':track,'.core-progress > span':progress,'.core-orbit-spin':orbit})[s],querySelectorAll:s=>s==='[data-core-step]'?steps:scenes};
  const context={innerWidth:width,innerHeight:height,scrollY:0,matchMedia:()=>({matches:reduced,addEventListener(){}}),addEventListener:(n,fn)=>events[n]=fn,requestAnimationFrame:fn=>{fn();return 1},IntersectionObserver:class{constructor(fn){events.intersection=fn}observe(){}},document:{hidden:false,querySelector:s=>s==='.core-runway'?runway:{getBoundingClientRect:()=>({height:89})},addEventListener(){},fonts:{ready:{then:fn=>fn()}}}};
  context.window=context;
  runway.getBoundingClientRect=()=>({top:1000-context.scrollY});
  cards.forEach((c,i)=>{c.getBoundingClientRect=()=>({top:1150+i*400-context.scrollY})});
  vm.runInNewContext(fs.readFileSync('home-core.js','utf8'),context);
  return {context,events,classes,runway,track,cards,orbit};
}

test('Short desktop windows animate on scroll and respond to small height changes',()=>{
  const b=motionBrowser();
  assert.ok(b.classes.has('is-motion'),'1366×580 must not silently disable animation');
  b.context.scrollY=1400;
  b.events.intersection([{isIntersecting:true}]);
  assert.match(b.track.style.transform,/translate3d\(-489px/);
  assert.notEqual(b.orbit.style.transform,'rotate(0deg)');
  b.context.innerHeight=620;
  b.events.resize();
  assert.equal(b.runway.style['--core-stage-height'],'531px','40px desktop resizes must update the stage');
});

test('Overflowing cards retain scroll motion; reduced-motion preference disables it',()=>{
  const flowing=motionBrowser({overflow:true});
  assert.ok(flowing.classes.has('is-flow-motion'));
  assert.match(flowing.cards[0].style.transform,/scale/);
  const reduced=motionBrowser({reduced:true});
  assert.equal(reduced.classes.size,0);
  assert.equal(reduced.track.style.transform,'');
});
