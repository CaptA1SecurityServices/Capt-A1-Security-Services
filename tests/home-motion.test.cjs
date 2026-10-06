const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const source = fs.readFileSync('home-services.js','utf8');

function browser({native=false, reduced=false}={}) {
  const events = {}, frames = [], observers = [], properties = {};
  const tile = {getBoundingClientRect:()=>({top:300,height:400}),style:{setProperty:(key,value)=>{properties[key]=value;}}};
  const scene = {querySelectorAll:()=>[tile],getBoundingClientRect:()=>({top:200,height:1200}),style:tile.style};
  const preference = {matches:reduced,addEventListener:(type,fn)=>{events.motion=fn;}};
  const document = {hidden:false,querySelector:selector=>selector.includes('scene')?scene:null,addEventListener:(type,fn)=>{events[type]=fn;}};
  const window = {innerHeight:800,matchMedia:()=>preference,IntersectionObserver:true,addEventListener:(type,fn)=>{events[type]=fn;}};
  vm.runInNewContext(source,{window,document,CSS:{supports:()=>native},IntersectionObserver:class {constructor(fn){observers.push(fn);}observe(){}},requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}});
  return {events,frames,observers,properties,preference,document};
}

test('native timelines add no JavaScript scroll processing',()=>{
  const b=browser({native:true});
  assert.equal(b.events.scroll,undefined);
  assert.equal(b.observers.length,0);
});

test('fallback coalesces visible scrolling and stops off-screen or under reduced motion',()=>{
  const b=browser();
  b.events.scroll();
  assert.equal(b.frames.length,0);
  b.observers[0]([{isIntersecting:true}]);
  b.events.scroll(); b.events.resize();
  assert.equal(b.frames.length,1,'multiple events schedule one frame');
  b.frames.shift()();
  assert.equal(b.properties['--scene-progress'],'0.300');
  assert.equal(b.properties['--tile-progress'],'0.417');
  b.observers[0]([{isIntersecting:false}]);
  b.events.scroll();
  assert.equal(b.frames.length,0);
  b.preference.matches=true;
  b.observers[0]([{isIntersecting:true}]); b.events.motion(); b.events.scroll();
  assert.equal(b.frames.length,0,'reduced motion suppresses updates');
  b.preference.matches=false;
  b.document.hidden=true; b.events.scroll();
  assert.equal(b.frames.length,0,'hidden document suppresses updates');
  b.document.hidden=false; b.events.visibilitychange();
  assert.equal(b.frames.length,1,'visible document resumes on demand');
});
