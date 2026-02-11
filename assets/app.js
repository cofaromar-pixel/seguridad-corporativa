
(function(){
  const qs = (s,el=document)=>el.querySelector(s);
  const qsa = (s,el=document)=>Array.from(el.querySelectorAll(s));

  // Active nav highlighting
  const path = (location.pathname.split('/').pop() || 'index.html');
  qsa('.nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });

  // In-page section scrolling (manual.html)
  if(qs('[data-section-index]')){
    qsa('[data-jump]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const id = a.getAttribute('data-jump');
        const target = qs('#'+CSS.escape(id));
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
          history.replaceState(null,'','#'+id);
        }
      });
    });
  }

  // Search across visible page (simple client-side highlighting)
  const input = qs('#searchBox');
  const clearBtn = qs('#clearSearch');
  const counter = qs('#searchCount');

  function clearHighlights(){
    qsa('.hl').forEach(span=>{
      const text = document.createTextNode(span.textContent);
      span.replaceWith(text);
    });
    if(counter) counter.textContent = '';
  }

  function highlight(term){
    clearHighlights();
    if(!term) return;
    const root = qs('main.main') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if(!p) return NodeFilter.FILTER_REJECT;
        if(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
    let count = 0;
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node=>{
      const val = node.nodeValue;
      if(!re.test(val)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      let m;
      while((m = re.exec(val))){
        const before = val.slice(last, m.index);
        if(before) frag.appendChild(document.createTextNode(before));
        const mark = document.createElement('span');
        mark.className = 'hl';
        mark.textContent = m[0];
        frag.appendChild(mark);
        count++;
        last = m.index + m[0].length;
      }
      const after = val.slice(last);
      if(after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    });

    if(counter){
      counter.textContent = count ? (count + ' coincidencia' + (count===1?'':'s')) : '0 coincidencias';
    }
    const first = qs('.hl');
    if(first) first.scrollIntoView({behavior:'smooth', block:'center'});
  }

  if(input){
    input.addEventListener('input', ()=>highlight(input.value.trim()));
    if(clearBtn){
      clearBtn.addEventListener('click', ()=>{
        input.value = '';
        clearHighlights();
        input.focus();
      });
    }
    // Ctrl/Cmd+K to focus search
    window.addEventListener('keydown', (e)=>{
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){
        e.preventDefault();
        input.focus();
      }
    });
  }

  // Print
  const printBtn = qs('#printPage');
  if(printBtn) printBtn.addEventListener('click', ()=>window.print());
})();
