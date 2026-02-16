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

  return {
    singleLine: singleLine,
    normIban: normIban,
    normBic: normBic,
    normAmount: normAmount,
    truncate: truncate,
    isValidIban: isValidIban,
    isValidBic: isValidBic
  };
});
