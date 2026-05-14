/**
 * Client-side HTML previews for Email templates admin (opens in a new tab via blob URL).
 * Layouts mirror production mail (newsletter / order status / shipped) with `buildPreviewBranding`:
 * prefers `GET /email-branding/preview` (logo + exact `getEmailBranding()` tints), else Site theme.
 */

import { buildPreviewBranding } from "./emailPreviewTheme";

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Logo row — same as production newsletter / status templates */
function previewLogoRow(b) {
  if (!b.logoUrl) return "";
  return `<tr>
      <td align="center" style="padding: 0 0 20px 0;">
        <img src="${escapeHtmlAttr(b.logoUrl)}" width="160" alt="${escapeHtmlAttr(b.logoAlt || "Store")}" style="display: block; border: 0; outline: none; text-decoration: none; height: auto; max-width: 160px; width: 160px;" />
      </td>
    </tr>`;
}

const PREVIEW_BANNER = `
  <div class="preview-banner">
    <strong>Preview</strong> — Current tab copy (saved or unsaved). <strong>Logo, colors &amp; fonts</strong> match the backend email branding module (same as sent mail). Sample data fills dynamic blocks.
  </div>`;

/** Welcome email: offer % is often duplicated across subject, heading, and intro — users may update only one field. */
const WELCOME_PREVIEW_EXTRA = `
  <div class="preview-banner-welcome-note">
    <strong>Welcome email:</strong> If the subject says 10% but the paragraph still says 5%, edit <strong>Intro paragraph (offer)</strong> (and <strong>Main heading</strong> if needed) — each field is separate; the preview shows exactly what is in those boxes.
  </div>`;

const PREVIEW_STYLES = `
  .preview-banner { font-family: system-ui, sans-serif; background: #eff6ff; border-bottom: 1px solid #bfdbfe; padding: 10px 16px; font-size: 12px; color: #1e40af; margin: 0 0 16px 0; }
  .preview-banner-welcome-note { font-family: system-ui, sans-serif; background: #fffbeb; border-bottom: 1px solid #fde68a; padding: 10px 16px; font-size: 12px; color: #92400e; margin: 0 0 16px 0; line-height: 1.45; }
  .subj { font-family: system-ui, sans-serif; font-size: 13px; color: #374151; margin-bottom: 16px; padding: 8px 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
`;

function fillSubjectPattern(pattern, orderNum, status) {
  return String(pattern || "")
    .replace(/\{\{orderNumber\}\}/g, orderNum)
    .replace(/\{\{status\}\}/g, status);
}

