"""
Extrae metas educativas, propósitos formativos y contenidos formativos de los
programas del Modelo Educativo 2025 (DGB, generación 2025-2028).

Uso: python3 -I scripts/extraer_propositos_2025.py <carpeta-con-pdfs> data/extraccion/json/propositos-2025.json

Las tablas de la DGB no tienen líneas, así que las columnas se separan por el
hueco en blanco vertical entre "Propósitos formativos" y "Contenidos formativos",
letra por letra (en las optativas el PDF mezcla ambas columnas en una sola línea).
"""
import fitz, re, json, sys, os
SEM = {'primer':1,'segundo':2,'tercer':3,'cuarto':4,'quinto':5,'sexto':6}
def lines_split(page, split):
    out=[]
    for b in page.get_text('rawdict')['blocks']:
        for l in b.get('lines',[]):
            segs={0:[],1:[]}
            for sp in l['spans']:
                for ch in sp['chars']:
                    side=1 if (ch['bbox'][0]+ch['bbox'][2])/2>=split else 0
                    segs[side].append((ch,sp['size']))
            for side,chs in segs.items():
                t=''.join(c['c'] for c,_ in chs).strip()
                if not t: continue
                xs=[c['bbox'] for c,_ in chs if c['c'].strip()]
                out.append({'x0':min(x[0] for x in xs),'y0':min(x[1] for x in xs),'x1':max(x[2] for x in xs),'y1':max(x[3] for x in xs),'t':t,'size':max(z for _,z in chs),'side':side})
    return sorted(out,key=lambda l:(round(l['y0']),l['x0']))
def lines_of(page):
    out=[]
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            t=''.join(s['text'] for s in l['spans']).strip()
            if t: out.append({'x0':l['bbox'][0],'y0':l['bbox'][1],'x1':l['bbox'][2],'y1':l['bbox'][3],'t':t,'size':max(s['size'] for s in l['spans'])})
    return sorted(out,key=lambda l:(round(l['y0']),l['x0']))
def join(parts):
    s=''
    for p in parts:
        p=p.strip()
        if not s: s=p
        elif s.endswith('-') and p[:1].islower(): s=s[:-1]+p
        else: s+=' '+p
    return re.sub(r'\s+',' ',s).strip()
def join_contenidos(pares):
    # Un renglón que llega hasta el borde de la columna se cortó por falta de espacio:
    # el siguiente renglón, si es corto, es su continuación aunque empiece con mayúscula.
    borde=max((x for _,x in pares),default=0)
    lleno=[x>=borde-14 for _,x in pares]
    lines=[re.sub('\u200b','',t) for t,_ in pares]
    if any(t.lstrip().startswith(('●','•')) for t in lines):
        items=[]
        for t in lines:
            t=t.strip()
            if t.startswith(('●','•')): items.append(t.lstrip('●• ').strip())
            elif t.startswith('-') and items: items[-1]=join([items[-1]+(':' if not items[-1].endswith(':') else ''),t.lstrip('- ')]) if False else items.__setitem__(-1, items[-1]+'; '+t.lstrip('- ').strip()) or items[-1]
            elif items: items[-1]=join([items[-1],t])
            else: items.append(t)
        return items
    items=[]
    for i,t in enumerate(lines):
        t=t.strip()
        if items and ((i>0 and lleno[i-1] and not lleno[i]) or t.startswith('(') or t[:1].islower() or items[-1].endswith(('-',',','(',' y',' de',' del',' la',' las',' los',' en',' con',' para',' a',' e',' o',' al',' su',' sus',' que',' entre')) or items[-1].count('(')>items[-1].count(')')):
            items[-1]=join([items[-1],t])
        else: items.append(t)
    return items
def con_vinetas(cont):
    marcas=[y for y,t,_,_ in cont if t.strip() in ('•','●','●\u200b')]
    # "o" suelta = viñeta de segundo nivel; se une al contenido de arriba
    sub=[y for y,t,_,_ in cont if t.strip() in ('o','o\u200b','◦')]
    out=[]
    for y,t,x1,_ in cont:
        if t.strip() in ('•','●','●\u200b','o','o\u200b','◦'): continue
        if any(abs(y-m)<4 for m in sub): t='- '+re.sub(r'^o\s+','',t.strip())
        elif any(abs(y-m)<4 for m in marcas) and not t.lstrip().startswith(('•','●')): t='• '+t
        out.append((t,x1))
    return out
def sin_folio(items):
    # El número de página se cuela al final del último contenido de la hoja
    return [re.sub(r'(?<=[.)])\s+\d{1,3}$','',c) for c in items]
