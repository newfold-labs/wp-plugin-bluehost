/**
 * General Test Utilities
 * 
 * Common utilities for Playwright tests that aren't WordPress-specific.
 */

/**
 * Scroll element into view and wait for it to be stable
 * 
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 * @param {Object} options - Scroll options
 */
async function scrollIntoView(locator, options = {}) {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Wait for notification to appear and contain specific text
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - Text to look for in notification
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
async function waitForNotification(page, text, timeout = 5000) {
  const notification = page.locator('.nfd-notifications').filter({ hasText: text });
  await notification.waitFor({ state: 'visible', timeout });
  return notification;
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const DEFAULT_INDENT = '        ';

/**
 * Word-wrap a string to a maximum line length (character count). Breaks at spaces when
 * possible; otherwise hard-breaks at `width`. Preserves explicit newlines as paragraph breaks.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  if (width <= 0) {
    return text ? text.split('\n') : [''];
  }

  const out = [];

  for (const para of String(text).split('\n')) {
    if (para.length === 0) {
      out.push('');
      continue;
    }

    if (para.length <= width) {
      out.push(para);
      continue;
    }

    let remaining = para;
    while (remaining.length > width) {
      let breakAt = remaining.lastIndexOf(' ', width);
      if (breakAt <= 0) {
        breakAt = width;
      }
      const line = remaining.slice(0, breakAt).trimEnd();
      out.push(line);
      remaining = remaining.slice(breakAt).trimStart();
    }

    if (remaining.length > 0) {
      out.push(remaining);
    }
  }

  return out.length ? out : [''];
}

/**
 * Fancy log with optional ANSI colors, soft word-wrap to the terminal width, and optional truncation.
 *
 * **Argument shapes** (positional overload):
 * - `fancyLog(message)` — full message, wrap only, default gray + default indent.
 * - `fancyLog(message, color)` — full message, color, default indent.
 * - `fancyLog(message, color, indent)` — full message with indent (no truncation).
 * - `fancyLog(message, maxLength, color, indent?)` — if the **second** argument is a
 *   positive finite number, it is the maximum **character** length of the message body
 *   (truncated with `...` before wrapping). Use this only when you intentionally want a cap.
 *
 * @param {unknown} message
 * @param {number | string} [maxLengthOrColor]
 * @param {string} [colorOrIndent]
 * @param {string} [indentArg]
 */
function fancyLog(message, maxLengthOrColor, colorOrIndent, indentArg) {
  const stringMessage = String(message);

  let maxLength;
  let color = 'gray';
  let indentStr = DEFAULT_INDENT;

  const secondIsMaxLength =
    typeof maxLengthOrColor === 'number' &&
    Number.isFinite(maxLengthOrColor) &&
    maxLengthOrColor > 0;

  if (secondIsMaxLength) {
    maxLength = Math.floor(maxLengthOrColor);
    color = typeof colorOrIndent === 'string' ? colorOrIndent : 'gray';
    indentStr =
      indentArg !== undefined && indentArg !== null ? String(indentArg) : DEFAULT_INDENT;
  } else if (typeof maxLengthOrColor === 'string') {
    maxLength = undefined;
    color = maxLengthOrColor;
    indentStr =
      colorOrIndent !== undefined && colorOrIndent !== null
        ? String(colorOrIndent)
        : DEFAULT_INDENT;
  } else {
    maxLength = undefined;
    if (typeof colorOrIndent === 'string') {
      color = colorOrIndent;
    }
    if (indentArg !== undefined && indentArg !== null) {
      indentStr = String(indentArg);
    }
  }

  let body = stringMessage;
  if (typeof maxLength === 'number' && body.length > maxLength) {
    body = `${body.slice(0, maxLength)}...`;
  }

  const columns =
    typeof process.stdout?.columns === 'number' && process.stdout.columns > 0
      ? process.stdout.columns
      : 100;
  const wrapWidth = Math.max(40, columns - indentStr.length);
  const lines = wrapText(body, wrapWidth);
  const colorCode = colors[color] || colors.gray;

  for (const line of lines) {
    console.log(`${indentStr}${colorCode}${line}${colors.reset}`);
  }
}

export default {
  scrollIntoView,
  waitForNotification,
  fancyLog,
};
