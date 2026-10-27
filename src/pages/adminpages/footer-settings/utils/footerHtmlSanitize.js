/**
 * Same cleaning the website applies to the footer's custom HTML, so the admin
 * preview shows what visitors will actually get. Keep in step with the
 * website's `components/footer/footerHtmlSanitize.ts`.
 */

/** Removed together with everything inside them. */
const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "link",
  "meta",
  "base",
  "title",
  "object",
  "embed",
  "applet",
  "frame",
  "frameset",
  "noscript",
  "noembed",
  "noframes",
  "template",
  "xmp",
  "plaintext",
  "math",
]);

const URL_ATTRS = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "xlink:href",
  "poster",
  "data",
  "background",
]);

const SAFE_URL = /^(?:https?:|mailto:|tel:|sms:|#|\/|\.\/|\.\.\/|\?)/i;

/** Browsers ignore whitespace and control characters inside a URL scheme. */
function compactUrl(value) {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000- \u007f-\u009f]/g, "");
}

function isAllowedUrl(tag, value) {
  const url = compactUrl(value);
  if (!url) return true;
  if (SAFE_URL.test(url)) return true;
  if (/^data:image\//i.test(url)) return tag === "img" || tag === "source";
  // No scheme at all → relative path ("images/logo.png").
  return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

function cleanTree(doc, collectedCss, counter) {
  const comments = [];
  const commentWalker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
  while (commentWalker.nextNode()) comments.push(commentWalker.currentNode);
  comments.forEach((node) => node.parentNode?.removeChild(node));

  for (const el of Array.from(doc.querySelectorAll("*"))) {
    if (!doc.contains(el)) continue; // went with a removed parent
    const tag = el.localName.toLowerCase();

    if (BLOCKED_TAGS.has(tag)) {
      // Pasted <style> blocks are kept as CSS, not counted as removed.
      if (tag === "style" && el.namespaceURI === "http://www.w3.org/1999/xhtml") {
        collectedCss.push(el.textContent || "");
      } else {
        counter.removed += 1;
      }
      el.remove();
      continue;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const compact = compactUrl(attr.value).toLowerCase();
      const dangerousValue =
        compact.startsWith("javascript:") ||
        compact.startsWith("vbscript:") ||
        compact.startsWith("data:text/html");

      if (
        name.startsWith("on") ||
        name === "srcdoc" ||
        dangerousValue ||
        (URL_ATTRS.has(name) && !isAllowedUrl(tag, attr.value))
      ) {
        el.removeAttribute(attr.name);
        counter.removed += 1;
      }
    }

    // SVG animation can rewrite a link's target after the checks above.
    if (
      (tag === "animate" || tag === "set") &&
      /href/i.test(el.getAttribute("attributeName") || "")
    ) {
      el.remove();
      counter.removed += 1;
      continue;
    }

    if (tag === "iframe") {
      el.textContent = "";
      if (!/^https?:/i.test(compactUrl(el.getAttribute("src") || ""))) {
        el.remove();
        counter.removed += 1;
        continue;
      }
    }

    if (tag === "a" && el.getAttribute("target") === "_blank") {
      el.setAttribute("rel", "noopener noreferrer");
    }
  }
}

/**
 * @returns {{ html: string, css: string, removed: number }} cleaned markup, the
 * CSS from any pasted `<style>` blocks, and how many unsafe pieces were dropped.
 */
export function sanitizeFooterHtml(rawHtml) {
  const source = String(rawHtml ?? "");
  if (!source.trim() || typeof DOMParser === "undefined") {
    return { html: "", css: "", removed: 0 };
  }

  const collectedCss = [];
  const counter = { removed: 0 };
  let html = source;
  // Re-parse the cleaned result until it stops changing, so markup that only
  // turns dangerous when it is parsed a second time is caught as well.
  for (let pass = 0; pass < 3; pass++) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    cleanTree(doc, collectedCss, counter);
    const next = doc.body ? doc.body.innerHTML : "";
    if (next === html) break;
    html = next;
  }

  return {
    html: html.trim(),
    css: collectedCss.join("\n").trim(),
    removed: counter.removed,
  };
}
