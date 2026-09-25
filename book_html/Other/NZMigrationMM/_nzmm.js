const NZMM={
  escapeHtml(value=''){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[char]));},
  async loadCollection(){
    try{
      const response=await fetch('data/collection.json');
      if(!response.ok)throw new Error(`Collection request failed: ${response.status}`);
      return response.json();
    }catch(error){
      if(window.NZMM_COLLECTION_FALLBACK)return window.NZMM_COLLECTION_FALLBACK;
      throw error;
    }
  },
  formatText(value=''){return this.escapeHtml(value).replace(/\n/g,'<br>');},
  editStorageKey(key){return `nzmm-article-edit:${key}`;},
  getEditedRecord(record){
    try{
      const saved=JSON.parse(localStorage.getItem(this.editStorageKey(record.key))||'null');
      return saved?{...record,title:saved.title||record.title,text:saved.text??record.text}:record;
    }catch(error){
      return record;
    }
  },
  categorySequences:{planning:[1,2,3,4,5,6,7,8,9,24,31,33,35],visa:[17,18,19,21,26,27,28,29,30,32,34],school:[1,2,3,6,7,8,9,10,13,14,15,31,35],money:[1,4,5,6,7,8,10,18,35],family:[13,14,15,17,18,30,35],arrival:[11,12,13,14,15,16,20,22,23,25,35]},
  getCategory(record){return Object.keys(this.categorySequences).find(category=>this.categorySequences[category].includes(record.sequence))||'planning';},
  getAuthor(record){return /crystal/i.test(`${record.title||''} ${record.text||''}`)?'Crystal':'Kiwi Land';},
  getTextPosts(collection){return (collection.records||[]).filter(record=>record.kind==='post');},
  renderCard(record){
    const summary=(record.text||'').replace(/\s+/g,' ').trim();
    const status=record.status||record.kind||'record';
    return `<article class="collection-card" data-category="${this.getCategory(record)}" data-author="${this.escapeHtml(this.getAuthor(record))}"><div class="collection-meta">${String(record.sequence).padStart(2,'0')} · ${this.escapeHtml(status)} · ${this.escapeHtml(this.getAuthor(record))}</div><h2>${this.escapeHtml(record.title||record.key)}</h2><p>${this.escapeHtml(summary.length>190?`${summary.slice(0,190)}...`:summary)}</p><a class="read-link" href="article.html?id=${encodeURIComponent(record.key)}">Read article <span aria-hidden="true">→</span></a></article>`;
  },
  async initDirectory(){
    const app=document.querySelector('[data-nzmm-directory]');
    if(!app)return;
    if(app.nzmmRefresh){await app.nzmmRefresh();return;}
    const list=app.querySelector('[data-collection-list]');
    const search=app.querySelector('[data-search]');
    const count=app.querySelector('[data-count]');
    const empty=app.querySelector('[data-empty]');
    const categoryFilters=[...app.querySelectorAll('[data-category]')];
    const authorFilters=[...app.querySelectorAll('[data-author]')];
    try{
      const collection=await this.loadCollection();
      let records=this.getTextPosts(collection).map(record=>this.getEditedRecord(record));
      const refreshButtons=()=>{
        const category=app.querySelector('[data-category].is-active')?.dataset.category||'all';
        const author=app.querySelector('[data-author].is-active')?.dataset.author||'all';
        categoryFilters.forEach(button=>{
          const total=category==='all'?records.length:records.filter(record=>this.getCategory(record)===button.dataset.category).length;
          button.textContent=`${button.dataset.category==='all'?'ALL TOPICS':button.dataset.category.toUpperCase()} (${total})`;
        });
        authorFilters.forEach(button=>{
          const total=author==='all'?records.filter(record=>this.getAuthor(record)===button.dataset.author).length:records.filter(record=>this.getAuthor(record)===button.dataset.author).length;
          button.textContent=`${button.dataset.author==='all'?'ALL AUTHORS':button.dataset.author.toUpperCase()} (${total})`;
        });
      };
      const render=()=>{
        const query=(search?.value||'').trim().toLowerCase();
        const category=app.querySelector('[data-category].is-active')?.dataset.category||'all';
        const author=app.querySelector('[data-author].is-active')?.dataset.author||'all';
        const filtered=records.filter(record=>{
          const matchesQuery=`${record.title||''} ${record.text||''} ${record.status||''}`.toLowerCase().includes(query);
          return matchesQuery&&(category==='all'||this.getCategory(record)===category)&&(author==='all'||this.getAuthor(record)===author);
        });
        list.innerHTML=filtered.map(record=>this.renderCard(record)).join('');
        count.textContent=String(filtered.length);
        empty.hidden=filtered.length>0;
      };
      app.nzmmRefresh=async()=>{
        const refreshed=await this.loadCollection();
        records=this.getTextPosts(refreshed).map(record=>this.getEditedRecord(record));
        refreshButtons();
        render();
      };
      categoryFilters.forEach(button=>button.addEventListener('click',()=>{categoryFilters.forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');refreshButtons();render();}));
      authorFilters.forEach(button=>button.addEventListener('click',()=>{authorFilters.forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');refreshButtons();render();}));
      search?.addEventListener('input',render);
      refreshButtons();
      render();
    }catch(error){
      list.innerHTML='<p class="load-error">Collection could not be loaded.</p>';
      count.textContent='0';
      console.error(error);
    }
  },
  async initArticle(){
    const app=document.querySelector('[data-nzmm-article]');
    if(!app)return;
    try{
      const collection=await this.loadCollection();
      const key=new URLSearchParams(window.location.search).get('id');
      const record=this.getTextPosts(collection).find(item=>item.key===key);
      if(!record)throw new Error('Article not found');
      const title=app.querySelector('[data-article-title]');
      const body=app.querySelector('[data-article-body]');
      const editButton=app.querySelector('[data-edit-article]');
      const saveButton=app.querySelector('[data-save-article]');
      const cancelButton=app.querySelector('[data-cancel-article]');
      const resetButton=app.querySelector('[data-reset-article]');
      let saved={};
      try{saved=JSON.parse(localStorage.getItem(this.editStorageKey(key))||'{}');}catch(error){console.warn('Saved article edit could not be read.',error);}
      const original={title:record.title||record.key,text:record.text||''};
      const current={title:saved.title||original.title,text:saved.text||original.text};
      const setEditMode=(editing)=>{
        title.contentEditable=String(editing);
        body.contentEditable=String(editing);
        editButton.hidden=editing;
        saveButton.hidden=!editing;
        cancelButton.hidden=!editing;
        resetButton.hidden=!editing;
      };
      const renderArticle=(value)=>{
        title.textContent=value.title;
        body.innerHTML=this.formatText(value.text);
        document.title=`${value.title} | NZMigrationMM`;
      };
      document.title=`${current.title} | NZMigrationMM`;
      title.textContent=current.title;
      app.querySelector('[data-article-meta]').textContent=`Record ${String(record.sequence).padStart(2,'0')} · ${record.status||record.kind||'collection item'}`;
      body.innerHTML=this.formatText(current.text);
      const source=app.querySelector('[data-source-link]');
      if(record.sourceUrl){source.href=record.sourceUrl;source.hidden=false;}
      else source.hidden=true;
      editButton.addEventListener('click',()=>{
        setEditMode(true);
        title.focus();
      });
      saveButton.addEventListener('click',()=>{
        const edited={title:title.textContent.trim()||current.title,text:(body.innerText||body.textContent||'').trim()};
        localStorage.setItem(this.editStorageKey(key),JSON.stringify(edited));
        current.title=edited.title;
        current.text=edited.text;
        renderArticle(current);
        setEditMode(false);
      });
      cancelButton.addEventListener('click',()=>{
        renderArticle(current);
        setEditMode(false);
      });
      resetButton.addEventListener('click',()=>{
        localStorage.removeItem(this.editStorageKey(key));
        current.title=original.title;
        current.text=original.text;
        renderArticle(current);
        setEditMode(false);
      });
    }catch(error){
      app.querySelector('[data-article-title]').textContent='Article unavailable';
      app.querySelector('[data-article-body]').textContent='The requested collection record could not be found.';
      console.error(error);
    }
  }
};
document.addEventListener('DOMContentLoaded',()=>{NZMM.initDirectory();NZMM.initArticle()});
window.addEventListener('pageshow',()=>NZMM.initDirectory());
