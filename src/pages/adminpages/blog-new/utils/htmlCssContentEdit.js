/**
 * HTML ⇄ plain-Text document sync for the HTML/CSS widget.
 * HTML string is the source of truth. Text tab is derived + reverse-mapped via source ranges.
 */

const TEXT_PARENT_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "li",
  "button",
  "a",
  "label",
  "strong",
  "b",
  "em",
  "i",
  "small",
]);

/** Outermost of these defines a visual Text-document block (joined with editor-only separators). */
const BOUNDARY_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "li",
  "button",
  "a",
  "span",
  "label",
]);

const SKIP_CONTENT_TAGS = new Set([
  "script",
  "style",
  "textarea",
  "noscript",
  "template",
]);

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/** Editor-only separator between content blocks — never written into HTML source. */
export const TEXT_BLOCK_SEPARATOR = "\n\n";

export function decodeHtmlEntities(raw) {
  const str = String(raw ?? "");
  if (!str) return "";
  if (typeof document !== "undefined") {
    const ta = document.createElement("textarea");
    ta.innerHTML = str;
    return ta.value;
  }
  return str
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function encodeHtmlText(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeCssForStyleElement(css) {
  return String(css ?? "").replace(/<\/style/gi, "<\u200c/style");
}

export function stripScriptsForPreview(html) {
  return String(html ?? "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "");
}

function outermostBoundary(stack) {
  for (let i = 0; i < stack.length; i += 1) {
    if (BOUNDARY_TAGS.has(stack[i].name)) return stack[i];
  }
  return null;
}

function inTextParent(stack) {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (TEXT_PARENT_TAGS.has(stack[i].name)) return true;
  }
  return false;
}

/**
 * Extract text-node segments with exact source ranges, grouped into readable blocks.
 */
export function extractTextDocumentModel(html) {
  const source = String(html ?? "");
  const segments = [];
  const stack = [];
  let i = 0;
  let segId = 0;
  let skipDepth = 0;

  while (i < source.length) {
    if (source[i] !== "<") {
      const next = source.indexOf("<", i);
      const end = next === -1 ? source.length : next;
      if (skipDepth === 0 && inTextParent(stack)) {
        const raw = source.slice(i, end);
        if (raw.trim().length > 0) {
          const boundary = outermostBoundary(stack);
          const parent = stack[stack.length - 1];
          segments.push({
            id: String(segId++),
            type: "text",
            tagName: parent ? parent.name : "",
            groupKey: boundary ? boundary.openStart : i,
            start: i,
            end,
            raw,
            text: decodeHtmlEntities(raw),
          });
        }
      }
      i = end;
      continue;
    }

    if (source.startsWith("<!--", i)) {
      const endComment = source.indexOf("-->", i + 4);
      i = endComment === -1 ? source.length : endComment + 3;
      continue;
    }

    if (source.startsWith("<![CDATA[", i)) {
      const endCdata = source.indexOf("]]>", i + 9);
      i = endCdata === -1 ? source.length : endCdata + 3;
      continue;
    }

    const close = source.slice(i).match(/^<\/\s*([a-zA-Z][\w:-]*)\s*>/);
    if (close) {
      const name = close[1].toLowerCase();
      if (SKIP_CONTENT_TAGS.has(name) && skipDepth > 0) skipDepth -= 1;
      for (let s = stack.length - 1; s >= 0; s -= 1) {
        if (stack[s].name === name) {
          stack.length = s;
          break;
        }
      }
      i += close[0].length;
      continue;
    }

    const open = source
      .slice(i)
      .match(/^<\s*([a-zA-Z][\w:-]*)\b([^<>]*?)(\/?)\s*>/);
    if (!open) {
      i += 1;
      continue;
    }

    const name = open[1].toLowerCase();
    const openStart = i;
    const selfClosing = Boolean(open[3]) || VOID_TAGS.has(name);
    i += open[0].length;

    if (SKIP_CONTENT_TAGS.has(name)) {
      if (!selfClosing) skipDepth += 1;
      continue;
    }
    if (selfClosing) continue;

    stack.push({
      name,
      openStart,
    });
  }

  const groupMap = new Map();
  const groupOrder = [];
  segments.forEach((seg) => {
    const key = String(seg.groupKey);
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
      groupOrder.push(key);
    }
    groupMap.get(key).push(seg);
  });

  const groups = groupOrder.map((key, index) => {
    const segs = groupMap.get(key);
    return {
      id: `g-${index}`,
      segments: segs,
      text: segs.map((s) => s.text).join(""),
    };
  });

  const documentText = groups.map((g) => g.text).join(TEXT_BLOCK_SEPARATOR);

  return { segments, groups, documentText };
}

/**
 * Map an edited plain-text group back onto its source segments.
 * Returns new text per segment, or null if ambiguous.
 */
export function distributeGroupTextToSegments(segments, newText) {
  const list = Array.isArray(segments) ? segments : [];
  const next = String(newText ?? "");
  if (list.length === 0) return null;
  if (list.length === 1) return [next];

  const result = list.map((s) => s.text);
  let remaining = next;
  let i = 0;
  const n = list.length;

  while (i < n - 1 && remaining.startsWith(list[i].text)) {
    result[i] = list[i].text;
    remaining = remaining.slice(list[i].text.length);
    i += 1;
  }

  let j = n - 1;
  while (j > i && remaining.endsWith(list[j].text)) {
    result[j] = list[j].text;
    remaining = remaining.slice(0, remaining.length - list[j].text.length);
    j -= 1;
  }

  if (i === j) {
    result[i] = remaining;
    return result;
  }

  // Multiple nested segments changed together — keep tags, put all new text in
  // the first changed segment and clear the following ones in the gap.
  if (i < j) {
    result[i] = remaining;
    for (let k = i + 1; k <= j; k += 1) {
      result[k] = "";
    }
    return result;
  }

  if (remaining.length > 0) return null;
  return result;
}

/**
 * Apply one or more segment replacements (highest source index first).
 * Returns updated HTML or null if any mapping is stale / invalid.
 */
export function applySegmentUpdates(html, updates) {
  const source = String(html ?? "");
  const list = Array.isArray(updates) ? updates.slice() : [];
  if (list.length === 0) return source;

  list.sort((a, b) => b.start - a.start);
  let result = source;

  for (let u = 0; u < list.length; u += 1) {
    const item = list[u];
    if (
      !item ||
      typeof item.start !== "number" ||
      typeof item.end !== "number" ||
      item.start < 0 ||
      item.end > result.length ||
      item.start > item.end
    ) {
      return null;
    }
    if (result.slice(item.start, item.end) !== item.raw) {
      return null;
    }
    const encoded = encodeHtmlText(item.nextText);
    result = result.slice(0, item.start) + encoded + result.slice(item.end);
  }

  return result;
}

/**
 * Split / align an edited plain-text document onto the existing group list.
 * Tries blank-line blocks, then non-empty lines, then ordered anchors.
 * Returns string[] of length groups.length, or null if unsafe.
 */
export function alignEditedDocumentToGroups(groups, editedDocument) {
  const list = Array.isArray(groups) ? groups : [];
  const n = list.length;
  if (n === 0) return [];

  const doc = String(editedDocument ?? "").replace(/\r\n/g, "\n");
  const trimmed = doc.replace(/^\s+|\s+$/g, "");

  const blankParts = trimmed
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/^\s+|\s+$/g, ""));
  if (blankParts.length === n) return blankParts;

  const lines = trimmed
    .split("\n")
    .map((l) => l.replace(/^\s+|\s+$/g, ""))
    .filter((l) => l.length > 0);
  if (lines.length === n) return lines;

  // Ordered anchors: unchanged group texts found in sequence bound edited regions.
  const result = [];
  let cursor = 0;
  for (let i = 0; i < n; i += 1) {
    while (cursor < doc.length && /\s/.test(doc[cursor])) cursor += 1;

    const expected = list[i].text;
    if (
      expected &&
      doc.slice(cursor, cursor + expected.length) === expected
    ) {
      result.push(expected);
      cursor += expected.length;
      continue;
    }

    let bound = doc.length;
    for (let j = i + 1; j < n; j += 1) {
      const needle = list[j].text;
      if (!needle) continue;
      const at = doc.indexOf(needle, cursor);
      if (at === -1) continue;
      bound = at;
      break;
    }

    // If this is not the last group and we could not find any later anchor,
    // do not dump the remainder into this group (would empty the rest).
    if (i < n - 1 && bound === doc.length) {
      return null;
    }

    let chunk = doc.slice(cursor, bound).replace(/^\s+|\s+$/g, "");
    chunk = chunk.replace(/\s*\n\s*/g, " ").trim();
    result.push(chunk);
    cursor = bound;
  }

  if (result.length !== n) return null;
  return result;
}