/** @param {ReturnType<typeof buildPreviewBranding>} b */
function buildWelcomePreview(b, f) {
  const e = escapeHtml;
  const fd = f || {};
  const store = escapeHtmlAttr(b.storeUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${b.googleFontsLinkHtml}
  <title>Preview: ${e(fd.subject || "Welcome email")}</title>
  <style type="text/css">
    ${PREVIEW_STYLES}
    .nl-preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body style="margin: 0; padding: 0; ${b.typo_p} background-color: ${b.mintBg}; color: ${b.textDark};">
  ${PREVIEW_BANNER}
  ${WELCOME_PREVIEW_EXTRA}
  <p class="subj"><strong>Subject:</strong> ${e(fd.subject || "")}</p>
  <span class="nl-preheader">${e((fd.heading || "").slice(0, 140))}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${b.mintBg};">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          ${previewLogoRow(b)}
          <tr>
            <td style="background: ${b.heroHeaderBg}; border-radius: 14px 14px 0 0; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; ${b.typo_h1} color: #ffffff; font-size: 26px; line-height: 1.25;">${e(fd.heading || "")}</h1>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 28px 18px 28px; text-align: left;">
                    <p style="margin: 0; ${b.typo_p} color: ${b.textDark};">Hi <em>Sample Customer</em>,</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 28px 8px 28px; text-align: left;">
                    <p style="margin: 0 0 16px 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.65;">${e(fd.bodyParagraph1 || "")}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 28px 28px 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${b.helpPanelBg}; border-radius: 12px; border: 2px dashed ${b.accentHex};">
                      <tr>
                        <td align="center" style="padding: 28px 20px;">
                          <p style="margin: 0 0 12px 0; ${b.typo_h3} color: ${b.textDark}; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">Your code</p>
                          <span style="display: inline-block; ${b.typo_h2} color: ${b.accentHex}; font-size: 28px; letter-spacing: 0.12em;">${e(fd.couponCode || "")}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 28px 28px 28px; text-align: left;">
                    <p style="margin: 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.65;">
                      ${e(fd.bodyParagraph2Intro || "")}
                      <a href="${store}" style="color: ${b.accentHex}; font-weight: 600; text-decoration: none;">${e(fd.shopLinkText || "")}</a>${e(fd.bodyParagraph2Outro || "")}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: ${b.footerBg}; border-radius: 0 0 14px 14px; padding: 24px 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; ${b.typo_p} color: rgba(255,255,255,0.92); font-size: 14px; line-height: 1.5;">${e(fd.footerTeamLine1 || "")}<br />${e(fd.footerTeamLine2 || "")}</p>
              <p style="margin: 0;">
                <a href="${store}" style="color: ${b.heroHighlightRgb}; ${b.typo_p} font-size: 14px; text-decoration: underline;">${e(fd.footerVisit || "")}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @param {ReturnType<typeof buildPreviewBranding>} b */
function buildHotUkPreview(b, f) {
  const e = escapeHtml;
  const fd = f || {};
  const store = escapeHtmlAttr(b.storeUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${b.googleFontsLinkHtml}
  <title>Preview: ${e(fd.subject || "Hot UK Deals")}</title>
  <style type="text/css">
    ${PREVIEW_STYLES}
    .nl-preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body style="margin: 0; padding: 0; ${b.typo_p} background-color: ${b.mintBg}; color: ${b.textDark};">
  ${PREVIEW_BANNER}
  <p class="subj"><strong>Subject:</strong> ${e(fd.subject || "")}</p>
  <span class="nl-preheader">${e((fd.headerTitle || "").slice(0, 140))}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${b.mintBg};">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          ${previewLogoRow(b)}
          <tr>
            <td style="background: ${b.heroHeaderBg}; border-radius: 14px 14px 0 0; padding: 32px 24px 28px 24px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; ${b.typo_h1} color: #ffffff; font-size: 26px; line-height: 1.25;">${e(fd.headerTitle || "")}</h1>
              <p style="margin: 0; ${b.typo_p} color: rgba(255,255,255,0.95); font-size: 16px; line-height: 1.5;">${e(fd.headerSubtitle || "")}</p>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 32px 28px 8px 28px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; ${b.typo_h2} color: ${b.textDark}; font-size: 22px; line-height: 1.3;">${e(fd.sectionHeading || "")}</h2>
              <p style="margin: 0 0 14px 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.65; text-align: left;">${e(fd.bodyLine1 || "")}</p>
              <p style="margin: 0 0 22px 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.65; text-align: left;">${e(fd.bodyLine2 || "")}</p>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0 28px 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${b.mintBg}; border-radius: 12px; border: 2px solid ${b.accentHex};">
                <tr>
                  <td align="center" style="padding: 24px 20px;">
                    <p style="margin: 0 0 10px 0; ${b.typo_p} color: ${b.textDark}; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">${e(fd.couponLabel || "")}</p>
                    <p style="margin: 0; ${b.typo_h2} color: ${b.accentHex}; font-size: 30px; letter-spacing: 0.14em;">${e(fd.couponCode || "")}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0 28px 12px 28px; text-align: left;">
              <p style="margin: 0 0 12px 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.65;">${e(fd.bodyLine4 || "")}</p>
              <p style="margin: 0 0 18px 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.65;">${e(fd.bodyLine5 || "")}</p>
              <p style="margin: 0 0 24px 0; ${b.typo_h3} color: ${b.textDark};">${e(fd.urgencyLine || "")}</p>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0 28px 36px 28px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius: 10px; background: ${b.accentHex};">
                    <a href="${store}" style="display: inline-block; padding: 16px 36px; ${b.typo_h3} font-size: 16px; color: #ffffff !important; text-decoration: none; border-radius: 10px;">${e(fd.ctaLabel || "")}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: ${b.footerBg}; border-radius: 0 0 14px 14px; padding: 24px 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; ${b.typo_p} color: rgba(255,255,255,0.92); font-size: 14px; line-height: 1.5;">${e(fd.footerTeamLine1 || "")}<br />${e(fd.footerTeamLine2 || "")}</p>
              <p style="margin: 0;">
                <a href="${store}" style="color: ${b.heroHighlightRgb}; ${b.typo_p} font-size: 14px; text-decoration: underline;">${e(fd.footerVisit || "")}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @param {ReturnType<typeof buildPreviewBranding>} b */
function buildOrderConfirmationPreview(b, oc, orderNum) {
  const e = escapeHtml;
  const o = oc || {};
  const store = escapeHtmlAttr(b.storeUrl);
  const sampleCart = `<table width="100%" cellpadding="10" style="font-size:14px;border-collapse:collapse;${b.typo_p}color:${b.textDark};"><tr style="border-bottom:1px solid rgba(0,0,0,0.08);"><td>Sample product · Qty 1</td><td align="right">£99.00</td></tr></table>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${b.googleFontsLinkHtml}
  <title>Preview: ${e(o.emailSubject || "Order confirmation")}</title>
  <style>${PREVIEW_STYLES}</style>
</head>
<body style="margin: 0; padding: 0; ${b.typo_p} background-color: ${b.mintBg}; color: ${b.textDark};">
  ${PREVIEW_BANNER}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${b.mintBg};">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          ${previewLogoRow(b)}
          <tr>
            <td style="background: ${b.heroHeaderBg}; border-radius: 14px 14px 0 0; padding: 28px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; ${b.typo_h1} font-size: 28px; line-height: 1.2; color: #ffffff;">${e(o.heroLineBefore || "")}<span style="color: ${b.heroHighlightRgb};">${e(o.heroLineHighlight || "")}</span></p>
              <p style="margin: 0; ${b.typo_p} font-size: 15px; color: rgba(255,255,255,0.95); line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">${e(o.heroSubtext || "")}</p>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 28px 28px 20px 28px;">
              <p class="subj" style="margin: 0 0 16px 0;"><strong>Email subject:</strong> ${e(o.emailSubject || "")}</p>
              <p style="margin: 0 0 20px 0; ${b.typo_h2} color: ${b.textDark}; font-size: 18px;">${e(o.sectionOrderDetails || "")}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;">Confirmation number: <strong style="color: ${b.accentHex};">${e(orderNum)}</strong></p>
              <p style="margin: 20px 0 12px 0; ${b.typo_h2} color: ${b.textDark}; font-size: 18px;">${e(o.sectionItemsOrdered || "")}</p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">Server builds cart rows — sample below</p>
              ${sampleCart}
              <p style="text-align: right; font-weight: bold; margin-top: 16px; color: ${b.textDark};">Subtotal £99.00 · Total £99.00</p>
            </td>
          </tr>
          <tr>
            <td style="background: ${b.helpPanelBg}; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 22px 28px;">
              <p style="margin: 0 0 8px 0; ${b.typo_h3} color: ${b.textDark};">${e(o.helpHeading || "")}</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${b.textDark};">
                ${e(o.helpBeforeEmail || "")} <a href="mailto:" style="color: ${b.accentHex};">${e(o.supportEmail || "")}</a> ${e(o.helpAfterEmail || "")}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: ${b.footerBg}; border-radius: 0 0 14px 14px; padding: 22px 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; ${b.typo_p} font-size: 12px; color: rgba(255,255,255,0.9);">${e(o.footerAddressLine || "")}</p>
              <p style="margin: 0 0 8px 0; ${b.typo_p} font-size: 12px; color: rgba(255,255,255,0.85);">${e(o.unsubscribeLead || "")} <a href="${store}" style="color: ${b.heroHighlightRgb};">${e(o.linkPrivacyText || "")}</a></p>
              <p style="margin: 0;"><a href="${store}" style="color: ${b.heroHighlightRgb}; font-size: 12px;">${e(o.linkTermsText || "")}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @param {ReturnType<typeof buildPreviewBranding>} b */
function buildOrderStatusPreview(b, fields, variant, orderNum) {
  const e = escapeHtml;
  const f = fields || {};
  const pattern = f.emailSubjectPattern || "";
  const statusSample = variant === "admin" ? "Shipped" : "Processing";
  const subjectResolved = fillSubjectPattern(pattern, orderNum, statusSample);
  const store = escapeHtmlAttr(b.storeUrl);
  const badgeColor = b.accentHex;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${b.googleFontsLinkHtml}
  <title>Preview: ${e(f.headerTitle || "Order status")}</title>
  <style type="text/css">
    ${PREVIEW_STYLES}
    .os-preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body style="margin: 0; padding: 0; ${b.typo_p} background-color: ${b.mintBg}; color: ${b.textDark};">
  ${PREVIEW_BANNER}
  <p class="subj"><strong>Subject pattern:</strong> ${e(pattern)}<br /><strong>Sample subject:</strong> ${e(subjectResolved)}</p>
  <span class="os-preheader">${e(f.labelOrderPrefix || "")}${e(orderNum)} — ${e(statusSample)}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${b.mintBg};">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          ${previewLogoRow(b)}
          <tr>
            <td style="background: ${b.statusHeaderBg}; border-radius: 14px 14px 0 0; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; ${b.typo_h1} color: #ffffff; font-size: 26px; line-height: 1.25;">${e(f.headerTitle || "")}</h1>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 28px 28px 20px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${b.helpPanelBg}; border-radius: 12px;">
                <tr>
                  <td style="padding: 22px 22px 18px 22px;">
                    <p style="margin: 0 0 12px 0; ${b.typo_h2} color: ${b.textDark}; font-size: 20px;">${e(f.labelOrderPrefix || "")}${e(orderNum)}</p>
                    <p style="margin: 0; ${b.typo_p} color: ${b.textDark}; line-height: 1.6;">
                      ${e(f.labelStatus || "")}
                      <span style="display: inline-block; margin-left: 6px; padding: 8px 16px; border-radius: 999px; ${b.typo_h3} font-size: 14px; color: #ffffff; background-color: ${badgeColor};">${e(statusSample)}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0 28px 16px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${b.mintBg}; border-radius: 10px; border-left: 4px solid ${b.accentHex};">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 6px 0; ${b.typo_h3} color: ${b.accentHex}; font-size: 13px;">${e(f.labelShippingOption || "")}</p>
                    <p style="margin: 0; ${b.typo_p} color: ${b.textDark};">Standard delivery</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 8px 28px 24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius: 10px; border-left: 4px solid ${b.accentHex}; background: ${b.mintBg};">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px 0; ${b.typo_h2} color: ${b.accentHex}; font-size: 17px;">${e(f.sectionCustomerDetails || "")}</p>
                    <p style="margin: 0 0 8px 0; ${b.typo_p} color: ${b.textDark};"><strong>${e(f.labelName || "")}</strong> Jane Doe</p>
                    <p style="margin: 0 0 8px 0; ${b.typo_p} color: ${b.textDark};"><strong>${e(f.labelEmail || "")}</strong> customer@example.com</p>
                    <p style="margin: 0 0 8px 0; ${b.typo_p} color: ${b.textDark};"><strong>${e(f.labelPhone || "")}</strong> 07123 456789</p>
                    <p style="margin: 12px 0 0 0; ${b.typo_p} color: ${b.textDark};"><strong>${e(f.labelAddress || "")}</strong><br />1 Sample Street<br />Sample City, County<br />AB1 2CD<br />United Kingdom</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0 28px 12px 28px;">
              <p style="margin: 0 0 16px 0; ${b.typo_h2} color: ${b.textDark}; font-size: 19px;">${e(f.sectionOrderSummary || "")}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding: 0 0 14px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; background: #ffffff;">
                      <tr>
                        <td style="padding: 18px 20px;">
                          <p style="margin: 0 0 10px 0; ${b.typo_h3} color: ${b.textDark};">Test Product</p>
                          <p style="margin: 0 0 6px 0; ${b.typo_p} font-size: 14px; color: ${b.textDark};"><strong>${e(f.labelQuantity || "")}</strong> 1</p>
                          <p style="margin: 0; ${b.typo_p} font-size: 14px; color: ${b.textDark};"><strong>${e(f.labelPrice || "")}</strong> £199.00</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 0 28px 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top: 2px solid ${b.accentHex}; padding-top: 18px;">
                <tr>
                  <td align="right">
                    <p style="margin: 0; ${b.typo_h2} color: ${b.textDark}; font-size: 18px;">${e(f.labelTotalOrderValue || "")} £199.00</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: ${b.footerBg}; border-radius: 0 0 14px 14px; padding: 24px 28px; text-align: center;">
              <p style="margin: 0 0 8px 0; ${b.typo_p} color: rgba(255,255,255,0.92); font-size: 14px; line-height: 1.55;">${e(f.footerLine1 || "")}</p>
              <p style="margin: 0 0 16px 0; ${b.typo_p} color: rgba(255,255,255,0.92); font-size: 14px; line-height: 1.55;">${e(f.footerLine2 || "")}</p>
              <p style="margin: 0;"><a href="${store}" style="color: ${b.heroHighlightRgb}; ${b.typo_p} font-size: 14px; font-weight: 600; text-decoration: underline;">Visit our store</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @param {ReturnType<typeof buildPreviewBranding>} b */
function buildShippedPreview(b, fields, orderNum) {
  const e = escapeHtml;
  const f = fields || {};
  const store = escapeHtmlAttr(b.storeUrl);
  const headerFooterBg = b.primaryHex;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${b.googleFontsLinkHtml}
  <title>Preview: ${e(f.htmlPageTitle || "Order shipped")}</title>
  <style>${PREVIEW_STYLES}</style>
</head>
<body style="margin: 0; padding: 0; ${b.typo_p} background-color: ${b.mintBg}; color: ${b.textDark};">
  ${PREVIEW_BANNER}
  <p class="subj"><strong>Email subject:</strong> ${e(f.emailSubject || "")}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${b.mintBg};">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          ${previewLogoRow(b)}
          <tr>
            <td style="background: ${headerFooterBg}; border-radius: 14px 14px 0 0; padding: 24px 28px; text-align: center;">
              <h1 style="margin: 0; ${b.typo_h1} color: #ffffff; font-size: 24px;">${e(f.headerTitle || "")}</h1>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06); border-right: 1px solid rgba(0,0,0,0.06); padding: 28px 28px;">
              <p style="margin: 0 0 16px 0; ${b.typo_p}">${e(f.greetingPrefix || "")} <strong>Jane</strong>,</p>
              <p style="margin: 0 0 20px 0; ${b.typo_p}; line-height: 1.6;">${e(f.introParagraph || "")}</p>
              <p style="margin: 0 0 8px 0;"><strong>${e(f.labelOrderNumber || "")}</strong> ${e(orderNum)}</p>
              <p style="margin: 16px 0 8px 0; ${b.typo_h3} color: ${b.textDark};">${e(f.labelProducts || "")}</p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px; ${b.typo_p}; color: ${b.textDark};">
                <li style="margin-bottom: 8px;">iPhone 14 · 128GB — ×1 — £499.00</li>
                <li>Case — ×1 — £15.00</li>
              </ul>
              <p style="margin: 0 0 8px 0;"><strong>${e(f.labelCarrier || "")}</strong> Royal Mail</p>
              <p style="margin: 0 0 16px 0;"><strong>${e(f.labelTracking || "")}</strong> RM123456789GB</p>
              <p style="margin: 0 0 16px 0; ${b.typo_p}">${e(f.beforeTrackButton || "")}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="left" style="margin-bottom: 16px;">
                <tr>
                  <td style="border-radius: 8px; background: ${b.accentHex};">
                    <a href="${store}" style="display: inline-block; padding: 12px 22px; ${b.typo_h3} font-size: 15px; color: #ffffff !important; text-decoration: none; border-radius: 8px;">${e(f.trackButtonText || "")}</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; ${b.typo_p}">${e(f.closingThanksLine || "")}</p>
            </td>
          </tr>
          <tr>
            <td style="background: ${headerFooterBg}; border-radius: 0 0 14px 14px; padding: 22px 28px; text-align: center;">
              <p style="margin: 0 0 6px 0; ${b.typo_p} color: rgba(255,255,255,0.95); font-size: 14px;">${e(f.footerLine1 || "")}</p>
              <p style="margin: 0 0 6px 0; ${b.typo_p} color: rgba(255,255,255,0.95); font-size: 14px;">${e(f.footerLine2 || "")}</p>
              <p style="margin: 0; ${b.typo_p} color: rgba(255,255,255,0.95); font-size: 14px;">${e(f.footerLine3 || "")}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * @param {string} tabId — EMAIL_TABS id
 * @param {object} payload — current form state from EmailTemplatesSettings
 */
export function buildEmailPreviewHtml(tabId, payload) {
  const b = buildPreviewBranding(payload);
  const orderNum = payload?.previewOrderExample || "Z20260001";
  switch (tabId) {
    case "welcome":
      return buildWelcomePreview(b, payload?.welcome);
    case "hotUk":
      return buildHotUkPreview(b, payload?.hotUk);
    case "orderConfirmation":
      return buildOrderConfirmationPreview(b, payload?.orderConfirmation, orderNum);
    case "orderStatusCustomer":
      return buildOrderStatusPreview(b, payload?.orderStatusCustomer, "customer", orderNum);
    case "orderStatusAdmin":
      return buildOrderStatusPreview(b, payload?.orderStatusAdmin, "admin", orderNum);
    case "orderShippedCustomer":
      return buildShippedPreview(b, payload?.orderShippedCustomer, orderNum);
    default:
      return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Preview</title>${b.googleFontsLinkHtml}<style>${PREVIEW_STYLES}body{${b.typo_p};padding:20px;background:${b.mintBg};}</style></head><body>${PREVIEW_BANNER}<p>Unknown tab.</p></body></html>`;
  }
}

export function openEmailPreviewInNewTab(tabId, payload) {
  const html = buildEmailPreviewHtml(tabId, payload);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    window.alert("Could not open preview. Allow pop-ups for this site and try again.");
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 120000);
}
