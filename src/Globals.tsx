import { isPlatform, IonLabel } from '@ionic/react';
import axios from 'axios';
import IndexedDbFuncs from './IndexedDbFuncs';
import { IDictItem } from './models/DictItem';

const pwaUrl = process.env.PUBLIC_URL || '';
const bugReportApiUrl = 'https://vh6ud1o56g.execute-api.ap-northeast-1.amazonaws.com/bugReportMailer';
let twKaiFontsCache: { [key: string]: FontFace } = {};
const twKaiFonts = ['Kai', 'Kai', 'Kai', 'KaiExtB', 'KaiExtB', 'KaiExtB', 'KaiPlus', 'KaiPlus'];
const twKaiFontKeys = ['twKaiFont-1', 'twKaiFont-2', 'twKaiFont-3', 'twKaiExtBFont-1', 'twKaiExtBFont-2', 'twKaiExtBFont-3', 'twKaiPlusFont-1', 'twKaiPlusFont-2',];
const twKaiFontPaths = [`${pwaUrl}/assets/TW-Kai-98_1-1.woff2`, `${pwaUrl}/assets/TW-Kai-98_1-2.woff2`, `${pwaUrl}/assets/TW-Kai-98_1-3.woff2`, `${pwaUrl}/assets/TW-Kai-Ext-B-98_1-1.woff2`, `${pwaUrl}/assets/TW-Kai-Ext-B-98_1-2.woff2`, `${pwaUrl}/assets/TW-Kai-Ext-B-98_1-3.woff2`, `${pwaUrl}/assets/TW-Kai-Plus-98_1-1.woff2`, `${pwaUrl}/assets/TW-Kai-Plus-98_1-2.woff2`,];

const sy108qDb = 'sy108qDb';
let log = '';

var dictItems: Array<IDictItem> = [];
const axiosInstance = axios.create({
  timeout: 10000,
});

function twKaiFontNeedUpgrade() {
  return +(localStorage.getItem('twKaiFontVersion') ?? 1) < IndexedDbFuncs.twKaiFontVersion;
}

async function loadTwKaiFonts(progressCallback: Function | null = null, win: Window = window) {
  let forceUpdate = false;
  if (twKaiFontNeedUpgrade()) {
    localStorage.setItem('twKaiFontVersion', IndexedDbFuncs.twKaiFontVersion + "");
    forceUpdate = true;
  }

  let finishCount = 0;
  let load: Promise<any>[] = [];
  for (let i = 0; i < twKaiFonts.length; i++) {
    load.push(loadTwKaiFont(
      twKaiFonts[i],
      twKaiFontKeys[i],
      twKaiFontPaths[i],
      forceUpdate,
    ).then(
      // eslint-disable-next-line no-loop-func
      (fontFace) => {
        win.document.fonts.add(fontFace);
        //console.log(`[Main] ${twKaiFontKeys[i]} font loading success!`);
        finishCount += 1;
        progressCallback && progressCallback(finishCount / twKaiFonts.length);
      }));
  }
  return Promise.all(load);
}

async function loadTwKaiFont(font: string, key: string, path: string, forceUpdate: boolean) {
  const fontFaceCache = twKaiFontsCache[key];
  const updateFont = () => {
    return axiosInstance.get(`${window.location.origin}${path}`, {
      responseType: 'arraybuffer',
      timeout: 0,
    }).then(res => {
      const fontData = res.data;
      IndexedDbFuncs.saveFile(key, fontData, IndexedDbFuncs.fontStore);
      localStorage.setItem('twKaiFontVersion', IndexedDbFuncs.twKaiFontVersion + "");
      return new window.FontFace(font, fontData)
    });
  };

  let updateFontOrNot: Promise<FontFace>;
  if (!forceUpdate) {
    if (fontFaceCache) {
      updateFontOrNot = Promise.resolve(fontFaceCache);
    } else {
      updateFontOrNot = (IndexedDbFuncs.getFile<ArrayBuffer>(key, IndexedDbFuncs.fontStore)).then((data) => {
        return new window.FontFace(font, data);
      }).catch(err => {
        return updateFont();
      });
    }
  } else {
    updateFontOrNot = updateFont();
  }

  return updateFontOrNot.then((fontFace) => {
    twKaiFontsCache[key] = fontFace;
    return fontFace.load();
  })
}

async function clearAppData() {
  localStorage.clear();
}

//const electronBackendApi: any = (window as any).electronBackendApi;

function removeElementsByClassName(doc: Document, className: string) {
  let elements = doc.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode?.removeChild(elements[0]);
  }
}

const consoleLog = console.log.bind(console);
const consoleError = console.error.bind(console);

function getLog() {
  return log;
}

function enableAppLog() {
  console.log = function () {
    log += '----- Info ----\n';
    log += (Array.from(arguments)) + '\n';
    consoleLog.apply(console, arguments as any);
  };

  console.error = function () {
    log += '----- Error ----\n';
    log += (Array.from(arguments)) + '\n';
    consoleError.apply(console, arguments as any);
  };
}

