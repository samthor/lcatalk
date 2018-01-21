window.addEventListener('hashchange', (ev) => {
  const active = +window.location.hash.substr(1);
  talk.active = active;
});
window.dispatchEvent(new Event('hashchange'));

document.body.addEventListener('keyup', (ev) => {
  // nb. use keyup as a simple delayer/deduper
  if (ev.key === 'ArrowLeft' && talk.active > 0) {
    --talk.active;
  } else if (ev.key === 'ArrowRight') {
    ++talk.active;
  }
});

const mo = new MutationObserver(() => {
  if (talk.active) {
    const hash = `#${talk.active}`;
    if (hash !== window.location.hash) {
      window.history.pushState(null, null, hash);
    }
  } else {
    const pathname = window.location.pathname;
    if (window.location.hash) {
      window.history.pushState(null, null, pathname);
    }
  }
});
mo.observe(talk, {attributes: true, attributeFilter: ['active']});