def extraer(path):
    doc=fitz.open(path); res=[]; cur=None
    for pi,page in enumerate(doc):
        L=lines_of(page); text=page.get_text()
        tabla=next((l for l in L if re.match(r'Tabla \d+\. Prop[oó]sitos y contenidos formativos',l['t'])),None)
        hdr=[l for l in L if re.match(r'^Prop[oó]sitos? formativos|^Prop[oó]sito$',l['t'])]
        if tabla:
            if cur: res.append(cur)
            cur={'pagina':pi+1,'titulo_tabla':tabla['t'],'rows':[],'raw_meta':[]}
            # titulo de tabla puede seguir en la línea siguiente
            nxt=[l for l in L if l['y0']>tabla['y0'] and l['y0']<tabla['y0']+20 and abs(l['x0']-tabla['x0'])<30]
            cur['titulo_tabla']=join([tabla['t']]+[n['t'] for n in nxt[:1]])
            nombre=next((l for l in L if l['t'].startswith('Nombre de la asignatura')),None)
            meta=next((l for l in L if l['t'].startswith('Meta educativa')),None)
            hy=hdr[0]['y0'] if hdr else 1e9
            if nombre and meta:
                mx=meta['x0']-5
                left=[l for l in L if l['y0']>nombre['y0']+1 and l['y0']<hy and l['x1']<mx+5 and l['t']!='Meta educativa']
                right=[l for l in L if l['y0']>=meta['y0']+1 and l['y0']<hy and l['x0']>=mx]
                cur['meta']=join([l['t'] for l in right])
                nom=[];sem=None;horas=None
                for l in left:
                    m=re.match(r'(\w+)\s+semestre',l['t'],re.I)
                    if m: sem=SEM.get(m.group(1).lower()); continue
                    if 'Horas' in l['t']: horas=l['t']; continue
                    if sem is None: nom.append(l['t'])
                cur['nombre']=join(nom); cur['semestre']=sem; cur['horas']=horas
        if cur is None: continue
        if hdr:
            h=hdr[0]; cont=next((l for l in L if l['t'].startswith('Contenido') and abs(l['y0']-h['y0'])<6),None)
            top=h['y1']; hx0=h['x0']; hx1=(cont['x1'] if cont else h['x1']+150)
        else:
            # página de continuación sin encabezado: usar la geometría anterior
            if 'geo' not in cur: continue
            top=40; hx0,hx1=cur['geo']; cont=None
        fuente=next((l for l in L if l['t'].startswith('Fuente:') or re.search(r'Orientaciones did[aá]cticas|^Tabla \d+\. (?!Prop)',l['t'])),None)
        pie=[l['y0'] for l in L if l['y0']>page.rect.height*0.8 and re.search(r'^\d+\s*\||\|\s*\d+$',l['t'])]
        bottom=fuente['y0'] if fuente else (min(pie) if pie else page.rect.height-25)
        # un párrafo de ancho completo (sin hueco entre columnas) marca el fin de la tabla
        for bl in page.get_text('rawdict')['blocks']:
            for ln in bl.get('lines',[]):
                chs=[c for sp in ln['spans'] for c in sp['chars'] if c['c'].strip()]
                if not chs: continue
                x0=min(c['bbox'][0] for c in chs); x1=max(c['bbox'][2] for c in chs); y0=min(c['bbox'][1] for c in chs)
                if y0<=top or y0>=bottom or x1-x0<page.rect.width*0.62: continue
                xs=sorted(chs,key=lambda c:c['bbox'][0])
                gap=max((xs[i+1]['bbox'][0]-xs[i]['bbox'][2] for i in range(len(xs)-1)),default=0)
                if gap<12: bottom=y0
        occ=[0]*int(page.rect.width+2)
        for bl in page.get_text('rawdict')['blocks']:
            for ln in bl.get('lines',[]):
                for sp in ln['spans']:
                    for ch in sp['chars']:
                        x0,y0,x1,y1=ch['bbox']
                        if y0>top and y1<bottom and ch['c'].strip():
                            for x in range(int(x0),int(x1)+1): occ[x]+=1
        best=(0,None); run=None
        for x in range(int(hx0+40),min(int(hx1),len(occ))):
            if occ[x]==0:
                run=x if run is None else run
                if x-run>best[0]: best=(x-run,(run+x)/2)
            else: run=None
        if not best[1] or best[0]<5: continue
        split=best[1]; cur['geo']=(hx0,hx1)
        LS=lines_split(page,split)
        sizes=sorted(l['size'] for l in LS if top<l['y0']<bottom)
        med=sizes[len(sizes)//2] if sizes else 9
        body=[l for l in LS if l['y0']>top-6 and l['y1']<=bottom+1 and l['size']>=med*0.8 and not re.match(r'^(Fuente:|Propósitos? formativos?$|Contenidos( formativos)?$)',l['t'].strip())]
        lefts=[l for l in body if l['side']==0]; rights=[l for l in body if l['side']==1]
        lx=min([l['x0'] for l in lefts],default=0)
        starts=[]
        for l in lefts:
            m=re.match(r'^(\d{1,2})(?:\.|\s|$)\s*(.*)$',l['t'])
            if m and 0<int(m.group(1))<=12 and (l['x0']<lx+30 or l['t'][len(m.group(1)):len(m.group(1))+1]=='.'): starts.append(l)
        blocks=[]
        for st in starts:
            m=re.match(r'^(\d{1,2})\.?\s*(.*)$',st['t'])
            blocks.append({'id':int(m.group(1)),'parts':[(st['y0'],st['x0'],m.group(2))] if m.group(2) else [],'y0':st['y0'],'y1':st['y1'],'cont':[]})
        for l in lefts:
            if l in starts: continue
            owner=None
            for bk in blocks:
                if bk['y0']-5<=l['y0']: owner=bk
            if owner: owner['parts'].append((l['y0'],l['x0'],l['t'])); owner['y1']=max(owner['y1'],l['y1'])
            elif cur['rows']: cur['rows'][-1]['parts'].append((l['y0']+10000*pi,l['x0'],l['t']))
        # Los contenidos de una fila forman un bloque separado del siguiente por un renglón en
        # blanco; el bloque completo va al propósito con el que más se traslapa verticalmente.
        rights=sorted(rights,key=lambda r:r['y0'])
        alto=sorted(r['y1']-r['y0'] for r in rights)[len(rights)//2] if rights else 10
        grupos=[]
        for r in rights:
            if grupos and r['y0']-grupos[-1][-1]['y1']<alto*0.9: grupos[-1].append(r)
            else: grupos.append([r])
        def partir(gr):
            toca=[bk for bk in blocks if min(gr[-1]['y1'],bk['y1'])-max(gr[0]['y0'],bk['y0'])>0]
            if len(toca)<=1 or len(gr)<2: return [gr]
            i=max(range(1,len(gr)),key=lambda k:gr[k]['y0']-gr[k-1]['y1'])
            return partir(gr[:i])+partir(gr[i:])
        grupos=[g for gr in grupos for g in partir(gr)]
        sueltos=[]
        for gr in grupos:
            gy0,gy1=gr[0]['y0'],gr[-1]['y1']
            if not blocks: sueltos+=gr; continue
            trasl=[(min(gy1,bk['y1'])-max(gy0,bk['y0']),bk) for bk in blocks]
            positivos=[t for t in trasl if t[0]>0]
            if len(positivos)==1 or (positivos and max(positivos,key=lambda t:t[0])[0]>=(gy1-gy0)*0.6):
                bk=max(positivos,key=lambda t:t[0])[1]
                for r in gr: bk['cont'].append((r['y0'],r['t'],r['x1'],r['x0']))
            elif not positivos and gy1<min(b['y0'] for b in blocks)-25 and cur['rows']:
                for r in gr: cur['rows'][-1]['cont'].append((r['y0']+10000*pi,r['t'],r['x1'],r['x0']))
            elif not positivos:
                bk=min(blocks,key=lambda b:min(abs(gy0-b['y1']),abs(gy1-b['y0'])))
                for r in gr: bk['cont'].append((r['y0'],r['t'],r['x1'],r['x0']))
            else: sueltos+=gr
        rights=sueltos
        for r in rights:
            c=(r['y0']+r['y1'])/2
            if not blocks:
                if cur['rows']: cur['rows'][-1]['cont'].append((r['y0']+10000*pi,r['t'],r['x1'],r['x0']))
                continue
            first=min(blocks,key=lambda bk:bk['y0'])
            if c<first['y0']-25 and cur['rows']:
                cur['rows'][-1]['cont'].append((r['y0']+10000*pi,r['t'],r['x1'],r['x0'])); continue
            bst=min(blocks,key=lambda bk:0 if bk['y0']-3<=c<=bk['y1']+3 else min(abs(c-bk['y0']),abs(c-bk['y1'])))
            bst['cont'].append((r['y0'],r['t'],r['x1'],r['x0']))
        for bk in blocks:
            bk['parts']=[(y+10000*pi,x,t) for y,x,t in bk['parts']]; bk['cont']=[(y+10000*pi,t,x,x0) if y<10000 else (y,t,x,x0) for y,t,x,x0 in bk['cont']]
            cur['rows'].append(bk)
        if fuente:
            res.append(cur); cur=None
    if cur: res.append(cur)
    out=[]
    for a in res:
        out.append({k:a.get(k) for k in ('pagina','titulo_tabla','nombre','semestre','horas','meta')} | {'propositos':[{'id':r['id'],'descripcion':join([t for _,_,t in sorted(r['parts'],key=lambda z:(round(z[0]),z[1]))]),'contenidos':sin_folio(join_contenidos(con_vinetas(sorted(r['cont'],key=lambda z:(round(z[0]),z[3])))))} for r in a['rows']]})
    return out
if __name__=='__main__':
    src,dst=sys.argv[1],sys.argv[2]
    todo={}
    for f in sorted(os.listdir(src)):
        if f.endswith('.pdf'): todo[f[:-4]]=extraer(os.path.join(src,f))
    json.dump(todo,open(dst,'w'),ensure_ascii=False,indent=1)
    for k,v in todo.items():
        for a in v: print(f"{k:24} p{a['pagina']:<3} sem={a['semestre']} props={len(a['propositos'])} ids={[p['id'] for p in a['propositos']]} | {(a['nombre'] or a['titulo_tabla'])[:60]}")
