import { useEffect, useState } from 'react';
import './install-app.css';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted'|'dismissed' }> };
function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt|null>(null);
  const [help, setHelp] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(()=>{
    const before=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt);};
    const installedHandler=()=>{setInstalled(true);setPrompt(null);setHelp(false);};
    window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',installedHandler);
    return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',installedHandler);};
  },[]);
  const install=async()=>{
    if(!prompt){setHelp(true);return;}
    await prompt.prompt();const choice=await prompt.userChoice;
    if(choice.outcome==='accepted')setInstalled(true);
    setPrompt(null);
  };
  return <><button className="installButton" onClick={()=>void install()}>{installed?'Installed ✓':'Install app'}</button>{help&&<div className="installHelpBackdrop" onClick={()=>setHelp(false)}><section className="installHelp card" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Install Venz"><button className="closeModal" onClick={()=>setHelp(false)}>×</button><span className="step">ADD TO YOUR DEVICE</span><h2>Install Venz</h2><p>Open your browser menu and choose <b>Install app</b> or <b>Add to Home Screen</b>. If that option is missing, reload this page over HTTPS in a supported browser.</p></section></div>}</>;
}
export default InstallApp;