function disableAppLog() {
  log = '';
  console.log = consoleLog;
  console.error = consoleError;
}

function disableAndroidChromeCallout(event: any) {
  event.preventDefault();
  event.stopPropagation();
  return false;
}

// Workable but imperfect.
function disableIosSafariCallout(this: Window) {
  const s = this.getSelection();
  if ((s?.rangeCount || 0) > 0) {
    const r = s?.getRangeAt(0);
    s?.removeAllRanges();
    setTimeout(() => {
      s?.addRange(r!);
    }, 50);
  }
}

//const webkit = (window as any).webkit;
function copyToClipboard(text: string) {
  try {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'clipboard-read' } as any).then(() => {
        navigator.clipboard.writeText(text);
      });
    } else {
      navigator.clipboard && navigator.clipboard.writeText(text);
    }
  } catch (error) {
    console.error(error);
  }
}

function shareByLink(dispatch: Function, url: string = window.location.href) {
  copyToClipboard(url);
  dispatch({
    type: 'TMP_SET_KEY_VAL',
    key: 'shareTextModal',
    val: {
      show: true,
      text: decodeURIComponent(url),
    },
  });
}

function isMacCatalyst() {
  return isPlatform('ios') && navigator.platform === 'MacIntel';
}

const checkServiceWorkerInterval = 20;
let serviceWorkerLoaded = false;
let _serviceWorkerReg: ServiceWorkerRegistration;
async function getServiceWorkerReg() {
  if (serviceWorkerLoaded) { 
    return _serviceWorkerReg;
  }

  return new Promise<ServiceWorkerRegistration>((ok, fail) => {
    let waitTime = 0;
    const waitLoading = setInterval(() => {
      if (navigator.serviceWorker.controller != null) {
        clearInterval(waitLoading);
        ok(_serviceWorkerReg);
      } else if (waitTime > 1e3 * 10) {
        clearInterval(waitLoading);
        fail('getServiceWorkerReg timeout!');
      }
      waitTime += checkServiceWorkerInterval;
    }, checkServiceWorkerInterval);
  });
}
function setServiceWorkerReg(serviceWorkerReg: ServiceWorkerRegistration) {
  _serviceWorkerReg = serviceWorkerReg;
}

let _serviceWorkerRegUpdated: ServiceWorkerRegistration;
function getServiceWorkerRegUpdated() {
  return _serviceWorkerRegUpdated;
}
function setServiceWorkerRegUpdated(serviceWorkerRegUpdated: ServiceWorkerRegistration) {
  _serviceWorkerRegUpdated = serviceWorkerRegUpdated;
}

const newStoreFile = 'sy108qSettings.json';

const Globals = {
  pwaUrl,
  bugReportApiUrl,
  storeFile: newStoreFile,
  quotes: require('./sy108q.json') as string[],
  getLog,
  enableAppLog,
  disableAppLog,
  sy108qDb,
  twKaiFontNeedUpgrade,
  twKaiFontsCache,
  twKaiFonts,
  twKaiFontKeys,
  loadTwKaiFonts,
  axiosInstance,
  appSettings: {
    'theme': '佈景主題',
    'uiFontSize': 'UI 字型大小',
  } as Record<string, string>,
  fetchErrorContent: (
    <div className='contentCenter'>
      <IonLabel>
        <div>
          <div>連線失敗!</div>
          <div style={{ fontSize: 'var(--ui-font-size)', paddingTop: 24 }}>如果問題持續發生，請執行<a href={`/${pwaUrl}/settings`} target="_self">設定頁</a>的 app 異常回報功能。</div>
        </div>
      </IonLabel>
    </div>
  ),
  updateApp: () => {
    return new Promise(async resolve => {
      navigator.serviceWorker.getRegistrations().then(async regs => {
        const hasUpdates = await Promise.all(regs.map(reg => (reg.update() as any).then((newReg: ServiceWorkerRegistration) => {
          return newReg.installing !== null || newReg.waiting !== null;
        })));
        resolve(hasUpdates.reduce((prev, curr) => prev || curr, false));
      });
    });
  },
  updateCssVars: (settings: any) => {
    document.documentElement.style.cssText = `--ion-font-family: ${settings.useFontKai ? `Times, ${twKaiFonts.join(', ')}, Noto Sans CJK TC` : 'Times, Heiti TC, Noto Sans CJK TC'}; --ui-font-size: ${settings.uiFontSize}px`
  },
  isMacCatalyst,
  isTouchDevice: () => {
    return (isPlatform('ios') && !isMacCatalyst()) || isPlatform('android');
  },
  isStoreApps: () => {
    return isPlatform('pwa') || isPlatform('electron');
  },
  dictItems,
  clearAppData,
  removeElementsByClassName,
  disableAndroidChromeCallout,
  disableIosSafariCallout,
  copyToClipboard,
  shareByLink,
  setServiceWorkerReg,
  getServiceWorkerReg,
  setServiceWorkerRegUpdated,
  getServiceWorkerRegUpdated,
};

export default Globals;
