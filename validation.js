(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Validation = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function singleLine(value) {
    return (value || "").replace(/\r?\n+/g, " ").trim();
  }

  function normIban(value) {
    return (value || "").replace(/\s+/g, "").toUpperCase().trim();
  }

  function normBic(value) {
    return (value || "").replace(/\s+/g, "").toUpperCase().trim();
  }

  function normAmount(value) {
    var raw = (value || "").trim().replace(/\s+/g, "").replace(",", ".");
    if (!raw) return "";
    var n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return "";
    return "EUR" + n.toFixed(2);
  }

  function truncate(value, maxLen) {
    var v = value || "";
    return v.length > maxLen ? v.slice(0, maxLen) : v;
  }

  function isValidIban(value) {
    var iban = normIban(value);
    if (!iban) return false;
    if (iban.length < 15 || iban.length > 34) return false;
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;

    var rearranged = iban.slice(4) + iban.slice(0, 4);
    var remainder = 0;

    for (var i = 0; i < rearranged.length; i += 1) {
      var char = rearranged[i];
      var converted = char >= "A" && char <= "Z"
        ? String(char.charCodeAt(0) - 55)
        : char;

      for (var j = 0; j < converted.length; j += 1) {
        remainder = (remainder * 10 + Number(converted[j])) % 97;
      }
    }

    return remainder === 1;
  }

  function isValidBic(value) {
    var bic = normBic(value);
    if (!bic) return false;
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic);
  }

  function buildMailto(address, subject, body, cc, bcc) {
    var recipient = singleLine(address);
    var params = [];

    if (cc) params.push("cc=" + encodeURIComponent(singleLine(cc)));
    if (bcc) params.push("bcc=" + encodeURIComponent(singleLine(bcc)));
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (body) params.push("body=" + encodeURIComponent(body));

    return "mailto:" + recipient + (params.length ? "?" + params.join("&") : "");
  }

  function buildTel(number) {
    return "tel:" + singleLine(number).replace(/\s+/g, "");
  }

  function escapeStructuredText(value) {
    return (value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function buildVCard(data) {
    var firstName = singleLine(data.firstName);
    var lastName = singleLine(data.lastName);
    var displayName = singleLine((firstName + " " + lastName).trim() || data.organization);
    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:" + escapeStructuredText(lastName) + ";" + escapeStructuredText(firstName) + ";;;",
      "FN:" + escapeStructuredText(displayName)
    ];

    if (data.organization) lines.push("ORG:" + escapeStructuredText(singleLine(data.organization)));
    if (data.title) lines.push("TITLE:" + escapeStructuredText(singleLine(data.title)));
    if (data.phone) lines.push("TEL;TYPE=CELL:" + singleLine(data.phone));
    if (data.email) lines.push("EMAIL;TYPE=INTERNET:" + singleLine(data.email));
    if (data.street || data.postalCode || data.city || data.country) {
      lines.push([
        "ADR;TYPE=WORK:;;",
        escapeStructuredText(singleLine(data.street)),
        ";",
        escapeStructuredText(singleLine(data.city)),
        ";;",
        escapeStructuredText(singleLine(data.postalCode)),
        ";",
        escapeStructuredText(singleLine(data.country))
      ].join(""));
    }
    if (data.website) lines.push("URL:" + singleLine(data.website));
    lines.push("END:VCARD");
    return lines.join("\r\n");
  }

  function formatCalendarDateTime(value) {
    var raw = (value || "").trim();
    if (!raw) return "";
    return raw.replace(/[-:]/g, "").replace(/\.\d+$/, "") + (raw.length === 16 ? "00" : "");
  }

  function formatUtcDate(date) {
    var d = date instanceof Date ? date : new Date(date);
    if (!Number.isFinite(d.getTime())) return "";
    var p = function (n) { return String(n).padStart(2, "0"); };
    return d.getUTCFullYear()
      + p(d.getUTCMonth() + 1)
      + p(d.getUTCDate())
      + "T"
      + p(d.getUTCHours())
      + p(d.getUTCMinutes())
      + p(d.getUTCSeconds())
      + "Z";
  }

  function hashText(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  function buildCalendarEvent(data, now) {
    var start = formatCalendarDateTime(data.start);
    var end = formatCalendarDateTime(data.end);
    var seed = [data.title, start, end, data.location, data.description].join("|");
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//qr-code-static//QR Generator//DE",
      "BEGIN:VEVENT",
      "UID:" + hashText(seed) + "@qr-code-static",
      "DTSTAMP:" + formatUtcDate(now || new Date())
    ];

    if (start) lines.push("DTSTART:" + start);
    if (end) lines.push("DTEND:" + end);
    if (data.title) lines.push("SUMMARY:" + escapeStructuredText(singleLine(data.title)));
    if (data.location) lines.push("LOCATION:" + escapeStructuredText(singleLine(data.location)));
    if (data.description) lines.push("DESCRIPTION:" + escapeStructuredText(data.description));
    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.join("\r\n");
  }

  return {
    singleLine: singleLine,
    normIban: normIban,
    normBic: normBic,
    normAmount: normAmount,
    truncate: truncate,
    isValidIban: isValidIban,
    isValidBic: isValidBic,
    buildMailto: buildMailto,
    buildTel: buildTel,
    escapeStructuredText: escapeStructuredText,
    buildVCard: buildVCard,
    formatCalendarDateTime: formatCalendarDateTime,
    buildCalendarEvent: buildCalendarEvent
  };
});
