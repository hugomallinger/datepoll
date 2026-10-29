// Opens WhatsApp's own "Create poll" dialog and fills it. Never presses Send.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(find, what, timeoutMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = find();
    if (el) return el;
    await sleep(50);
  }
  throw new Error(`Couldn't find ${what}`);
}

// Lexical editors ignore direct DOM writes; insertText goes through their input handling.
// An empty text clears the field.
async function typeInto(editor, text) {
  editor.focus();
  // Editing commands act on whatever has focus: if it isn't the field, they'd hit the message box.
  if (document.activeElement !== editor) throw new Error("Couldn't focus a poll field");

  // Clear first: replacing selected text with text that contains a space silently does
  // nothing in WhatsApp's editor. Lexical ignores execCommand('delete') but handles beforeinput.
  if (editor.innerText.trim()) {
    document.execCommand('selectAll');
    editor.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true }));
    await sleep(30);
  }
  if (text) document.execCommand('insertText', false, text);
  await sleep(60);
}

async function openPollDialog() {
  const existing = WA.pollDialog();
  if (existing) return existing;

  const attach = await waitFor(WA.attachButton, 'the Attach button');
  attach.click();
  const pollItem = await waitFor(WA.pollMenuItem, 'the Poll menu item');
  pollItem.click();
  return waitFor(WA.pollDialog, 'the Create poll dialog');
}

async function fillPoll({ question, options, multipleAnswers = true }) {
  if (options.length < 2) throw new Error('A poll needs at least 2 options');
  if (options.length > WA_MAX_OPTIONS) throw new Error(`WhatsApp allows at most ${WA_MAX_OPTIONS} options`);

  const dialog = await openPollDialog();
  await typeInto(WA.editors(dialog)[0], question);

  for (let i = 0; i < options.length; i++) {
    const editor = await waitFor(() => WA.editors(dialog)[i + 1], `option field ${i + 1}`);
    await typeInto(editor, options[i]);
  }

  // A dialog that was already open can hold more options than ours: empty the rest.
  // WhatsApp removes a field once it's empty, so look again after each one.
  for (let i = 0; i < WA_MAX_OPTIONS; i++) {
    const extra = WA.editors(dialog).slice(options.length + 1).find((e) => e.innerText.trim());
    if (!extra) break;
    await typeInto(extra, '');
  }

  const toggle = WA.multipleAnswersSwitch(dialog);
  if (!toggle) throw new Error("Couldn't find the multiple answers switch");
  if (toggle.checked !== multipleAnswers) {
    toggle.click();
    await sleep(60);
  }
  if (WA.multipleAnswersSwitch(dialog)?.checked !== multipleAnswers) {
    throw new Error("Couldn't set Allow multiple answers");
  }

  // The question, then every non-empty option field in order: nothing missing, nothing left over.
  const [filledQuestion, ...filledOptions] = WA.editors(dialog).map((e) => e.innerText.trim());
  if (filledQuestion !== question.trim()) throw new Error('The question did not fill correctly');
  if (filledOptions.filter(Boolean).join('\n') !== options.join('\n')) throw new Error('Some options did not fill correctly');
}