/**
 * Sync edited Text document back to HTML using a frozen model snapshot.
 * Returns { html } or { html: null, reason } when unsafe.
 */
export function syncTextDocumentToHtml(originalHtml, model, editedDocument) {
  const html = String(originalHtml ?? "");
  const doc = String(editedDocument ?? "");
  const groups = model && Array.isArray(model.groups) ? model.groups : [];

  if (groups.length === 0) {
    return { html: doc.trim() === "" ? html : null, reason: "empty-model" };
  }

  const expected = groups.map((g) => g.text).join(TEXT_BLOCK_SEPARATOR);
  if (doc === expected) {
    return { html };
  }

  const parts = alignEditedDocumentToGroups(groups, doc);
  if (!parts || parts.length !== groups.length) {
    return { html: null, reason: "block-count-mismatch" };
  }

  const updates = [];

  for (let gi = 0; gi < groups.length; gi += 1) {
    const group = groups[gi];
    const newGroupText = parts[gi];
    if (newGroupText === group.text) continue;

    const distributed = distributeGroupTextToSegments(
      group.segments,
      newGroupText
    );
    if (!distributed) {
      return { html: null, reason: "ambiguous-nested-edit" };
    }

    for (let si = 0; si < group.segments.length; si += 1) {
      const seg = group.segments[si];
      const nextText = distributed[si];
      if (nextText === seg.text) continue;
      updates.push({
        start: seg.start,
        end: seg.end,
        raw: seg.raw,
        nextText,
      });
    }
  }

  if (updates.length === 0) {
    return { html };
  }

  const updated = applySegmentUpdates(html, updates);
  if (updated == null) {
    return { html: null, reason: "stale-mapping" };
  }

  return { html: updated };
}

