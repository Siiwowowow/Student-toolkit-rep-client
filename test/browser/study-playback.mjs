import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const api = 'http://127.0.0.1:4900/account';
const setStatus = code => fetch(`${api}/__test/status?code=${code}`, { method: 'POST' });
await setStatus(200);
await page.route('https://www.youtube.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<html><body>Controlled YouTube test frame</body></html>' }));
await page.route('https://www.youtube.com/oembed**', route => route.fulfill({ json: { title: 'Test lesson', author_name: 'Test teacher' } }));
await page.addInitScript(() => {
  const videos = ['AMBJ3247M0s', '4uM9BTDjqcl'];
  localStorage.setItem('toolkit-session', 'local-test-token-not-a-real-credential');
  if (!localStorage.getItem('toolkit-study-mood-v1:playback-test')) localStorage.setItem('toolkit-study-mood-v1:playback-test', JSON.stringify({ selectedId: 'playlist:PLabcdefghijk', entries: [
    { id: 'playlist:PLabcdefghijk', kind: 'playlist', sourceId: 'PLabcdefghijk', title: 'Test playlist', videos, completed: [] },
    { id: 'video:abcdefghijk', kind: 'video', sourceId: 'abcdefghijk', title: 'Single lesson', completed: [], videos: [] },
  ] }));
  window.playerCreations = 0;
  window.YT = { Player: class {
    constructor(iframe, { events }) { this.events=events;this.index=0;this.time=0;this.state=5;this.ids=[];this.id='';window.fakePlayer=this;window.playerCreations++;setTimeout(()=>{if(!this.destroyed)events.onReady({target:this})},10); }
    setSize() {}
    getVideoData(){return {video_id:this.id,title:'Test lesson'}}
    getPlaylist(){return this.ids}
    getPlaylistIndex(){return this.index}
    getCurrentTime(){return this.time}
    getPlayerState(){return this.state}
    emit(state){this.state=state;this.events.onStateChange({data:state,target:this})}
    cuePlaylist(o){this.ids=[...videos];this.index=o.index;this.id=this.ids[this.index];this.time=o.startSeconds||0;setTimeout(()=>this.emit(5),0)}
    loadPlaylist(o){this.cuePlaylist(o);setTimeout(()=>this.emit(1),0)}
    cueVideoById(o){this.ids=[];this.index=0;this.id=o.videoId;this.time=o.startSeconds||0;setTimeout(()=>this.emit(5),0)}
    loadVideoById(o){this.cueVideoById(o);setTimeout(()=>this.emit(1),0)}
    playVideoAt(index){this.index=index;this.id=this.ids[index];this.time=0;this.emit(1)}
    seekTo(seconds){this.time=seconds}
    playVideo(){this.emit(1)}
    pauseVideo(){this.emit(2)}
    destroy(){this.destroyed=true}
  }};
});
const load = async () => { await page.goto('http://127.0.0.1:5178/test/browser/study-room.html');await page.waitForFunction(()=>window.fakePlayer?.id && !window.fakePlayer.destroyed); };
try {
  await load();
  await page.evaluate(()=>{window.fakePlayer.playVideoAt(1);window.fakePlayer.time=145;window.fakePlayer.pauseVideo()});
  await page.reload();
  await page.waitForFunction(()=>window.fakePlayer?.id==='4uM9BTDjqcl');
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),145,'reload resumes playlist lesson and seconds');
  await page.evaluate(()=>{window.fakePlayer.playVideo();window.fakePlayer.time=170});
  await page.waitForTimeout(5500);
  const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('toolkit-study-mood-v1:playback-test:playback-v1')));
  assert.equal(saved['playlist:PLabcdefghijk'].positions['4uM9BTDjqcl'],170,'periodic checkpoint');
  const creations = await page.evaluate(()=>window.playerCreations);
  await setStatus(503);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.getByText('Connection interrupted.',{exact:false}).waitFor();
  assert.equal(await page.evaluate(()=>window.playerCreations),creations,'503 does not recreate iframe');
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),170);
  await setStatus(200);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.getByText('Connection interrupted.',{exact:false}).waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>window.playerCreations),creations,'recovery keeps player');
  await page.getByRole('button',{name:'Play Single lesson',exact:true}).click();
  await page.waitForFunction(()=>window.fakePlayer?.id==='abcdefghijk');
  await page.evaluate(()=>{window.fakePlayer.time=73;window.fakePlayer.pauseVideo()});
  await page.reload();
  await page.waitForFunction(()=>window.fakePlayer?.id==='abcdefghijk');
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),73,'single video resumes');
  await page.getByRole('button',{name:'Play Test playlist',exact:true}).click();
  await page.waitForFunction(()=>window.fakePlayer?.id==='4uM9BTDjqcl');
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),170,'queue switching resumes playlist');
  await page.getByRole('button',{name:'Play Test playlist',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),170,'clicking selected playlist does not restart');
  await page.evaluate(()=>{window.fakePlayer.time=190;window.dispatchEvent(new Event('pagehide'))});
  await page.reload();
  await page.waitForFunction(()=>window.fakePlayer?.id==='4uM9BTDjqcl');
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),190,'pagehide checkpoint');
  await setStatus(403);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.getByRole('heading',{name:'Access could not be verified'}).waitFor();
  assert.equal(await page.locator('.fsm-player iframe').count(),0,'403 still blocks access');
  await setStatus(200);
  await page.getByRole('button',{name:'Try again'}).click();
  await page.waitForFunction(()=>window.fakePlayer?.id==='4uM9BTDjqcl'&&!window.fakePlayer.destroyed);
  assert.equal(await page.evaluate(()=>window.fakePlayer.time),190,'access recovery resumes checkpoint');
  await setStatus(401);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>localStorage.getItem('toolkit-session')===null);
  assert.equal(await page.locator('.fsm-player iframe').count(),0,'401 signs out');
  assert.deepEqual(errors,[]);
  console.log('PASS: playlist/single resume, periodic/pagehide saves, source switching, selected playlist, 503 continuity, 403 block, 401 logout.');
} finally { await setStatus(200); await browser.close(); }
