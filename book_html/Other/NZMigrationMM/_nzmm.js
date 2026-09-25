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
  deletedStorageKey(key){return `nzmm-article-deleted:${key}`;},
  isDeleted(key){return localStorage.getItem(this.deletedStorageKey(key))==='true';},
  getCategory(record){return String(record.category||Object.keys(this.categorySequences).find(category=>this.categorySequences[category].includes(record.sequence))||'planning').trim().toLowerCase();},
  getTab(record){return String(record.tab||this.getAuthor(record)).trim()||'Kiwi Land';},
  getTags(record){return Array.isArray(record.tags)?record.tags.filter(Boolean):String(record.tags||record.tag||'').split(',').map(tag=>tag.trim()).filter(Boolean);},
  categorySequences:{planning:[1,2,3,4,5,6,7,8,9,24,31,33,35],visa:[17,18,19,21,26,27,28,29,30,32,34],school:[1,2,3,6,7,8,9,10,13,14,15,31,35],money:[1,4,5,6,7,8,10,18,35],family:[13,14,15,17,18,30,35],arrival:[11,12,13,14,15,16,20,22,23,25,35]},
  getEditedRecord(record){
    try{
      const saved=JSON.parse(localStorage.getItem(this.editStorageKey(record.key))||'null');
      return saved?{...record,...saved,title:saved.title||record.title,text:saved.text??record.text}:record;
    }catch(error){
      return record;
    }
  },
  getAuthor(record){return /crystal/i.test(`${record.title||''} ${record.text||''}`)?'Crystal':'Kiwi Land';},
  getTextPosts(collection){return (collection.records||[]).filter(record=>record.kind==='post');},
  renderCard(record){
    if(this.isDeleted(record.key))return '';
    const summary=(record.text||'').replace(/\s+/g,' ').trim();
    const status=record.status||record.kind||'record';
    const tags=this.getTags(record).map(tag=>`#${this.escapeHtml(tag)}`).join(' ');
    return `<article class="collection-card" data-category="${this.escapeHtml(this.getCategory(record))}" data-author="${this.escapeHtml(this.getTab(record))}"><div class="collection-meta">${String(record.sequence).padStart(2,'0')} · ${this.escapeHtml(status)} · ${this.escapeHtml(this.getTab(record))}</div><h2>${this.escapeHtml(record.title||record.key)}</h2><p>${this.escapeHtml(summary.length>190?`${summary.slice(0,190)}...`:summary)}</p>${tags?`<div class="collection-tags">${tags}</div>`:''}<a class="read-link" href="article.html?id=${encodeURIComponent(record.key)}">Read article <span aria-hidden="true">→</span></a></article>`;
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
      let records=this.getTextPosts(collection).filter(record=>!this.isDeleted(record.key)).map(record=>this.getEditedRecord(record));
      const addFilterButtons=(buttons,attribute,values,parent)=>{
        [...new Set(values.filter(Boolean))].forEach(value=>{
          if(buttons.some(button=>button.dataset[attribute]===value)||[...parent.querySelectorAll('button')].some(button=>button.dataset[attribute]===value))return;
          const button=document.createElement('button');
          button.className='filter-button';
          button.type='button';
          button.dataset[attribute]=value;
          parent.appendChild(button);
          buttons.push(button);
        });
      };
      addFilterButtons(categoryFilters,'category',records.map(record=>this.getCategory(record)),categoryFilters[0]?.parentElement);
      addFilterButtons(authorFilters,'author',records.map(record=>this.getTab(record)),authorFilters[0]?.parentElement);
      const refreshButtons=()=>{
        const category=app.querySelector('[data-category].is-active')?.dataset.category||'all';
        const author=app.querySelector('[data-author].is-active')?.dataset.author||'all';
        categoryFilters.forEach(button=>{
          const total=button.dataset.category==='all'?records.length:records.filter(record=>this.getCategory(record)===button.dataset.category).length;
          button.textContent=`${button.dataset.category==='all'?'ALL TOPICS':button.dataset.category.toUpperCase()} (${total})`;
        });
        authorFilters.forEach(button=>{
          const total=button.dataset.author==='all'?records.length:records.filter(record=>this.getTab(record)===button.dataset.author).length;
          button.textContent=`${button.dataset.author==='all'?'ALL AUTHORS':button.dataset.author.toUpperCase()} (${total})`;
        });
      };
      const render=()=>{
        const query=(search?.value||'').trim().toLowerCase();
        const category=app.querySelector('[data-category].is-active')?.dataset.category||'all';
        const author=app.querySelector('[data-author].is-active')?.dataset.author||'all';
        const filtered=records.filter(record=>{
          const matchesQuery=`${record.title||''} ${record.text||''} ${record.status||''} ${this.getCategory(record)} ${this.getTab(record)} ${this.getTags(record).join(' ')}`.toLowerCase().includes(query);
          return matchesQuery&&(category==='all'||this.getCategory(record)===category)&&(author==='all'||this.getTab(record)===author);
        });
        list.innerHTML=filtered.map(record=>this.renderCard(record)).join('');
        count.textContent=String(filtered.length);
        empty.hidden=filtered.length>0;
      };
      app.nzmmRefresh=async()=>{
        const refreshed=await this.loadCollection();
        records=this.getTextPosts(refreshed).filter(record=>!this.isDeleted(record.key)).map(record=>this.getEditedRecord(record));
        addFilterButtons(categoryFilters,'category',records.map(record=>this.getCategory(record)),categoryFilters[0]?.parentElement);
        addFilterButtons(authorFilters,'author',records.map(record=>this.getTab(record)),authorFilters[0]?.parentElement);
        bindFilters(categoryFilters,'category');
        bindFilters(authorFilters,'author');
        refreshButtons();
        render();
      };
      const bindFilters=(buttons,attribute)=>buttons.forEach(button=>{
        if(button.dataset.bound)return;
        button.dataset.bound='true';
        button.addEventListener('click',()=>{
          buttons.forEach(item=>item.classList.remove('is-active'));
          button.classList.add('is-active');
          refreshButtons();
          render();
        });
      });
      bindFilters(categoryFilters,'category');
      bindFilters(authorFilters,'author');
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
      if(this.isDeleted(key))throw new Error('Article deleted');
      const title=app.querySelector('[data-article-title]');
      const body=app.querySelector('[data-article-body]');
      const editButton=app.querySelector('[data-edit-article]');
      const saveButton=app.querySelector('[data-save-article]');
      const cancelButton=app.querySelector('[data-cancel-article]');
      const resetButton=app.querySelector('[data-reset-article]');
      const deleteButton=app.querySelector('[data-delete-article]');
      const metaEditor=app.querySelector('[data-meta-editor]');
      const metaFields={sourceUrl:app.querySelector('[data-meta-source-url]'),kind:app.querySelector('[data-meta-kind]'),status:app.querySelector('[data-meta-status]'),category:app.querySelector('[data-meta-category]'),tags:app.querySelector('[data-meta-tags]'),tab:app.querySelector('[data-meta-tab]')};
      let saved={};
      try{saved=JSON.parse(localStorage.getItem(this.editStorageKey(key))||'{}');}catch(error){console.warn('Saved article edit could not be read.',error);}
      const original={title:record.title||record.key,text:record.text||'',sourceUrl:record.sourceUrl||'',kind:record.kind||'post',status:record.status||'',category:this.getCategory(record),tags:this.getTags(record),tab:this.getTab(record)};
      const current={...original,...saved,title:saved.title||original.title,text:saved.text??original.text,tags:Array.isArray(saved.tags)?saved.tags:original.tags};
      const setEditMode=(editing)=>{
        title.contentEditable=String(editing);
        body.contentEditable=String(editing);
        editButton.hidden=editing;
        saveButton.hidden=!editing;
        cancelButton.hidden=!editing;
        resetButton.hidden=!editing;
        metaEditor.hidden=!editing;
      };
      const renderArticle=(value)=>{
        title.textContent=value.title;
        body.innerHTML=this.formatText(value.text);
        metaFields.sourceUrl.value=value.sourceUrl;
        metaFields.kind.value=value.kind;
        metaFields.status.value=value.status;
        metaFields.category.value=value.category;
        metaFields.tags.value=this.getTags(value).join(', ');
        metaFields.tab.value=value.tab;
        app.querySelector('[data-article-meta]').textContent=`Record ${String(record.sequence).padStart(2,'0')} · ${value.status||value.kind||'collection item'} · ${value.category} · ${value.tab}`;
        if(value.sourceUrl){source.href=value.sourceUrl;source.hidden=false;}else source.hidden=true;
        document.title=`${value.title} | NZMigrationMM`;
      };
      document.title=`${current.title} | NZMigrationMM`;
      title.textContent=current.title;
      const source=app.querySelector('[data-source-link]');
      renderArticle(current);
      body.innerHTML=this.formatText(current.text);
      editButton.addEventListener('click',()=>{
        setEditMode(true);
        title.focus();
      });
      saveButton.addEventListener('click',()=>{
        const edited={title:title.textContent.trim()||current.title,text:(body.innerText||body.textContent||'').trim(),sourceUrl:metaFields.sourceUrl.value.trim(),kind:metaFields.kind.value,status:metaFields.status.value.trim(),category:metaFields.category.value.trim().toLowerCase()||this.getCategory(current),tags:metaFields.tags.value.split(',').map(tag=>tag.trim()).filter(Boolean),tab:metaFields.tab.value.trim()||this.getTab(current)};
        localStorage.setItem(this.editStorageKey(key),JSON.stringify(edited));
        Object.assign(current,edited);
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
      deleteButton.addEventListener('click',()=>{
        if(!window.confirm('Delete this article from the local archive?'))return;
        localStorage.setItem(this.deletedStorageKey(key),'true');
        localStorage.removeItem(this.editStorageKey(key));
        window.location.href='001-Original-Post-Groups.html';
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
