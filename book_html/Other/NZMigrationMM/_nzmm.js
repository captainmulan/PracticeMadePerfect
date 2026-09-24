const NZMM={
  speak(text){if(!('speechSynthesis' in window)){return} window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='my-MM';u.rate=.85;window.speechSynthesis.speak(u)},
  nav(n){const links={1:'001-Original-Post-Groups.html',2:'002-SOP-Home-Ties.html',3:'003-Budget-Room-Rent.html',4:'004-Show-Money-Dependent.html',5:'005-Study-Education-Original.html',6:'006-Planning-Application-Original.html',7:'007-SOP-Settlement-Original.html',8:'008-Work-Family-PTE-Original.html',9:'009-Education-Family-Original.html',10:'010-NZ-Life-Original.html'};return `<div class="nav"><a href="${links[Math.max(1,n-1)]}">← နောက်သို့</a><a href="001-Original-Post-Groups.html">မာတိကာ</a><a href="${links[Math.min(10,n+1)]}">ရှေ့သို့ →</a></div>`},
  escapeHtml(value=''){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[char]));},
  renderPosts(ids=[]){
    const posts=window.NZMM_POSTS || {};
    const requestedId=new URLSearchParams(window.location.search).get('id');
    const safeIds=(ids||[]).filter(id=>posts[id]);
    const selectedIds=requestedId && posts[requestedId] ? [requestedId] : safeIds;
    return selectedIds.map(id=>{
      const post=posts[id];
      const title=post.title || id;
      const text=post.text || '';
      const sourceLink = post.url ? `<div class="post-source"><a href="${this.escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer">Original Facebook post</a></div>` : '';
      if(selectedIds.length===1){
        return `<article class="source-post single-post" id="article-${id}"><div class="post-meta">Local copy · kept inside NZMigrationMM app</div>${sourceLink}<h2>${this.escapeHtml(title)}</h2><div class="post-body"><pre>${this.escapeHtml(text)}</pre></div></article>`;
      }
      return `<details class="source-post" id="article-${id}"><summary><h2>${this.escapeHtml(title)}</h2></summary><div class="post-body"><div class="post-meta">Local copy · kept inside NZMigrationMM app</div>${sourceLink}<pre>${this.escapeHtml(text)}</pre></div></details>`;
    }).join('');
  },
  initHome(){
    const app=document.querySelector('[data-nzmm-app]');
    if(!app)return;
    const search=app.querySelector('[data-search]');
    const empty=app.querySelector('[data-empty]');
    const filterButtons=[...app.querySelectorAll('[data-filter]')];
    const authorFilterRow=app.querySelector('#author-filter-row');
    const totalCountEl=app.querySelector('#nzmm-total-count');
    const categoryCountEls=[...app.querySelectorAll('[data-count]')];
    const categoryMap=window.NZMM_CATEGORIES||{};
    const posts=window.NZMM_POSTS||{};
    const textPostIds=Object.keys(posts);
    const totalPosts=textPostIds.length;
    const authorNames=['Kiwi Land','Crystal'];
    const authorCounts=textPostIds.reduce((acc,id)=>{
      const source=posts[id]||{};
      const name=/crystal/i.test(`${source.title || ''} ${source.text || ''}`)?'Crystal':'Kiwi Land';
      acc[name]=(acc[name]||0)+1;
      return acc;
    },{});
    const getAuthorForId=(id)=>{
      const source=posts[id]||{};
      return /crystal/i.test(`${source.title || ''} ${source.text || ''}`)?'Crystal':'Kiwi Land';
    };
    const getCategoryCount=(category, author='all')=>{
      const ids=(categoryMap[category]||[]).filter(id=>posts[id]);
      if(author==='all')return ids.length;
      return ids.filter(id=>getAuthorForId(id)===author).length;
    };
    const getTotalCount=(author='all')=>{
      if(author==='all')return textPostIds.length;
      return textPostIds.filter(id=>getAuthorForId(id)===author).length;
    };
    if(authorFilterRow){
      authorFilterRow.innerHTML='';
      const allBtn=document.createElement('button');
      allBtn.type='button';
      allBtn.className='filter-button is-active';
      allBtn.dataset.author='all';
      allBtn.textContent=`ALL AUTHORS (${totalPosts})`;
      authorFilterRow.appendChild(allBtn);
      authorNames.forEach(name=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='filter-button';
        btn.dataset.author=name;
        btn.textContent=`${name.toUpperCase()} (${authorCounts[name]||0})`;
        authorFilterRow.appendChild(btn);
      });
    }
    const refreshSummary=()=>{
      const activeAuthor=app.querySelector('#author-filter-row .filter-button.is-active')?.dataset.author||'all';
      if(totalCountEl) totalCountEl.textContent=String(getTotalCount(activeAuthor));
      categoryCountEls.forEach(el=>{
        const key=el.dataset.count;
        el.textContent=String(getCategoryCount(key, activeAuthor));
      });
    };
    refreshSummary();
    const detailPageByTopic={
      planning:'006-Planning-Application-Original.html',
      visa:'008-Work-Family-PTE-Original.html',
      school:'005-Study-Education-Original.html',
      money:'004-Show-Money-Dependent.html',
      family:'009-Education-Family-Original.html',
      arrival:'007-SOP-Settlement-Original.html'
    };
    const buildLibraryFromData=()=>{
      if(!app.querySelector('.library-tree'))return;
      const libraryTree=app.querySelector('.library-tree');
      const activeTopic=(app.querySelector('[data-filter].is-active')?.dataset.filter)||'all';
      const activeAuthor=(app.querySelector('#author-filter-row .filter-button.is-active')?.dataset.author)||'all';
      const order=['planning','visa','school','money','family','arrival'];
      libraryTree.innerHTML='';
      order.forEach(topic=>{
        const ids=((window.NZMM_CATEGORIES||{})[topic]||[]).filter(id=>posts[id]).filter(id=>{
          const matchesAuthor = activeAuthor === 'all' || getAuthorForId(id) === activeAuthor;
          const matchesTopic = activeTopic === 'all' || activeTopic === topic;
          return matchesAuthor && matchesTopic;
        });
        if(!ids.length) return;
        const branch=document.createElement('div');
        branch.className='tree-branch';
        branch.id=topic;
        branch.dataset.branch=topic;
        const header=document.createElement('h2');
        header.textContent=topic.toUpperCase();
        branch.appendChild(header);
        const children=document.createElement('div');
        children.className='tree-children';
        const articles=document.createElement('div');
        articles.className='tree-articles';
        ids.forEach(id=>{
          const post=posts[id];
          if(!post)return;
          const article=document.createElement('article');
          article.className='app-article';
          article.dataset.article='';
          article.dataset.topic=topic;
          article.dataset.postId=id;
          article.dataset.author=getAuthorForId(id);
          article.dataset.title=post.title || id;
          const detailHref=(detailPageByTopic[topic] || '001-Original-Post-Groups.html');
          article.dataset.detailHref=`${detailHref}?id=${encodeURIComponent(id)}`;
          const tag=document.createElement('div');
          tag.className='tag';
          tag.textContent=`${topic.toUpperCase()} · ${getAuthorForId(id).toUpperCase()}`;
          const heading=document.createElement('h4');
          heading.textContent=post.title || id;
          const summary=document.createElement('p');
          const raw=(post.text||'').replace(/\s+/g,' ').trim();
          summary.textContent=raw.length>160?`${raw.slice(0,160)}…`:raw;
          article.appendChild(tag);
          article.appendChild(heading);
          article.appendChild(summary);
          article.addEventListener('click',event=>{
            if(event.target.closest('button, input, a'))return;
            window.location.href=article.dataset.detailHref;
          });
          articles.appendChild(article);
        });
        if(articles.children.length){
          children.appendChild(articles);
          branch.appendChild(children);
          libraryTree.appendChild(branch);
        }
      });
    };
    buildLibraryFromData();
    const cards=[...app.querySelectorAll('[data-article]')];
    const getAuthor=(card)=>{
      const heading=(card.querySelector('h4')?.textContent||'').toLowerCase();
      if(heading.includes('crystal'))return 'Crystal';
      return 'Kiwi Land';
    };
    cards.forEach(card=>{
      card.dataset.author=getAuthor(card);
      const tag=card.querySelector(':scope > .tag');
      if(tag){tag.classList.add('card-tags');}
      const summary=card.querySelector(':scope > p');
      if(summary&&!card.querySelector(':scope > .overview-label')){
        const label=document.createElement('div');
        label.className='overview-label';
        label.textContent='Summary:';
        summary.classList.add('overview-details');
        card.insertBefore(label,summary);
      }
      const detailHref=card.dataset.detailHref;
      if(detailHref){
        card.dataset.clickable='true';
        card.addEventListener('click',event=>{
          if(event.target.closest('button, input, a'))return;
          window.location.href=detailHref;
        });
      }
    });
    const apply=()=>{
      buildLibraryFromData();
      const cardsAfterBuild=[...app.querySelectorAll('[data-article]')];
      const query=(search?.value||'').trim().toLowerCase();
      const active=app.querySelector('[data-filter].is-active')?.dataset.filter||'all';
      const activeAuthor=app.querySelector('#author-filter-row .filter-button.is-active')?.dataset.author||'all';
      let visible=0;
      cardsAfterBuild.forEach(card=>{
        const matchesTopic=active==='all'||card.dataset.topic===active;
        const matchesAuthor=activeAuthor==='all'||card.dataset.author===activeAuthor;
        const matchesText=!query||card.textContent.toLowerCase().includes(query);
        card.hidden=!(matchesTopic&&matchesAuthor&&matchesText);
        if(!card.hidden)visible++;
      });
      refreshSummary();
      if(empty)empty.hidden=visible>0;
    };
    search?.addEventListener('input',apply);
    filterButtons.forEach(button=>button.addEventListener('click',()=>{filterButtons.forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');apply()}));
    const authorButtons=[...app.querySelectorAll('#author-filter-row .filter-button')];
    authorButtons.forEach(button=>button.addEventListener('click',()=>{authorButtons.forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');apply()}));
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
