import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('cached background waves preserve rendered tiles while using six trig calls per frame',()=>{
 const source=readFileSync(new URL('../assets/js/custom-scripts.js',import.meta.url),'utf8').split('// ── Theme Switcher')[0];
 const listeners={};let nextFrame,rects=[],trig=0,color;
 const math=Object.create(Math);
 for(const method of ['sin','cos'])math[method]=value=>{trig++;return Math[method](value);};
 const canvas={style:{},getContext:()=>({clearRect(){},set fillStyle(value){color=value;},fillRect(...args){rects.push([...args,color]);}})};
 const document={hidden:false,documentElement:{getAttribute:()=>null},body:{insertBefore(){}},createElement:()=>canvas,addEventListener:(name,callback)=>{listeners[name]=callback;}};
 const window={innerWidth:1440,innerHeight:1000,addEventListener:(name,callback)=>{listeners[name]=callback;}};
 vm.runInNewContext(source,{Math:math,document,window,clearTimeout(){},setTimeout:fn=>fn(),MutationObserver:class{observe(){}},requestAnimationFrame:fn=>{nextFrame=fn;return 1;},cancelAnimationFrame(){}});
 listeners.DOMContentLoaded();
 let t=0;
 for(let frame=1;frame<=4;frame++){
  if(frame===3){window.innerWidth=390;window.innerHeight=844;listeners.resize();}
  trig=0;rects=[];nextFrame(frame*42);
  const expected=[];
  for(let r=0;r<Math.ceil(canvas.height/26)+1;r++)for(let c=0;c<Math.ceil(canvas.width/26)+1;c++){
   const wave=.6*Math.sin(c*.21+t*.36)*Math.sin(r*.17+t*.28)+.4*Math.sin(c*.11-r*.13+t*.19);
   const norm=(wave+1)*.5,alpha=Math.round((.004+norm*norm*norm*.186)*100)/100;
   if(alpha>=.02)expected.push([c*26+1,r*26+1,25,25,'rgba(10,10,10,'+alpha+')']);
  }
  assert.deepEqual(rects,expected,'Original wave appearance must survive caching and resize');
  assert.equal(trig,6,'Trig calls must be independent of viewport tile count');
  t+=.007;
 }
});
