// Every lookup into WhatsApp Web's DOM lives here.
// When WhatsApp changes its markup, this is the only file that should need edits.
// Verified against WhatsApp Web on 2026-10-29 (English UI).
// Icons carry an <svg><title> with an internal icon name; unlike labels, it doesn't change with the UI language.

const hasIcon = (el, name) => [...el.querySelectorAll('svg title')].some((t) => t.textContent === name);

const WA = {
  attachButton: () =>
    [...document.querySelectorAll('#main footer button')].find((b) => hasIcon(b, 'ic-add')),

  // Attach sits in a wrapper inside the footer's flex row (Attach, Emoji, text box, Mic).
  // Returns that wrapper, so our button can be inserted as its sibling.
  attachSlot: () => {
    let el = WA.attachButton();
    while (el && el.parentElement && el.parentElement.children.length < 2) el = el.parentElement;
    return el;
  },

  pollMenuItem: () =>
    [...document.querySelectorAll('[role="menuitem"]')].find((el) => hasIcon(el, 'wds-ic-poll')),

  // The poll dialog is the one dialog that holds rich-text editors (question + options).
  pollDialog: () =>
    [...document.querySelectorAll('[role="dialog"]')].find((d) => WA.editors(d).length >= 2),

  // First editor is the question, the rest are options. A new empty option
  // editor appears after the last one is filled, up to 12 options.
  editors: (dialog) => [...dialog.querySelectorAll('div[contenteditable="true"][data-lexical-editor]')],

  multipleAnswersSwitch: (dialog) => dialog.querySelector('input[role="switch"]'),
};

const WA_MAX_OPTIONS = 12;
