const pe=Symbol(),Z=Object.getPrototypeOf,F=new WeakMap,fe=e=>e&&(F.has(e)?F.get(e):Z(e)===Object.prototype||Z(e)===Array.prototype),me=e=>fe(e)&&e[pe]||null,ee=(e,t=!0)=>{F.set(e,t)},J=e=>typeof e=="object"&&e!==null,A=new WeakMap,x=new WeakSet,he=(e=Object.is,t=(n,g)=>new Proxy(n,g),s=n=>J(n)&&!x.has(n)&&(Array.isArray(n)||!(Symbol.iterator in n))&&!(n instanceof WeakMap)&&!(n instanceof WeakSet)&&!(n instanceof Error)&&!(n instanceof Number)&&!(n instanceof Date)&&!(n instanceof String)&&!(n instanceof RegExp)&&!(n instanceof ArrayBuffer),r=n=>{switch(n.status){case"fulfilled":return n.value;case"rejected":throw n.reason;default:throw n}},l=new WeakMap,c=(n,g,I=r)=>{const y=l.get(n);if(y?.[0]===g)return y[1];const v=Array.isArray(n)?[]:Object.create(Object.getPrototypeOf(n));return ee(v,!0),l.set(n,[g,v]),Reflect.ownKeys(n).forEach(S=>{if(Object.getOwnPropertyDescriptor(v,S))return;const O=Reflect.get(n,S),j={value:O,enumerable:!0,configurable:!0};if(x.has(O))ee(O,!1);else if(O instanceof Promise)delete j.value,j.get=()=>I(O);else if(A.has(O)){const[b,z]=A.get(O);j.value=c(b,z(),I)}Object.defineProperty(v,S,j)}),Object.preventExtensions(v)},m=new WeakMap,f=[1,1],E=n=>{if(!J(n))throw new Error("object required");const g=m.get(n);if(g)return g;let I=f[0];const y=new Set,v=(a,i=++f[0])=>{I!==i&&(I=i,y.forEach(o=>o(a,i)))};let S=f[1];const O=(a=++f[1])=>(S!==a&&!y.size&&(S=a,b.forEach(([i])=>{const o=i[1](a);o>I&&(I=o)})),I),j=a=>(i,o)=>{const h=[...i];h[1]=[a,...h[1]],v(h,o)},b=new Map,z=(a,i)=>{if((import.meta.env?import.meta.env.MODE:void 0)!=="production"&&b.has(a))throw new Error("prop listener already exists");if(y.size){const o=i[3](j(a));b.set(a,[i,o])}else b.set(a,[i])},Y=a=>{var i;const o=b.get(a);o&&(b.delete(a),(i=o[1])==null||i.call(o))},de=a=>(y.add(a),y.size===1&&b.forEach(([o,h],k)=>{if((import.meta.env?import.meta.env.MODE:void 0)!=="production"&&h)throw new Error("remove already exists");const R=o[3](j(k));b.set(k,[o,R])}),()=>{y.delete(a),y.size===0&&b.forEach(([o,h],k)=>{h&&(h(),b.set(k,[o]))})}),H=Array.isArray(n)?[]:Object.create(Object.getPrototypeOf(n)),$=t(H,{deleteProperty(a,i){const o=Reflect.get(a,i);Y(i);const h=Reflect.deleteProperty(a,i);return h&&v(["delete",[i],o]),h},set(a,i,o,h){const k=Reflect.has(a,i),R=Reflect.get(a,i,h);if(k&&(e(R,o)||m.has(o)&&e(R,m.get(o))))return!0;Y(i),J(o)&&(o=me(o)||o);let V=o;if(o instanceof Promise)o.then(C=>{o.status="fulfilled",o.value=C,v(["resolve",[i],C])}).catch(C=>{o.status="rejected",o.reason=C,v(["reject",[i],C])});else{!A.has(o)&&s(o)&&(V=E(o));const C=!x.has(V)&&A.get(V);C&&z(i,C)}return Reflect.set(a,i,V,h),v(["set",[i],o,R]),!0}});m.set(n,$);const ue=[H,O,c,de];return A.set($,ue),Reflect.ownKeys(n).forEach(a=>{const i=Object.getOwnPropertyDescriptor(n,a);"value"in i&&($[a]=n[a],delete i.value,delete i.writable),Object.defineProperty(H,a,i)}),$})=>[E,A,x,e,t,s,r,l,c,m,f],[ge]=he();function M(e={}){return ge(e)}function P(e,t,s){const r=A.get(e);(import.meta.env?import.meta.env.MODE:void 0)!=="production"&&!r&&console.warn("Please use proxy object");let l;const c=[],m=r[3];let f=!1;const n=m(g=>{if(c.push(g),s){t(c.splice(0));return}l||(l=Promise.resolve().then(()=>{l=void 0,f&&t(c.splice(0))}))});return f=!0,()=>{f=!1,n()}}function be(e,t){const s=A.get(e);(import.meta.env?import.meta.env.MODE:void 0)!=="production"&&!s&&console.warn("Please use proxy object");const[r,l,c]=s;return c(r,l(),t)}const d=M({history:["ConnectWallet"],view:"ConnectWallet",data:void 0}),ce={state:d,subscribe(e){return P(d,()=>e(d))},push(e,t){e!==d.view&&(d.view=e,t&&(d.data=t),d.history.push(e))},reset(e){d.view=e,d.history=[e]},replace(e){d.history.length>1&&(d.history[d.history.length-1]=e,d.view=e)},goBack(){if(d.history.length>1){d.history.pop();const[e]=d.history.slice(-1);d.view=e}},setData(e){d.data=e}},p={WALLETCONNECT_DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",WCM_VERSION:"WCM_VERSION",RECOMMENDED_WALLET_AMOUNT:9,isMobile(){return typeof window<"u"?Boolean(window.matchMedia("(pointer:coarse)").matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)):!1},isAndroid(){return p.isMobile()&&navigator.userAgent.toLowerCase().includes("android")},isIos(){const e=navigator.userAgent.toLowerCase();return p.isMobile()&&(e.includes("iphone")||e.includes("ipad"))},isHttpUrl(e){return e.startsWith("http://")||e.startsWith("https://")},isArray(e){return Array.isArray(e)&&e.length>0},formatNativeUrl(e,t,s){if(p.isHttpUrl(e))return this.formatUniversalUrl(e,t,s);let r=e;r.includes("://")||(r=e.replaceAll("/","").replaceAll(":",""),r=`${r}://`),r.endsWith("/")||(r=`${r}/`),this.setWalletConnectDeepLink(r,s);const l=encodeURIComponent(t);return`${r}wc?uri=${l}`},formatUniversalUrl(e,t,s){if(!p.isHttpUrl(e))return this.formatNativeUrl(e,t,s);let r=e;r.endsWith("/")||(r=`${r}/`),this.setWalletConnectDeepLink(r,s);const l=encodeURIComponent(t);return`${r}wc?uri=${l}`},async wait(e){return new Promise(t=>{setTimeout(t,e)})},openHref(e,t){window.open(e,t,"noreferrer noopener")},setWalletConnectDeepLink(e,t){try{localStorage.setItem(p.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:e,name:t}))}catch{console.info("Unable to set WalletConnect deep link")}},setWalletConnectAndroidDeepLink(e){try{const[t]=e.split("?");localStorage.setItem(p.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:t,name:"Android"}))}catch{console.info("Unable to set WalletConnect android deep link")}},removeWalletConnectDeepLink(){try{localStorage.removeItem(p.WALLETCONNECT_DEEPLINK_CHOICE)}catch{console.info("Unable to remove WalletConnect deep link")}},setModalVersionInStorage(){try{typeof localStorage<"u"&&localStorage.setItem(p.WCM_VERSION,"2.6.2")}catch{console.info("Unable to set Web3Modal version in storage")}},getWalletRouterData(){var e;const t=(e=ce.state.data)==null?void 0:e.Wallet;if(!t)throw new Error('Missing "Wallet" view data');return t}},ye=typeof location<"u"&&(location.hostname.includes("localhost")||location.protocol.includes("https")),u=M({enabled:ye,userSessionId:"",events:[],connectedWalletId:void 0}),ve={state:u,subscribe(e){return P(u.events,()=>e(be(u.events[u.events.length-1])))},initialize(){u.enabled&&typeof(crypto==null?void 0:crypto.randomUUID)<"u"&&(u.userSessionId=crypto.randomUUID())},setConnectedWalletId(e){u.connectedWalletId=e},click(e){if(u.enabled){const t={type:"CLICK",name:e.name,userSessionId:u.userSessionId,timestamp:Date.now(),data:e};u.events.push(t)}},track(e){if(u.enabled){const t={type:"TRACK",name:e.name,userSessionId:u.userSessionId,timestamp:Date.now(),data:e};u.events.push(t)}},view(e){if(u.enabled){const t={type:"VIEW",name:e.name,userSessionId:u.userSessionId,timestamp:Date.now(),data:e};u.events.push(t)}}},W=M({chains:void 0,walletConnectUri:void 0,isAuth:!1,isCustomDesktop:!1,isCustomMobile:!1,isDataLoaded:!1,isUiLoaded:!1}),w={state:W,subscribe(e){return P(W,()=>e(W))},setChains(e){W.chains=e},setWalletConnectUri(e){W.walletConnectUri=e},setIsCustomDesktop(e){W.isCustomDesktop=e},setIsCustomMobile(e){W.isCustomMobile=e},setIsDataLoaded(e){W.isDataLoaded=e},setIsUiLoaded(e){W.isUiLoaded=e},setIsAuth(e){W.isAuth=e}},B=M({projectId:"",mobileWallets:void 0,desktopWallets:void 0,walletImages:void 0,chains:void 0,enableAuthMode:!1,enableExplorer:!0,explorerExcludedWalletIds:void 0,explorerRecommendedWalletIds:void 0,termsOfServiceUrl:void 0,privacyPolicyUrl:void 0}),T={state:B,subscribe(e){return P(B,()=>e(B))},setConfig(e){var t,s;ve.initialize(),w.setChains(e.chains),w.setIsAuth(Boolean(e.enableAuthMode)),w.setIsCustomMobile(Boolean((t=e.mobileWallets)==null?void 0:t.length)),w.setIsCustomDesktop(Boolean((s=e.desktopWallets)==null?void 0:s.length)),p.setModalVersionInStorage(),Object.assign(B,e)}};var we=Object.defineProperty,te=Object.getOwnPropertySymbols,Ie=Object.prototype.hasOwnProperty,We=Object.prototype.propertyIsEnumerable,se=(e,t,s)=>t in e?we(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,Le=(e,t)=>{for(var s in t||(t={}))Ie.call(t,s)&&se(e,s,t[s]);if(te)for(var s of te(t))We.call(t,s)&&se(e,s,t[s]);return e};const G="https://explorer-api.walletconnect.com",Q="wcm",X="js-2.6.2";async function K(e,t){const s=Le({sdkType:Q,sdkVersion:X},t),r=new URL(e,G);return r.searchParams.append("projectId",T.state.projectId),Object.entries(s).forEach(([l,c])=>{c&&r.searchParams.append(l,String(c))}),(await fetch(r)).json()}const U={async getDesktopListings(e){return K("/w3m/v1/getDesktopListings",e)},async getMobileListings(e){return K("/w3m/v1/getMobileListings",e)},async getInjectedListings(e){return K("/w3m/v1/getInjectedListings",e)},async getAllListings(e){return K("/w3m/v1/getAllListings",e)},getWalletImageUrl(e){return`${G}/w3m/v1/getWalletImage/${e}?projectId=${T.state.projectId}&sdkType=${Q}&sdkVersion=${X}`},getAssetImageUrl(e){return`${G}/w3m/v1/getAssetImage/${e}?projectId=${T.state.projectId}&sdkType=${Q}&sdkVersion=${X}`}};var Oe=Object.defineProperty,ne=Object.getOwnPropertySymbols,Ee=Object.prototype.hasOwnProperty,Ce=Object.prototype.propertyIsEnumerable,oe=(e,t,s)=>t in e?Oe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,Ae=(e,t)=>{for(var s in t||(t={}))Ee.call(t,s)&&oe(e,s,t[s]);if(ne)for(var s of ne(t))Ce.call(t,s)&&oe(e,s,t[s]);return e};const re=p.isMobile(),L=M({wallets:{listings:[],total:0,page:1},search:{listings:[],total:0,page:1},recomendedWallets:[]}),ke={state:L,async getRecomendedWallets(){const{explorerRecommendedWalletIds:e,explorerExcludedWalletIds:t}=T.state;if(e==="NONE"||t==="ALL"&&!e)return L.recomendedWallets;if(p.isArray(e)){const s={recommendedIds:e.join(",")},{listings:r}=await U.getAllListings(s),l=Object.values(r);l.sort((c,m)=>{const f=e.indexOf(c.id),E=e.indexOf(m.id);return f-E}),L.recomendedWallets=l}else{const{chains:s,isAuth:r}=w.state,l=s?.join(","),c=p.isArray(t),m={page:1,sdks:r?"auth_v1":void 0,entries:p.RECOMMENDED_WALLET_AMOUNT,chains:l,version:2,excludedIds:c?t.join(","):void 0},{listings:f}=re?await U.getMobileListings(m):await U.getDesktopListings(m);L.recomendedWallets=Object.values(f)}return L.recomendedWallets},async getWallets(e){const t=Ae({},e),{explorerRecommendedWalletIds:s,explorerExcludedWalletIds:r}=T.state,{recomendedWallets:l}=L;if(r==="ALL")return L.wallets;l.length?t.excludedIds=l.map(I=>I.id).join(","):p.isArray(s)&&(t.excludedIds=s.join(",")),p.isArray(r)&&(t.excludedIds=[t.excludedIds,r].filter(Boolean).join(",")),w.state.isAuth&&(t.sdks="auth_v1");const{page:c,search:m}=e,{listings:f,total:E}=re?await U.getMobileListings(t):await U.getDesktopListings(t),n=Object.values(f),g=m?"search":"wallets";return L[g]={listings:[...L[g].listings,...n],total:E,page:c??1},{listings:n,total:E}},getWalletImageUrl(e){return U.getWalletImageUrl(e)},getAssetImageUrl(e){return U.getAssetImageUrl(e)},resetSearch(){L.search={listings:[],total:0,page:1}}},N=M({open:!1}),q={state:N,subscribe(e){return P(N,()=>e(N))},async open(e){return new Promise(t=>{const{isUiLoaded:s,isDataLoaded:r}=w.state;if(p.removeWalletConnectDeepLink(),w.setWalletConnectUri(e?.uri),w.setChains(e?.chains),ce.reset("ConnectWallet"),s&&r)N.open=!0,t();else{const l=setInterval(()=>{const c=w.state;c.isUiLoaded&&c.isDataLoaded&&(clearInterval(l),N.open=!0,t())},200)}})},close(){N.open=!1}};var Me=Object.defineProperty,ie=Object.getOwnPropertySymbols,je=Object.prototype.hasOwnProperty,Ue=Object.prototype.propertyIsEnumerable,ae=(e,t,s)=>t in e?Me(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,De=(e,t)=>{for(var s in t||(t={}))je.call(t,s)&&ae(e,s,t[s]);if(ie)for(var s of ie(t))Ue.call(t,s)&&ae(e,s,t[s]);return e};function Pe(){return typeof matchMedia<"u"&&matchMedia("(prefers-color-scheme: dark)").matches}const _=M({themeMode:Pe()?"dark":"light"}),le={state:_,subscribe(e){return P(_,()=>e(_))},setThemeConfig(e){const{themeMode:t,themeVariables:s}=e;t&&(_.themeMode=t),s&&(_.themeVariables=De({},s))}},D=M({open:!1,message:"",variant:"success"}),Ne={state:D,subscribe(e){return P(D,()=>e(D))},openToast(e,t){D.open=!0,D.message=e,D.variant=t},closeToast(){D.open=!1}};class Te{constructor(t){this.openModal=q.open,this.closeModal=q.close,this.subscribeModal=q.subscribe,this.setTheme=le.setThemeConfig,le.setThemeConfig(t),T.setConfig(t),this.initUi()}async initUi(){if(typeof window<"u"){await import("./index-2bd1db59.js");const t=document.createElement("wcm-modal");document.body.insertAdjacentElement("beforeend",t),w.setIsUiLoaded(!0)}}}export{ce as A,ke as G,q as Q,Te as W,p as a,w as c,Ne as o,le as s,T as v,ve as x};
//# sourceMappingURL=bundle-12cf7cc7.js.map
