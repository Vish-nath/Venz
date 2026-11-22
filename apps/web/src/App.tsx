import { useEffect, useRef, useState } from 'react';
import './style.css';
import './dashboard.css';

type Result = { urgency: string; message: string; precautions: string[]; identification: string; notice: string };
type Profile = { name: string; age: string; bloodType: string; conditions: string; location: string };
type GoogleCredential = { credential: string };
declare global { interface Window { google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: GoogleCredential) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string>) => void } } } }
const API = import.meta.env.VITE_API_URL || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const blank: Profile = { name: '', age: '', bloodType: '', conditions: '', location: '' };

function App() {
  const [user, setUser] = useState<{name:string;email:string;picture?:string}|null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<Profile>(blank);
  const [showProfile, setShowProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>(blank);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('Assessment');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [mode, setMode] = useState<'bite' | 'sighting'>('bite');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{title:string;date:string;mode:string}[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const googleButton = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('venz.profile');
      const savedHistory = localStorage.getItem('venz.history');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch { localStorage.removeItem('venz.profile'); }
    const credential = sessionStorage.getItem('venz.google-credential');
    if (credential) fetch(`${API}/api/auth/google`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential})}).then(async r=>{if(!r.ok)throw new Error();const d=await r.json();setUser({name:d.name,email:d.email,picture:d.picture});}).catch(()=>sessionStorage.removeItem('venz.google-credential')).finally(()=>setAuthReady(true));
    else setAuthReady(true);
  }, []);

  useEffect(() => {
    if (user && !localStorage.getItem('venz.profile-dismissed')) {
      setProfileDraft(profile); setShowProfile(true);
    }
  }, [user, profile]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const script = document.createElement('script'); script.src='https://accounts.google.com/gsi/client'; script.async=true; script.onload=()=>{
      if (!googleButton.current || !window.google) return;
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: async ({ credential }) => {
      setAuthError('');
      try {
        const response = await fetch(`${API}/api/auth/google`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ credential }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Google sign-in could not be verified.');
        const signedIn = { name:data.name, email:data.email, picture:data.picture };
        sessionStorage.setItem('venz.google-credential',credential); setUser(signedIn);
      } catch (e) { setAuthError(e instanceof Error ? e.message : 'Sign-in failed.'); }
      } });
      window.google.accounts.id.renderButton(googleButton.current, { theme:'filled_black', size:'large', shape:'pill', text:'continue_with', width:'320' });
    }; document.head.appendChild(script); return ()=>{script.remove();};
  }, []);

  const saveProfile = (complete: boolean) => {
    setProfile(profileDraft); localStorage.setItem('venz.profile', JSON.stringify(profileDraft));
    if (complete) localStorage.setItem('venz.profile-complete','1');
    localStorage.setItem('venz.profile-dismissed','1');
    setShowProfile(false);
  };
  const signOut = () => { sessionStorage.removeItem('venz.google-credential'); localStorage.removeItem('venz.profile-complete'); localStorage.removeItem('venz.profile-dismissed'); setUser(null); setResult(null); };
  const choose = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8*1024*1024) { setError('Choose a JPG, PNG, or WebP image under 8 MB.'); return; }
    setError(''); setPhoto(file); setPreview(URL.createObjectURL(file)); setResult(null);
  };
  const locate = () => navigator.geolocation.getCurrentPosition(({coords}) => setProfileDraft(p=>({...p,location:`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`})),()=>setError('Location unavailable. Enter a nearby town or region instead.'),{timeout:10000});
  const analyze = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const image = photo ? await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Could not read image.'));r.readAsDataURL(photo);}) : null;
      const response = await fetch(`${API}/api/triage`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image,mode,location:profileDraft.location||profile.location,name:profileDraft.name||profile.name,age:profileDraft.age||profile.age,bloodType:profileDraft.bloodType||profile.bloodType,conditions:profileDraft.conditions||profile.conditions})});
      const data = await response.json(); if (!response.ok) throw new Error(data.message||'Assessment unavailable.');
      setResult(data); const entry={title:data.identification,date:new Date().toLocaleString(),mode}; const next=[entry,...history].slice(0,20);setHistory(next);localStorage.setItem('venz.history',JSON.stringify(next));
    } catch(e) { setError(e instanceof Error?e.message:'Could not reach the service.'); } finally {setLoading(false);}
  };

  if (!authReady) return <main className="loginShell"><section className="loginCard card">Restoring secure sign-in…</section></main>;
  if (!user) return <main className="loginShell"><div className="loginAtmosphere"/><a className="brand loginBrand" href="#"><span className="mark">V</span> VENZ <small>FIELD GUIDE</small></a><section className="loginCard card"><div className="eyebrow"><i/> FIELD RESPONSE · BETA</div><div className="loginGlyph">⌁</div><h1>Safety starts<br/><em>with awareness.</em></h1><p>Sign in to access your field guide, save your profile, and keep a record of assessments.</p><div className="googleSlot">{CLIENT_ID?<div ref={googleButton}/>:<button className="googleButton" disabled><span>G</span> Continue with Google</button>}</div>{!CLIENT_ID&&<div className="configHint">Google sign-in needs a Google OAuth Web client ID. Set <code>VITE_GOOGLE_CLIENT_ID</code> in Render and redeploy.</div>}{authError&&<p className="error">{authError}</p>}<div className="loginFoot">Your health details stay optional. Never wait for an app during an emergency.</div></section><div className="loginLegal">VENZ FIELD GUIDE · EDUCATIONAL SUPPORT ONLY</div></main>;

  return <main className="shell">
    <nav className="nav"><a className="brand" href="#"><span className="mark">V</span> VENZ <small>FIELD GUIDE</small></a><div className="navRight"><span className="secure">● Signed in</span><button className="userPill" onClick={()=>{setProfileDraft(profile);setShowProfile(true);}}>{user.picture?<img src={user.picture} alt=""/>:<span className="avatar">{user.name.slice(0,1)}</span>}<span>{user.name.split(' ')[0]}</span></button><button className="logout" onClick={signOut}>Sign out</button></div></nav>
    <div className="dashboardTop"><div><div className="eyebrow"><i/> YOUR FIELD RESPONSE SPACE</div><h1>Good to have you,<br/><em>{profile.name||user.name.split(' ')[0]}.</em></h1></div><div className="dashNotice"><b>Urgent situation?</b><span>Call your local emergency number now. Do not wait for an app result.</span></div></div>
    <nav className="dashTabs" aria-label="Dashboard sections">{['Assessment','My activity','Profile','Safety guide'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>{setTab(t);if(t==='Profile'){setProfileDraft(profile);setShowProfile(true);}}}>{t}</button>)}</nav>
    {tab==='Assessment'&&<section className="workspace">
      <div className="card photoCard"><div className="sectionHead"><div><span className="step">01 / IMAGE</span><h2>Add a photo</h2></div><span className="optional">Optional</span></div>
        <div className={`drop ${preview?'hasPhoto':''}`} onClick={()=>picker.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0]);}}>{preview?<img src={preview} alt="Selected snake or bite image"/>:<><div className="uploadIcon">↑</div><b>Drop image here or <u>browse files</u></b><span>JPG · PNG · WEBP · up to 8 MB</span><small>Keep a safe distance. Never approach a snake to take a photo.</small></>}</div><input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>choose(e.target.files?.[0])}/>{photo&&<button className="textButton" onClick={()=>{setPhoto(null);setPreview('');}}>Remove image</button>}
        <div className="modeSwitch"><button className={mode==='bite'?'selected':''} onClick={()=>setMode('bite')}>Person bitten</button><button className={mode==='sighting'?'selected':''} onClick={()=>setMode('sighting')}>Snake sighting</button></div>
        <div className="sectionHead details"><div><span className="step">02 / CONTEXT</span><h2>{mode==='bite'?'Patient details':'Sighting details'}</h2></div><button className="textButton" onClick={()=>{setProfileDraft(profile);setShowProfile(true);}}>Edit profile</button></div>
        <div className="fields"><label>Name <small>optional</small><input value={profileDraft.name} onChange={e=>setProfileDraft(p=>({...p,name:e.target.value}))} placeholder="Name"/></label><label>Age <small>optional</small><input type="number" min="0" max="120" value={profileDraft.age} onChange={e=>setProfileDraft(p=>({...p,age:e.target.value}))} placeholder="Years"/></label>{mode==='bite'&&<><label>Blood type <small>optional</small><select value={profileDraft.bloodType} onChange={e=>setProfileDraft(p=>({...p,bloodType:e.target.value}))}><option value="">Not known</option>{['A+','A−','B+','B−','AB+','AB−','O+','O−'].map(x=><option key={x}>{x}</option>)}</select></label><label>Conditions / allergies <small>optional</small><input value={profileDraft.conditions} onChange={e=>setProfileDraft(p=>({...p,conditions:e.target.value}))} placeholder="Medication allergies, etc."/></label></>}
          <label className="locationField">Location <small>needed for regional context</small><div className="locationRow"><input value={profileDraft.location} onChange={e=>setProfileDraft(p=>({...p,location:e.target.value}))} placeholder="Town, region or coordinates"/><button onClick={locate} title="Use device location">◎</button></div></label></div>
        <button className="submit" disabled={loading} onClick={()=>{setProfile(profileDraft);localStorage.setItem('venz.profile',JSON.stringify(profileDraft));analyze();}}>{loading?'Assessing…':'Get a field assessment'} <span>↗</span></button><p className="privacy">Health information is optional. The current service does not store images on the server.</p>
      </div><aside className="side"><div className="result card"><span className="step">ASSESSMENT</span>{result?<><div className="resultTitle">{result.identification}</div><div className="urgency">{result.urgency}</div><p>{result.message}</p><ul>{result.precautions.map(p=><li key={p}>{p}</li>)}</ul><small>{result.notice}</small></>:<><div className="resultGlyph">⌁</div><h2>Your result<br/>will appear here.</h2><p>The current service does not yet run a validated snake or bite image classifier. If a person was bitten, seek urgent medical care now.</p></>}</div><div id="care" className="care card"><span className="step">EMERGENCY RESPONSE</span><h3>If someone may have been bitten</h3><ul><li>Move away from the snake; do not try to catch or kill it.</li><li>Keep the person calm and still. Remove tight items near swelling.</li><li>Get emergency medical care now. Do not cut, suck, ice, or use a tourniquet.</li></ul><div className="contactBox"><b>Emergency contacts</b><span>Call your local emergency number or poison center. Numbers vary by country; this app does not have your region’s verified contacts.</span></div></div>{error&&<p className="error">{error}</p>}</aside></section>}
    {tab==='My activity'&&<section className="card pageCard"><span className="step">RECENT ASSESSMENTS</span><h2>Your activity</h2>{history.length?history.map((h,i)=><div className="historyRow" key={`${h.date}-${i}`}><span className="historyIcon">⌁</span><div><b>{h.title}</b><small>{h.mode==='bite'?'Bite report':'Snake sighting'} · {h.date}</small></div><span className="urgency">GUIDANCE ONLY</span></div>):<p className="muted">Assessments you make on this device appear here. Activity is stored locally in this browser.</p>}</section>}
    {tab==='Safety guide'&&<section className="card pageCard safetyPage"><span className="step">FIELD SAFETY</span><h2>Keep people safe first.</h2><div className="safetyGrid"><article><h3>Suspected bite</h3><p>Call emergency services immediately, keep the person still, and arrange urgent transport to medical care. Do not wait for identification.</p><ul><li>Remove rings and constricting items before swelling increases.</li><li>Keep the bite area still and below heart level if practical.</li><li>Do not apply ice, cut the wound, suck venom, or use a tourniquet.</li></ul></article><article><h3>Snake sighting</h3><p>Give the snake space and let it leave. Keep children and pets away.</p><ul><li>Never handle or corner a snake, even if it appears dead.</li><li>Photograph only from a safe distance; do not approach.</li><li>Contact local wildlife services for removal advice.</li></ul></article></div></section>}
    {tab==='Profile'&&<section className="card pageCard"><span className="step">YOUR ACCOUNT</span><h2>Profile & preferences</h2><p className="muted">Google account: {user.email}</p><button className="submit profileEdit" onClick={()=>{setProfileDraft(profile);setShowProfile(true);}}>Edit personal details</button><p className="privacy">You can leave health details empty. Profile data is stored in this browser and is not currently synced to an account.</p></section>}
    <footer><span>VENZ FIELD GUIDE</span><span>Educational support · Not a diagnostic device</span></footer>
    {showProfile&&<div className="modalBackdrop"><section className="modal card" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div className="sectionHead"><div><span className="step">OPTIONAL · EDIT ANYTIME</span><h2 id="profile-title">Complete your profile</h2></div><button className="closeModal" onClick={()=>saveProfile(false)}>×</button></div><p className="muted">This helps prefill future reports. You can skip now and add details later.</p><div className="fields"><label>Name<input value={profileDraft.name} onChange={e=>setProfileDraft(p=>({...p,name:e.target.value}))} placeholder={user.name}/></label><label>Age<input type="number" min="0" max="120" value={profileDraft.age} onChange={e=>setProfileDraft(p=>({...p,age:e.target.value}))} placeholder="Optional"/></label><label>Blood type<select value={profileDraft.bloodType} onChange={e=>setProfileDraft(p=>({...p,bloodType:e.target.value}))}><option value="">Prefer not to say / unknown</option>{['A+','A−','B+','B−','AB+','AB−','O+','O−'].map(x=><option key={x}>{x}</option>)}</select></label><label>Conditions / allergies<input value={profileDraft.conditions} onChange={e=>setProfileDraft(p=>({...p,conditions:e.target.value}))} placeholder="Optional"/></label><label className="locationField">Home region (optional)<input value={profileDraft.location} onChange={e=>setProfileDraft(p=>({...p,location:e.target.value}))} placeholder="Town or region"/></label></div><div className="modalActions"><button className="skipButton" onClick={()=>saveProfile(false)}>Skip for now</button><button className="submit" onClick={()=>saveProfile(true)}>Save profile</button></div><p className="privacy">Stored locally on this device. This profile is not yet synced to Google or a server.</p></section></div>}
  </main>;
}
export default App;
