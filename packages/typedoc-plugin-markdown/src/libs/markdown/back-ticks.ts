import { encodeAngleBrackets } from "../utils";

/**
 * Wraps a string in backticks.
 * If the input string itself contains a backtick, pipe, or backslash (which can result in unwanted side effects) the string is escaped instead.
 */
export function backTicks(text: string) {
  text.replace(/>/g, '\\>')
    .replace(/</g, '\\<')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/_/g, '\\_')
    .replace(/\|/g, '\\|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\*/g, '\\*');
  const finalText = /\`/g.test(text) ? text : `\`${text}\``;
  return encodeAngleBrackets(finalText);
}