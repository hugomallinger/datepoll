// A button next to Attach that opens the date poll panel.

const BUTTON_ID = 'datepoll-button';

const CALENDAR_ICON = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/>
  <path d="M3.5 10h17M8 3v4M16 3v4"/>
</svg>`;

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
    background: '#e9534f', color: '#fff', padding: '10px 16px', borderRadius: '8px',
    font: '14px system-ui, sans-serif', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,.3)',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

async function createPoll(poll) {
  try {
    await fillPoll(poll);
  } catch (err) {
    showToast(`Datepoll: ${err.message}`);
    console.error('[Datepoll]', err);
  }
}

let panel = null;

function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;

  // No button means the chat closed or changed; a panel left open would point at nothing.
  panel?.close();

  const slot = WA.attachSlot();
  if (!slot) return;

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.title = 'Create date poll';
  button.setAttribute('aria-label', 'Create date poll');
  button.innerHTML = CALENDAR_ICON;
  Object.assign(button.style, {
    background: 'none', border: 'none', padding: '8px', cursor: 'pointer',
    color: 'inherit', display: 'flex', alignItems: 'center', opacity: '0.85',
  });
  button.addEventListener('click', () => {
    panel ??= createPanel({ onCreate: createPoll });
    panel.toggle(button);
  });
  slot.insertAdjacentElement('afterend', button);
}

// WhatsApp re-renders the footer whenever the open chat changes.
new MutationObserver(injectButton).observe(document.body, { childList: true, subtree: true });
injectButton();
