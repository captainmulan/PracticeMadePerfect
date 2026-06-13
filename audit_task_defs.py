import json, glob, os
path = 'src/data/taskDefs'
files = sorted(glob.glob(os.path.join(path, '*.json')))
with open('task_audit_details.txt', 'w', encoding='utf-8') as out:
    for f in files:
        j = json.load(open(f, encoding='utf-8'))
        title = j.get('title', '')
        desc = j.get('description', '')
        checklist = j.get('checklist', [])
        starter = 'starterCode' in j
        hints = []
        if 'page' in j:
            hints = j['page'].get('editor', {}).get('hints', [])
        out.write(f'FILE: {os.path.basename(f)}\n')
        out.write(f' title: {title}\n')
        out.write(f' desc: {desc}\n')
        out.write(f' checklist: {checklist}\n')
        out.write(f' starterCode: {starter}\n')
        if starter:
            sc = j['starterCode']
            out.write(' starterCode snippet:\n')
            out.write(sc[:500].replace('\n','\\n') + '\n')
        out.write(f' hints count: {len(hints)}\n')
        for idx, h in enumerate(hints):
            out.write(f'  hint{idx+1} guide: {h.get("guide","")}\n')
            out.write('   code: ' + h.get('code','').replace('\n','\\n')[:500] + '\n')
        out.write('\n')
