import{EventEmitter as a}from"events";import{FIVE_SECONDS as o,toMiliseconds as l}from"@walletconnect/time";import{IEvents as v}from"@walletconnect/events";class n extends v{constructor(e){super()}}const s=o,r={pulse:"heartbeat_pulse"};class i extends n{constructor(e){super(e),this.events=new a,this.interval=s,this.interval=e?.interval||s}static async init(e){const t=new i(e);return await t.init(),t}async init(){await this.initialize()}stop(){clearInterval(this.intervalRef)}on(e,t){this.events.on(e,t)}once(e,t){this.events.once(e,t)}off(e,t){this.events.off(e,t)}removeListener(e,t){this.events.removeListener(e,t)}async initialize(){this.intervalRef=setInterval(()=>this.pulse(),l(this.interval))}pulse(){this.events.emit(r.pulse)}}export{r as HEARTBEAT_EVENTS,s as HEARTBEAT_INTERVAL,i as HeartBeat,n as IHeartBeat};
//# sourceMappingURL=index.es.js.map
