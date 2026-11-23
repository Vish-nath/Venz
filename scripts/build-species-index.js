import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = path.join(root, 'data/raw/venomous-snakes');
const csv = await readFile(path.join(dataDir, 'venomous-snakes.csv'), 'utf8');
function parseCsv(text) {
  const rows=[]; let row=[]; let value=''; let quoted=false;
  for(let i=0;i<text.length;i++) { const c=text[i];
    if(quoted&&c==='"'&&text[i+1]==='"'){value+='"';i++;}
    else if(c==='"') quoted=!quoted;
    else if(c===','&&!quoted){row.push(value.trim());value='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value.trim());if(row.some(Boolean))rows.push(row);row=[];value='';}
    else value+=c;
  }
  if(value||row.length){row.push(value.trim());if(row.some(Boolean))rows.push(row);}
  const [headers,...items]=rows;
  return items.map(item=>Object.fromEntries(headers.map((header,i)=>[header,item[i]||'']))).filter(x=>x['Common Name']);
}
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]/g,'');
const species=parseCsv(csv);
const labels=new Map(species.map(item=>[normalize(item['Common Name']),item]));
const aliases={boomslag:'Boomslang',coralsnake:'Coral snake( Eastern Coral)',cottonmouth:'Cotton mouth (Water Moccasin)',kingbrownsnake:'King brown snake (Mulga Snake)',malayanbluecoralsnake:'Malayan Blue Coral Snake (large form)',mamushi:'Mamushi ( Japanese pit viper )',mcmahonviper:"MacMahon's Viper",ottomanviper:'Montivipera xanthina (Ottoman viper)',phillipinecobra:'Philippine Cobra',srilankanhumpnoseviper:'Srilankan hump noses viper(Urobelus)',westernsandsnake:'Western Sand Viper'};
const files=(await readdir(path.join(dataDir,'images'))).filter(name=>/\.(jpe?g|png|webp)$/i.test(name));
const imageLabels={};
for(const name of files){const key=normalize(path.parse(name).name);const item=labels.get(key)||labels.get(normalize(aliases[key]||''));if(item)imageLabels[key]=item['Common Name'];}
const index={generatedAt:new Date().toISOString(),count:species.length,imageCount:files.length,matchedImageCount:Object.keys(imageLabels).length,imageLabels,species};
const output=path.join(root,'data/processed/venomous-snakes/species-index.json');
await writeFile(output,JSON.stringify(index));
console.log(`Wrote ${species.length} species and ${Object.keys(imageLabels).length}/${files.length} filename labels to ${output}`);