/**
 * Preview-only: after a clean iframe render, wrap matched text nodes for editing.
 * Never persist these wrappers into block.content.html.
 */
export function attachPreviewEditTargets(doc, segments) {
  if (!doc?.body || !Array.isArray(segments) || segments.length === 0) {
    return { attached: 0, targets: [] };
  }

  const skip = SKIP_CONTENT_TAGS;
  const textParents = TEXT_PARENT_TAGS;
  const nodes = [];

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const value = node.nodeValue;
      if (!value || !String(value).trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (parent?.getAttribute?.("data-cms-edit-id") != null) {
        return NodeFilter.FILTER_REJECT;
      }
      let el = parent;
      while (el && el !== doc.body) {
        const tag = String(el.tagName || "").toLowerCase();
        if (skip.has(tag)) return NodeFilter.FILTER_REJECT;
        if (textParents.has(tag)) return NodeFilter.FILTER_ACCEPT;
        el = el.parentElement;
      }
      return NodeFilter.FILTER_REJECT;
    },
  });

  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  // Include already-wrapped targets so remount/rebind keeps ids stable
  const existing = Array.from(doc.querySelectorAll("[data-cms-edit-id].cms-html-edit-node"));
  if (existing.length > 0 && nodes.length === 0) {
    const reused = [];
    existing.forEach((el, index) => {
      const seg = segments[index];
      if (seg) el.setAttribute("data-cms-edit-id", String(seg.id));
      reused.push(el);
    });
    return { attached: reused.length, targets: reused };
  }

  const count = Math.min(nodes.length, segments.length);
  const targets = [];

  for (let i = 0; i < count; i += 1) {
    const textNode = nodes[i];
    const seg = segments[i];
    if (!textNode || !seg) continue;

    // Already wrapped from a previous attach on same document
    if (
      textNode.parentElement?.getAttribute?.("data-cms-edit-id") != null &&
      textNode.parentElement.classList?.contains("cms-html-edit-node")
    ) {
      textNode.parentElement.setAttribute("data-cms-edit-id", String(seg.id));
      targets.push(textNode.parentElement);
      continue;
    }

    const wrap = doc.createElement("span");
    wrap.setAttribute("data-cms-edit-id", String(seg.id));
    wrap.className = "cms-html-edit-node";
    wrap.setAttribute("contenteditable", "plaintext-only");
    wrap.setAttribute("spellcheck", "true");
    textNode.parentNode.insertBefore(wrap, textNode);
    wrap.appendChild(textNode);
    targets.push(wrap);
  }

  return { attached: targets.length, targets };
}

const PREVIEW_EDIT_CHROME_CSS = `
.cms-html-edit-node {
  outline: 1px dashed transparent;
  outline-offset: 2px;
  cursor: text;
  border-radius: 2px;
  transition: outline-color 0.12s ease, background-color 0.12s ease;
}
.cms-html-edit-node:hover {
  outline-color: rgba(124, 58, 237, 0.55);
  background-color: rgba(124, 58, 237, 0.06);
}
.cms-html-edit-node:focus {
  outline: 2px solid rgba(124, 58, 237, 0.85);
  outline-offset: 2px;
  background-color: rgba(124, 58, 237, 0.08);
}
`;

/** Same HTML string used for preview render + blur commit mapping. */
export function getPreviewEditModel(html) {
  const safeHtml = stripScriptsForPreview(html);
  const model = extractTextDocumentModel(safeHtml);
  return { safeHtml, ...model };
}

export function buildHtmlCssPreviewSrcDoc({ html, css, editable = false }) {
  const safeHtml = stripScriptsForPreview(html);
  const safeCss = sanitizeCssForStyleElement(css);
  const editCss = editable ? PREVIEW_EDIT_CHROME_CSS : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
html, body { margin: 0; padding: 0; }
body { padding: 12px; box-sizing: border-box; }
${safeCss}
${editCss}
</style>
</head>
<body>${safeHtml}</body>
</html>`;
}
