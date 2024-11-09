// node_modules/copy-text-to-clipboard/index.js
function copyTextToClipboard(text, { target = document.body } = {}) {
  if (typeof text !== "string") {
    throw new TypeError(`Expected parameter \`text\` to be a \`string\`, got \`${typeof text}\`.`);
  }
  const element = document.createElement("textarea");
  const previouslyFocusedElement = document.activeElement;
  element.value = text;
  element.setAttribute("readonly", "");
  element.style.contain = "strict";
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.fontSize = "12pt";
  const selection = document.getSelection();
  const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0);
  target.append(element);
  element.select();
  element.selectionStart = 0;
  element.selectionEnd = text.length;
  let isSuccess = false;
  try {
    isSuccess = document.execCommand("copy");
  } catch {
  }
  element.remove();
  if (originalRange) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }
  return isSuccess;
}

export {
  copyTextToClipboard
};
//# sourceMappingURL=chunk-VCY2NOKE.js.map
