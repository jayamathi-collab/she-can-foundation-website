<script>
/* ── PARTICLES ── */
(function(){
  const canvas=document.getElementById('particles-canvas'),ctx=canvas.getContext('2d');
  let W,H,particles=[];
  const COLORS=['#7C3AED','#FF6B6B','#06B6D4','#A78BFA','#FFB3B3','#ffffff'];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  class P{
    constructor(){
      this.reset();
      this.y=Math.random()*H; // start anywhere on load
    }
    reset(){
      this.x=Math.random()*W;this.y=H+10;
      this.r=Math.random()*1.8+.4;
      this.color=COLORS[Math.floor(Math.random()*COLORS.length)];
      this.vx=(Math.random()-.5)*.35;this.vy=-(Math.random()*.4+.15);
      this.alpha=Math.random()*.45+.15;
      this.life=Math.random()*300+150;this.age=0;
      this.isHeart=Math.random()<.04;
    }
    update(){this.x+=this.vx;this.y+=this.vy;this.age++;
      if(this.x<0||this.x>W)this.vx*=-1;}
    draw(){
      const fade=Math.sin(Math.PI*this.age/this.life);
      ctx.save();ctx.globalAlpha=this.alpha*fade;
      if(this.isHeart){
        ctx.fillStyle=this.color;ctx.font=`${this.r*8}px serif`;
        ctx.textAlign='center';ctx.fillText('❤',this.x,this.y);
      } else {
        ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle=this.color;ctx.fill();
      }
      ctx.restore();
    }
    dead(){return this.age>this.life;}
  }
  for(let i=0;i<100;i++){const p=new P();p.y=Math.random()*H;particles.push(p);}
  function animate(){
    ctx.clearRect(0,0,W,H);
    particles=particles.filter(p=>{p.update();p.draw();return!p.dead();});
    while(particles.length<100)particles.push(new P());
    // Connections
    ctx.save();
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<100){ctx.beginPath();ctx.globalAlpha=.03*(1-d/100);
        ctx.strokeStyle='#7C3AED';ctx.lineWidth=.5;
        ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}
    }
    ctx.restore();
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── SCRATCH CARD ── */
(function(){
  const cont=document.getElementById('scratchContainer');
  const canvas=document.getElementById('scratchCanvas');
  const ctx=canvas.getContext('2d');
  const reveal=document.getElementById('cardReveal');
  const hint=document.getElementById('scratchHint');
  const cta=document.getElementById('heroCta');
  let drawing=false,revealed=false;

  function resize(){
    canvas.width=cont.offsetWidth;canvas.height=cont.offsetHeight;drawFace();
  }
  function roundRect(c,x,y,w,h,r){
    c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
    c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
    c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();
  }
  function drawFace(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0,'#1a0533');g.addColorStop(.5,'#1a1a2e');g.addColorStop(1,'#001220');
    ctx.fillStyle=g;roundRect(ctx,0,0,canvas.width,canvas.height,28);ctx.fill();
    ctx.strokeStyle='rgba(124,58,237,.5)';ctx.lineWidth=1.5;
    roundRect(ctx,.75,.75,canvas.width-1.5,canvas.height-1.5,27);ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='rgba(255,255,255,.92)';
    ctx.font=`700 ${canvas.width*.075}px 'Cormorant Garamond',serif`;
    ctx.fillText('Reveal Hope ✨',canvas.width/2,canvas.height*.37);
    ctx.font=`500 ${canvas.width*.053}px 'Poppins',sans-serif`;
    ctx.fillStyle='rgba(167,139,250,.88)';
    ctx.fillText('Scratch To Discover Kindness 🌎',canvas.width/2,canvas.height*.63);
  }
  resize();window.addEventListener('resize',resize);

  function pos(e){
    const r=canvas.getBoundingClientRect();
    const t=e.touches?e.touches[0]:e;
    return{x:t.clientX-r.left,y:t.clientY-r.top};
  }
  function scratch(e){
    e.preventDefault();if(!drawing||revealed)return;
    const p=pos(e);
    ctx.globalCompositeOperation='destination-out';
    ctx.beginPath();ctx.arc(p.x,p.y,28,0,Math.PI*2);ctx.fill();
    check();
  }
  function check(){
    if(revealed)return;
    const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let cleared=0;
    for(let i=3;i<d.length;i+=4)if(d[i]===0)cleared++;
    if(cleared/(canvas.width*canvas.height)>.42)doReveal();
  }
  function doReveal(){
    revealed=true;
    ctx.globalCompositeOperation='destination-out';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    reveal.classList.add('shown');
    hint.style.display='none';
    cta.classList.add('shown');
    canvas.style.pointerEvents='none';
    spawnSparkles();
  }
  canvas.addEventListener('mousedown',e=>{drawing=true;scratch(e);});
  canvas.addEventListener('mousemove',scratch);
  canvas.addEventListener('mouseup',()=>drawing=false);
  canvas.addEventListener('mouseleave',()=>drawing=false);
  canvas.addEventListener('touchstart',e=>{drawing=true;scratch(e);},{passive:false});
  canvas.addEventListener('touchmove',scratch,{passive:false});
  canvas.addEventListener('touchend',()=>drawing=false);

  function spawnSparkles(){
    const rect=cont.getBoundingClientRect();
    const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    for(let i=0;i<20;i++){
      const el=document.createElement('div');
      el.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;width:${6+Math.random()*6}px;
      height:${6+Math.random()*6}px;border-radius:50%;pointer-events:none;z-index:9999;
      background:${['#7C3AED','#FF6B6B','#06B6D4','#A78BFA','#FFB3B3'][i%5]};
      transition:all ${.6+Math.random()*.5}s cubic-bezier(0.23,1,0.32,1);opacity:1;`;
      document.body.appendChild(el);
      const a=(i/20)*Math.PI*2,dist=90+Math.random()*70;
      setTimeout(()=>{el.style.transform=`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist}px) scale(0)`;el.style.opacity='0';},10);
      setTimeout(()=>el.remove(),1200);
    }
  }
})();

/* ── NAVBAR ── */
(function(){
  const nav=document.getElementById('navbar');
  const ham=document.getElementById('hamburger');
  const mob=document.getElementById('mobileMenu');
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled',window.scrollY>40);
  });
  ham.addEventListener('click',()=>{
    ham.classList.toggle('open');
    mob.classList.toggle('open');
  });
  // Active section highlight
  const sections=['hero','about','impact','mission','certificates','donate'];
  const links=document.querySelectorAll('.nav-links a');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>{l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id);});
      }
    });
  },{threshold:.4});
  sections.forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el);});
})();
window.closeMobile=function(){
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
};

/* ── THEME TOGGLE ── */
(function(){
  const btn=document.getElementById('themeBtn');
  btn.addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme==='dark';
    document.documentElement.dataset.theme=dark?'light':'dark';
    btn.textContent=dark?'☀️':'🌙';
  });
})();

/* ── SCROLL REVEAL ── */
(function(){
  const els=document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.story-step');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
  },{threshold:.12});
  els.forEach(el=>obs.observe(el));
})();

/* ── ANIMATED COUNTERS ── */
(function(){
  const cards=document.querySelectorAll('.stat-card');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting&&!e.target.classList.contains('counted')){
        e.target.classList.add('counted');
        const num=e.target.querySelector('.stat-num');
        const target=parseInt(e.target.dataset.target);
        const start=performance.now();
        const dur=1800;
        function tick(now){
          const t=Math.min((now-start)/dur,1);
          const ease=1-Math.pow(1-t,3);
          num.textContent=Math.floor(ease*target).toLocaleString()+'+';
          if(t<1)requestAnimationFrame(tick);
          else num.textContent=target.toLocaleString()+'+';
        }
        requestAnimationFrame(tick);
      }
    });
  },{threshold:.4});
  cards.forEach(c=>obs.observe(c));
})();

/* ── HUMANITY WALL ── */
(function(){
  const testimonials=[
    {quote:"You changed my future. I never thought I'd hold a degree.",author:"Priya R.",loc:"Chennai"},
    {quote:"Thank you for supporting education when nobody else did.",author:"Meena K.",loc:"Coimbatore"},
    {quote:"Together we can. And we did. My daughter is an engineer.",author:"Lakshmi D.",loc:"Madurai"},
    {quote:"The laptop you gave me opened a whole new world.",author:"Divya S.",loc:"Trichy"},
    {quote:"She Can Foundation didn't just fund me — they believed in me.",author:"Shalini M.",loc:"Pune"},
    {quote:"I started a business because of the skills training. Thank you.",author:"Reshma A.",loc:"Hyderabad"},
    {quote:"My village finally has clean water. You made it happen.",author:"Kamala P.",loc:"Rural TN"},
    {quote:"I teach 40 children now. It all started with one scholarship.",author:"Nithya J.",loc:"Salem"},
    {quote:"The mentorship program gave me direction when I had none.",author:"Anbu K.",loc:"Bangalore"},
    {quote:"Five girls in my colony got into college. She Can made it real.",author:"Gowri V.",loc:"Vellore"},
  ];
  const hearts=['❤️','💜','💙','🧡','💚'];
  function makeCard(t){
    const div=document.createElement('div');
    div.className='wall-card';
    const h=hearts[Math.floor(Math.random()*hearts.length)];
    div.innerHTML=`
      <div class="wall-quote">"${t.quote}"</div>
      <div class="wall-author">
        <div class="wall-avatar">${h}</div>
        <div><div style="font-size:12px;font-weight:600;color:var(--white);">${t.author}</div>
        <div style="font-size:11px;color:var(--gray2);">${t.loc}</div></div>
      </div>`;
    return div;
  }
  const track=document.getElementById('wallTrack');
  // Double for infinite scroll
  [...testimonials,...testimonials].forEach(t=>track.appendChild(makeCard(t)));
})();

/* ── FLOATING EMOTION CARDS ── */
(function(){
  const cards=['fc1','fc2','fc3'];
  // Show after 2s
  setTimeout(()=>{
    cards.forEach((id,i)=>{
      setTimeout(()=>{
        const el=document.getElementById(id);
        if(el)el.classList.add('visible');
      },i*600);
    });
  },2000);
  // Hide on mobile
  if(window.innerWidth<768){
    cards.forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  }
})();

/* ── DONATE AMOUNT CHIPS ── */
window.setAmount=function(el){
  document.querySelectorAll('.amount-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
};

/* ── EASTER EGG ── */
(function(){
  const logo=document.getElementById('navLogo');
  const popup=document.getElementById('easter-egg');
  let clicks=0,timer=null;
  logo.addEventListener('click',()=>{
    clicks++;
    clearTimeout(timer);
    timer=setTimeout(()=>clicks=0,2500);
    if(clicks>=5){
      popup.classList.add('show');
      spawnEasterParticles();
      clicks=0;
    }
  });
  function spawnEasterParticles(){
    for(let i=0;i<24;i++){
      const el=document.createElement('div');
      const emojis=['❤️','✨','💜','🌟','💖'];
      el.style.cssText=`position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
      pointer-events:none;z-index:9999;font-size:${14+Math.random()*14}px;
      transition:all ${.8+Math.random()*.7}s cubic-bezier(0.23,1,0.32,1);opacity:1;`;
      el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      document.body.appendChild(el);
      const a=(i/24)*Math.PI*2,dist=120+Math.random()*100;
      setTimeout(()=>{
        el.style.transform=`translate(calc(-50% + ${Math.cos(a)*dist}px), calc(-50% + ${Math.sin(a)*dist}px)) scale(0)`;
        el.style.opacity='0';
      },10);
      setTimeout(()=>el.remove(),1600);
    }
  }
})();
</script>