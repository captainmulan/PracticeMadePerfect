import json, re, os
base = os.path.join(r'C:\Users\65966\PracticeMadePerfect','src','data','taskDefs')
fn = 'react-counter-redux.json'
task = json.load(open(os.path.join(base,fn),'r',encoding='utf-8'))
commentPrefix = '//'
def prefixCommentLines(text, prefix):
    return '\n'.join(prefix if line.strip()=='' else f'{prefix} {line.strip()}' for line in text.splitlines())

def getStarterCode(task):
    lines = [line.replace('//','',1).replace('--','',1).strip() for line in task.get('starterCode','').splitlines()]
    return '\n'.join([line for line in lines if line.strip()!=''])

editorHints = task.get('page',{}).get('editor',{}).get('hints', [])
showCodeHints=True
if editorHints:
    out = '\n\n'.join(prefixCommentLines(re.sub(r'^\s*//','',h.get('guide','')).strip(),commentPrefix) + '\n' + prefixCommentLines(re.sub(r'^\s*//','',h.get('code','')).strip(),commentPrefix) for h in editorHints)
else:
    commentHints = '\n\n'.join([f'{commentPrefix} {item.strip()}' for item in task['checklist']])
    commentedStarter = prefixCommentLines(getStarterCode(task), commentPrefix)
    out = commentHints + '\n\n' + commentedStarter
print(out[:1500])
