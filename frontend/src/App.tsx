import { useRef, useState } from 'react';
import './style.css';

type Result = { urgency: string; message: string; precautions: string[]; identification: string };
const API = import.meta.env.VITE_API_URL || '';

function App() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [mode, setMode] = useState<'bite' | 'sighting'>('bite');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const choose = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WebP image under 8 MB.'); return;
    }
    setError(''); setPhoto(file); setPreview(URL.createObjectURL(file)); setResult(null);
  };
  const locate = () => navigator.geolocation.getCurrentPosition(
    ({ coords }) => setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`),
    () => setError('Location permission was unavailable. You can enter a nearby town instead.'),
    { enableHighAccuracy: false, timeout: 10000 });
  const analyze = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const image = photo ? await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read image.')); reader.readAsDataURL(photo);
      }) : null;
      const response = await fetch(`${API}/api/triage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image, mode, location, name: (document.getElementById('name') as HTMLInputElement).value, age: (document.getElementById('age') as HTMLInputElement).value, bloodType: (document.getElementById('blood') as HTMLSelectElement)?.value || '', conditions: (document.getElementById('conditions') as HTMLInputElement)?.value || '' }) });
      if (!response.ok) throw new Error((await response.json()).message || 'Analysis could not be completed.');
      setResult(await response.json());
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not reach the service.'); }
    finally { setLoading(false); }
  };

  return <main className="shell">
    <nav className="nav"><a className="brand" href="#"><span className="mark">V</span> VENZ <small>FIELD GUIDE</small></a><div className="navRight"><span className="secure">● Private session</span><a href="#care">Safety guide</a></div></nav>
    <section className="hero"><div className="eyebrow"><i/> FIELD RESPONSE · BETA</div><h1>Know what you’re<br/><em>looking at.</em></h1><p>Share a snake or bite photo for a careful, location-aware field assessment. Stay at a safe distance; a clinician makes the diagnosis.</p><div className="heroNote"><b>Emergency?</b> Call your local emergency number now. Do not wait for an app result.</div></section>
    <section className="workspace">
      <div className="card photoCard"><div className="sectionHead"><div><span className="step">01 / IMAGE</span><h2>Add a photo</h2></div><span className="optional">Optional</span></div>
        <div className={`drop ${preview?'hasPhoto':''}`} onClick={()=>input.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0]);}}>
          {preview ? <img src={preview} alt="Selected snake or bite image"/> : <><div className="uploadIcon">↑</div><b>Drop image here or <u>browse files</u></b><span>JPG · PNG · WEBP · up to 8 MB</span><small>Keep a safe distance. Never approach a snake to take a photo.</small></>}
        </div><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>choose(e.target.files?.[0])}/>
        {photo&&<button className="textButton" onClick={()=>{setPhoto(null);setPreview('');}}>Remove image</button>}
        <div className="modeSwitch"><button className={mode==='bite'?'selected':''} onClick={()=>setMode('bite')}>Person bitten</button><button className={mode==='sighting'?'selected':''} onClick={()=>setMode('sighting')}>Snake sighting</button></div>
        <div className="sectionHead details"><div><span className="step">02 / CONTEXT</span><h2>{mode==='bite'?'Patient details':'Sighting details'}</h2></div><span className="optional">Some fields optional</span></div>
        <div className="fields"><label>Name <small>optional</small><input id="name" placeholder="Name" autoComplete="name"/></label><label>Age <small>optional</small><input id="age" type="number" min="0" max="120" placeholder="Years"/></label>
          {mode==='bite'&&<><label>Blood type <small>optional</small><select id="blood"><option value="">Not known</option>{['A+','A−','B+','B−','AB+','AB−','O+','O−'].map(x=><option key={x}>{x}</option>)}</select></label><label>Relevant conditions / allergies <small>optional</small><input id="conditions" placeholder="e.g. medication allergies"/></label></>}
          <label className="locationField">Location <small>needed for local species context</small><div className="locationRow"><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Town, region or coordinates"/><button onClick={locate} title="Use device location">◎</button></div></label>
        </div>
        <button className="submit" disabled={loading} onClick={analyze}>{loading?'Assessing…':'Get a field assessment'} <span>↗</span></button>
        <p className="privacy">Your photo and details are sent to the configured service for this request. Avoid entering identifying information you do not need.</p>
      </div>
      <aside className="side"><div className="result card"><span className="step">ASSESSMENT</span>{result?<><div className="resultTitle">{result.identification}</div><div className="urgency">{result.urgency}</div><p>{result.message}</p><ul>{result.precautions.map(p=><li key={p}>{p}</li>)}</ul></>:<><div className="resultGlyph">⌁</div><h2>Your result<br/>will appear here.</h2><p>Identification is an estimate, not confirmation. Image quality, regional coverage, and lookalike species can affect results.</p></>}{error&&<p className="error">{error}</p>}</div>
        <div id="care" className="care card"><span className="step">WHILE YOU WAIT</span><h3>If someone may have been bitten</h3><ul><li>Move away from the snake; do not try to catch or kill it.</li><li>Keep the person calm and still. Remove rings or tight items near swelling.</li><li>Get emergency medical care now. Do not cut, suck, ice, or use a tourniquet.</li></ul><small>Follow local emergency service guidance. This app does not replace medical care.</small></div></aside>
    </section>
    <footer><span>VENZ FIELD GUIDE</span><span>Educational support · Not a diagnostic device</span></footer>
  </main>;
}
export default App;
