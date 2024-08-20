"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var g=require("events"),y=require("cross-fetch"),a=require("@walletconnect/safe-json"),n=require("@walletconnect/jsonrpc-utils");function b(r){return r&&typeof r=="object"&&"default"in r?r:{default:r}}var l=b(y),P=Object.defineProperty,m=Object.defineProperties,w=Object.getOwnPropertyDescriptors,c=Object.getOwnPropertySymbols,E=Object.prototype.hasOwnProperty,j=Object.prototype.propertyIsEnumerable,h=(r,e,t)=>e in r?P(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,v=(r,e)=>{for(var t in e||(e={}))E.call(e,t)&&h(r,t,e[t]);if(c)for(var t of c(e))j.call(e,t)&&h(r,t,e[t]);return r},p=(r,e)=>m(r,w(e));const L={Accept:"application/json","Content-Type":"application/json"},O="POST",d={headers:L,method:O},f=10;class u{constructor(e,t=!1){if(this.url=e,this.disableProviderPing=t,this.events=new g.EventEmitter,this.isAvailable=!1,this.registering=!1,!n.isHttpUrl(e))throw new Error(`Provided URL is not compatible with HTTP connection: ${e}`);this.url=e,this.disableProviderPing=t}get connected(){return this.isAvailable}get connecting(){return this.registering}on(e,t){this.events.on(e,t)}once(e,t){this.events.once(e,t)}off(e,t){this.events.off(e,t)}removeListener(e,t){this.events.removeListener(e,t)}async open(e=this.url){await this.register(e)}async close(){if(!this.isAvailable)throw new Error("Connection already closed");this.onClose()}async send(e){this.isAvailable||await this.register();try{const t=a.safeJsonStringify(e),s=await(await l.default(this.url,p(v({},d),{body:t}))).json();this.onPayload({data:s})}catch(t){this.onError(e.id,t)}}async register(e=this.url){if(!n.isHttpUrl(e))throw new Error(`Provided URL is not compatible with HTTP connection: ${e}`);if(this.registering){const t=this.events.getMaxListeners();return(this.events.listenerCount("register_error")>=t||this.events.listenerCount("open")>=t)&&this.events.setMaxListeners(t+1),new Promise((s,i)=>{this.events.once("register_error",o=>{this.resetMaxListeners(),i(o)}),this.events.once("open",()=>{if(this.resetMaxListeners(),typeof this.isAvailable>"u")return i(new Error("HTTP connection is missing or invalid"));s()})})}this.url=e,this.registering=!0;try{if(!this.disableProviderPing){const t=a.safeJsonStringify({id:1,jsonrpc:"2.0",method:"test",params:[]});await l.default(e,p(v({},d),{body:t}))}this.onOpen()}catch(t){const s=this.parseError(t);throw this.events.emit("register_error",s),this.onClose(),s}}onOpen(){this.isAvailable=!0,this.registering=!1,this.events.emit("open")}onClose(){this.isAvailable=!1,this.registering=!1,this.events.emit("close")}onPayload(e){if(typeof e.data>"u")return;const t=typeof e.data=="string"?a.safeJsonParse(e.data):e.data;this.events.emit("payload",t)}onError(e,t){const s=this.parseError(t),i=s.message||s.toString(),o=n.formatJsonRpcError(e,i);this.events.emit("payload",o)}parseError(e,t=this.url){return n.parseConnectionError(e,t,"HTTP")}resetMaxListeners(){this.events.getMaxListeners()>f&&this.events.setMaxListeners(f)}}exports.HttpConnection=u,exports.default=u;
//# sourceMappingURL=index.cjs.js.map
