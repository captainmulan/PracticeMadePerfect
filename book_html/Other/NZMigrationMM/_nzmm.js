const NZMM={
  speak(text){if(!('speechSynthesis' in window)){return} window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='my-MM';u.rate=.85;window.speechSynthesis.speak(u)},
  nav(n){const links={1:'001-Original-Post-Groups.html',2:'002-SOP-Home-Ties.html',3:'003-Budget-Room-Rent.html',4:'004-Show-Money-Dependent.html',5:'005-Study-Education-Original.html',6:'006-Planning-Application-Original.html',7:'007-SOP-Settlement-Original.html',8:'008-Work-Family-PTE-Original.html',9:'009-Education-Family-Original.html',10:'010-NZ-Life-Original.html'};return `<div class="nav"><a href="${links[Math.max(1,n-1)]}">← နောက်သို့</a><a href="001-Original-Post-Groups.html">မာတိကာ</a><a href="${links[Math.min(10,n+1)]}">ရှေ့သို့ →</a></div>`},
  initHome(){
    const app=document.querySelector('[data-nzmm-app]');
    if(!app)return;
    const search=app.querySelector('[data-search]');
    const empty=app.querySelector('[data-empty]');
    const filterButtons=[...app.querySelectorAll('[data-filter]')];
    app.querySelectorAll('.library-tree > .tree-branch').forEach(branch=>{
      const cards=[...branch.querySelectorAll('[data-article]')];
      const shelf=document.createElement('div');
      shelf.className='tree-articles';
      cards.forEach(card=>shelf.appendChild(card));
      branch.querySelectorAll(':scope > .tree-children, :scope > .tree-articles').forEach(node=>node.remove());
      branch.appendChild(shelf);
    });
    const cards=[...app.querySelectorAll('[data-article]')];
    cards.forEach(card=>{
      const tag=card.querySelector(':scope > .tag');
      if(tag){
        tag.classList.add('card-tags');
        tag.textContent=`Tag: ${tag.textContent.replace(/\s+·\s+/g, ', ')}`;
        card.appendChild(tag);
      }
      const summary=card.querySelector(':scope > p');
      if(summary&&!card.querySelector(':scope > .overview-label')){
        const label=document.createElement('div');
        label.className='overview-label';
        label.textContent='Details:';
        summary.classList.add('overview-details');
        card.insertBefore(label,summary);
      }
      const link=card.querySelector(':scope > a');
      const detailHref=card.dataset.detailHref;
      if(detailHref){
        card.dataset.clickable='true';
        card.addEventListener('click',event=>{
          if(event.target.closest('button, input, a'))return;
          window.location.href=detailHref;
        });
      }else if(link){
        link.classList.add('read-more');
        link.textContent='Read more →';
        card.dataset.clickable='true';
        card.addEventListener('click',event=>{
          if(event.target.closest('button, input, a'))return;
          if(link.href)window.location.href=link.href;
        });
      }else if(card.querySelector(':scope > button')){
        card.dataset.clickable='true';
        card.addEventListener('click',event=>{
          if(event.target.closest('button, input'))return;
          card.querySelector(':scope > button').click();
        });
      }
    });
    const apply=()=>{
      const query=(search?.value||'').trim().toLowerCase();
      const active=app.querySelector('[data-filter].is-active')?.dataset.filter||'all';
      let visible=0;
      cards.forEach(card=>{
        const matchesTopic=active==='all'||card.dataset.topic===active;
        const matchesText=!query||card.textContent.toLowerCase().includes(query);
        card.hidden=!(matchesTopic&&matchesText);
        if(!card.hidden)visible++;
      });
      if(empty)empty.hidden=visible>0;
    };
    search?.addEventListener('input',apply);
    filterButtons.forEach(button=>button.addEventListener('click',()=>{filterButtons.forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');apply()}));
    app.querySelectorAll('[data-check]').forEach(check=>{
      const key=`nzmm-check-${check.dataset.check}`;
      check.checked=localStorage.getItem(key)==='1';
      check.addEventListener('change',()=>localStorage.setItem(key,check.checked?'1':'0'));
    });
    app.querySelectorAll('[data-expand]').forEach(button=>button.addEventListener('click',()=>{
      const panel=app.querySelector(`#${button.getAttribute('aria-controls')}`);
      const open=panel?.hasAttribute('hidden');
      if(!panel)return;
      panel.toggleAttribute('hidden',!open);button.setAttribute('aria-expanded',String(open));
    }));
    apply();
  }
};
document.addEventListener('DOMContentLoaded',()=>{NZMM.initHome()});
