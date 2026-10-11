from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1];id,revision=sys.argv[1:3];p=root/'tools/game-series.json';configs=json.loads(p.read_text());old=configs[id]['revision'];configs[id]['revision']=revision;p.write_text(json.dumps(configs,indent=2)+'\n')
for file in list((root/'store'/id).glob('*.html'))+list((root/'tests').glob(id+'-*.html')):
 file.write_text(file.read_text().replace(old,revision))
