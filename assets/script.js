(function(){
  const menu=document.querySelector('.menu-btn');
  const nav=document.querySelector('.nav-links');
  if(menu&&nav){
    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',open?'true':'false');
      menu.setAttribute('aria-label',open?'Close menu':'Open menu'); document.body.classList.toggle('menu-open',open);
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open')}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');menu.focus();document.body.classList.remove('menu-open');}});
  }

  const current=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.nav-links a[data-page]').forEach(a=>{
    if(a.getAttribute('data-page')===current || (['mynuclo.html','autocrud.html','testkase.html','ortum.html','onified.html','vital-ai.html'].includes(current) && a.getAttribute('data-page')==='portfolio.html')) {a.classList.add('active');a.setAttribute('aria-current','page');}
  });

  // Section-aware scroll reveals: every section gets its own entrance language,
  // while child components cascade in after the section enters the viewport.
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        const section=e.target.closest('.home-section');
        if(section) section.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    })
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

  const sectionObserver=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('is-visible');
    });
  },{threshold:.08,rootMargin:'0px 0px -10% 0px'});
  document.querySelectorAll('.home-section').forEach(section=>sectionObserver.observe(section));

  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  // Scroll-triggered metric counters. Animate only standalone numeric values.
  // Tokens embedded inside words such as B2B / E2E are intentionally excluded.
  const counterTargets=[...document.querySelectorAll('.stat strong, .project-metric strong, [data-counter]')].filter(el=>{
    const text=el.textContent||'';
    return [...text.matchAll(/[-+]?\d+(?:\.\d+)?/g)].some(m=>{
      const before=text[m.index-1]||'';
      const after=text[m.index+m[0].length]||'';
      return !/[A-Za-z]/.test(before) && !/[A-Za-z]/.test(after);
    });
  });
  if(counterTargets.length){
    const animateCounter=el=>{
      if(el.dataset.counterAnimated==='true') return;
      el.dataset.counterAnimated='true';
      const original=el.textContent;
      const tokenRegex=/[-+]?\d+(?:\.\d+)?/g;
      const matches=[...original.matchAll(tokenRegex)];
      const numericMatches=matches.filter(m=>{
        const before=original[m.index-1]||'';
        const after=original[m.index+m[0].length]||'';
        return !/[A-Za-z]/.test(before) && !/[A-Za-z]/.test(after);
      });
      if(!numericMatches.length) return;
      const values=numericMatches.map(m=>Number(m[0]));
      const decimals=values.map(v=>String(v).includes('.')?String(v).split('.')[1].length:0);
      const start=performance.now();
      const duration=1200;
      const ease=t=>1-Math.pow(1-t,3);
      const render=now=>{
        const progress=Math.min(1,(now-start)/duration);
        const eased=ease(progress);
        let index=0;
        el.textContent=original.replace(tokenRegex,(match, offset)=>{
          const before=original[offset-1]||'';
          const after=original[offset+match.length]||'';
          if(/[A-Za-z]/.test(before)||/[A-Za-z]/.test(after)) return match;
          const target=values[index];
          const precision=decimals[index++];
          const value=target*eased;
          return precision ? value.toFixed(precision) : Math.round(value).toString();
        });
        if(progress<1) requestAnimationFrame(render);
        else el.textContent=original;
      };
      requestAnimationFrame(render);
    };
    const counterObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },{threshold:.35,rootMargin:'0px 0px -8% 0px'});
    counterTargets.forEach(el=>counterObserver.observe(el));
  }

  const caseTabs=[...document.querySelectorAll('[data-case-tab]')];
  const caseSections=caseTabs.map(a=>document.getElementById(a.dataset.caseTab)).filter(Boolean);
  if(caseTabs.length&&caseSections.length){
    const setCaseTab=id=>caseTabs.forEach(a=>{const active=a.dataset.caseTab===id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const tabObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
      if(visible[0]) setCaseTab(visible[0].target.id);
    },{rootMargin:'-18% 0px -62% 0px',threshold:[0,.15,.35,.6]});
    caseSections.forEach(sec=>tabObserver.observe(sec));
    caseTabs.forEach(a=>a.addEventListener('click',()=>setCaseTab(a.dataset.caseTab)));
  }


  const filters=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('.work-card[data-category]')];
  const filterStatus=document.querySelector('.filter-status');
  if(filters.length&&cards.length){
    const labels={all:'all projects',product:'product design projects',web:'web design projects',mobile:'mobile app projects'};
    const applyFilter=(value)=>{
      cards.forEach(card=>{
        const match=value==='all'||card.dataset.category.split(/\s+/).includes(value);
        card.classList.toggle('is-hidden',!match);
        if(match) card.classList.add('visible');
      });
      filters.forEach(btn=>{const active=btn.dataset.filter===value;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false')});
      if(filterStatus) filterStatus.textContent='Showing '+labels[value];
    };
    filters.forEach(btn=>btn.addEventListener('click',()=>applyFilter(btn.dataset.filter)));
  }

  const contactForm=document.querySelector('#contactForm');
  if(contactForm){
    contactForm.addEventListener('submit',e=>{
      e.preventDefault();
      const name=contactForm.querySelector('[name="name"]').value.trim();
      const email=contactForm.querySelector('[name="email"]').value.trim();
      const company=contactForm.querySelector('[name="company"]').value.trim();
      const message=contactForm.querySelector('[name="message"]').value.trim();
      const subject=encodeURIComponent('Portfolio enquiry from '+name+(company?' — '+company:''));
      const body=encodeURIComponent('Name: '+name+'\nEmail: '+email+'\nCompany: '+company+'\n\n'+message);
      window.location.href='mailto:sachin.kumar.katageri@gmail.com?subject='+subject+'&body='+body;
    });
  }

  // Premium micro-interactions: progress, pointer glow, tilt, lightbox and back-to-top.
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=document.createElement('div');
  progress.className='scroll-progress';
  document.body.prepend(progress);

  const updateScrollUI=()=>{
    const doc=document.documentElement;
    const max=doc.scrollHeight-window.innerHeight;
    progress.style.width=(max>0?(window.scrollY/max)*100:0)+'%';
    const top=document.querySelector('.back-top');
    if(top) top.classList.toggle('show',window.scrollY>520);
  };
  window.addEventListener('scroll',updateScrollUI,{passive:true});
  updateScrollUI();

  const topBtn=document.createElement('button');
  topBtn.className='back-top';
  topBtn.type='button';
  topBtn.setAttribute('aria-label','Back to top');
  topBtn.innerHTML='↑';
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));

  if(!reduceMotion && window.matchMedia('(pointer:fine)').matches){
    const glow=document.createElement('div');
    glow.className='cursor-glow';
    document.body.appendChild(glow);
    window.addEventListener('pointermove',e=>{
      glow.style.left=e.clientX+'px';
      glow.style.top=e.clientY+'px';
    },{passive:true});

    document.querySelectorAll('.work-card,.stat,.step,.principle,.timeline-card').forEach(card=>{
      card.classList.add('js-tilt');
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        card.style.setProperty('--mx',(x*100)+'%');
        card.style.setProperty('--my',(y*100)+'%');
        if(card.classList.contains('work-card')){
          card.style.transform=`perspective(1100px) rotateX(${(0.5-y)*3}deg) rotateY(${(x-0.5)*4}deg) translateY(-7px)`;
        }
      });
      card.addEventListener('pointerleave',()=>{
        card.style.removeProperty('transform');
      });
    });

    const heroImage=document.querySelector('.hero-profile-image');
    if(heroImage){
      const heroSide=heroImage.closest('.hero-side');
      heroSide?.addEventListener('pointermove',e=>{
        const r=heroSide.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        heroImage.style.transform=`translate(${x*8}px,${y*6}px)`;
      });
      heroSide?.addEventListener('pointerleave',()=>heroImage.style.removeProperty('transform'));
    }
  }

  // Apple-style project carousel: horizontal snap, drag/swipe, controls and keyboard navigation.
  document.querySelectorAll('[data-apple-carousel]').forEach(root=>{
    const track=root.querySelector('.apple-carousel');
    const cards=[...root.querySelectorAll('.apple-card')];
    const prev=root.querySelector('[data-carousel-prev]');
    const next=root.querySelector('[data-carousel-next]');
    const dots=root.querySelector('.apple-carousel-dots');
    if(!track||!cards.length) return;

    cards.forEach((card,i)=>{
      const dot=document.createElement('button');
      dot.type='button'; dot.className='apple-carousel-dot';
      dot.setAttribute('aria-label',`Go to project ${i+1}`);
      dot.addEventListener('click',()=>card.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'nearest',inline:'start'}));
      dots?.appendChild(dot);
    });
    const dotsList=dots?[...dots.children]:[];
    let active=0;
    const update=()=>{
      const left=track.scrollLeft;
      let closest=0, distance=Infinity;
      cards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft-left);if(d<distance){distance=d;closest=i;}});
      active=closest;
      dotsList.forEach((dot,i)=>dot.classList.toggle('is-active',i===active));
      if(prev) prev.disabled=active===0;
      if(next) next.disabled=active===cards.length-1;
    };
    const move=direction=>{
      const target=Math.max(0,Math.min(cards.length-1,active+direction));
      cards[target].scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'nearest',inline:'start'});
    };
    prev?.addEventListener('click',()=>move(-1));
    next?.addEventListener('click',()=>move(1));
    track.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
    track.addEventListener('keydown',e=>{
      if(e.key==='ArrowRight'){e.preventDefault();move(1)}
      if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
    });

    let down=false,startX=0,startScroll=0,moved=false;
    track.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0) return;
      down=true;moved=false;startX=e.clientX;startScroll=track.scrollLeft;track.classList.add('is-dragging');track.setPointerCapture?.(e.pointerId);
    });
    track.addEventListener('pointermove',e=>{
      if(!down) return;
      const dx=e.clientX-startX;
      if(Math.abs(dx)>5)moved=true;
      track.scrollLeft=startScroll-dx;
    });
    const release=e=>{if(!down)return;down=false;track.classList.remove('is-dragging');try{track.releasePointerCapture?.(e.pointerId)}catch(_){} if(moved) track.dataset.justDragged='true';setTimeout(()=>delete track.dataset.justDragged,80);update()};
    track.addEventListener('pointerup',release);track.addEventListener('pointercancel',release);

    cards.forEach(card=>card.addEventListener('click',e=>{
      if(track.dataset.justDragged==='true') return;
      const href=card.dataset.href;
      if(href) location.href=href;
    }));
    update();
  });

  // Reference-inspired product mode tabs on the homepage.
  const refTabs=[...document.querySelectorAll('[data-ref-tab]')];
  const refPanels=[...document.querySelectorAll('[data-ref-panel]')];
  if(refTabs.length&&refPanels.length){
    const activateRefTab=value=>{
      refTabs.forEach(tab=>{
        const active=tab.dataset.refTab===value;
        tab.classList.toggle('active',active);
        tab.setAttribute('aria-selected',active?'true':'false');
      });
      refPanels.forEach(panel=>panel.classList.toggle('active',panel.dataset.refPanel===value));
    };
    refTabs.forEach(tab=>tab.addEventListener('click',()=>activateRefTab(tab.dataset.refTab)));
  }

  // Case-study image lightbox.
  const galleryImages=[...document.querySelectorAll('.case-gallery img')];
  if(galleryImages.length){
    const box=document.createElement('div');
    box.className='lightbox';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
    box.setAttribute('aria-label','Image preview');
    box.innerHTML='<button class="lightbox-close" type="button" aria-label="Close image preview">×</button><img alt=""><div class="lightbox-caption"></div>';
    document.body.appendChild(box);
    const image=box.querySelector('img');
    const caption=box.querySelector('.lightbox-caption');
    const close=()=>{box.classList.remove('open');document.body.style.overflow='';};
    box.querySelector('.lightbox-close').addEventListener('click',close);
    box.addEventListener('click',e=>{if(e.target===box)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('open'))close()});
    galleryImages.forEach(img=>img.addEventListener('click',()=>{
      image.src=img.currentSrc||img.src;
      image.alt=img.alt||'Case study image';
      caption.textContent=img.alt||'';
      box.classList.add('open');
      document.body.style.overflow='hidden';
    }));
  }

  // Smooth internal navigation with a subtle page fade.
  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href');
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target==='_blank') return;
    link.addEventListener('click',e=>{
      if(reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url=new URL(href,location.href);
      if(url.origin!==location.origin) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(()=>location.href=url.href,140);
    });
  });

})();


(function(){
  const cards=[...document.querySelectorAll('.pro-project-card')];
  if(!cards.length || !window.matchMedia('(pointer:fine)').matches) return;
  const cursor=document.createElement('div');
  cursor.className='case-hover-cursor';
  cursor.innerHTML='<span>View case study</span><b>↗</b>';
  document.body.appendChild(cursor);
  let active=false;
  const move=e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'};
  cards.forEach(card=>{
    card.addEventListener('mouseenter',()=>{active=true;cursor.classList.add('is-visible')});
    card.addEventListener('mousemove',move,{passive:true});
    card.addEventListener('mouseleave',()=>{active=false;cursor.classList.remove('is-visible')});
    card.addEventListener('focusin',()=>cursor.classList.add('is-visible'));
    card.addEventListener('focusout',()=>cursor.classList.remove('is-visible'));
  });
})();


// Mobile bottom navigation active state
document.querySelectorAll('.mobile-bottom-nav').forEach(function(nav){
  var current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  nav.querySelectorAll('a[data-bottom-page]').forEach(function(link){
    var page=(link.getAttribute('data-bottom-page')||'').toLowerCase();
    if(current===page){ link.classList.add('is-active'); link.setAttribute('aria-current','page'); }
  });
});


