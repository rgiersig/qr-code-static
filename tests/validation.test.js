const assert = require('node:assert/strict');
const validation = require('../validation.js');

function run(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    throw err;
  }
}

run('IBAN Guttest 1 (DE)', () => {
  assert.equal(validation.isValidIban('DE02100100100006820101'), true);
});

run('IBAN Guttest 2 (AT)', () => {
  assert.equal(validation.isValidIban('AT022081500000698597'), true);
});

run('IBAN Schlechttest: leer', () => {
  assert.equal(validation.isValidIban(''), false);
});

run('IBAN Schlechttest: zu kurz', () => {
  assert.equal(validation.isValidIban('DE0210010010'), false);
});

run('IBAN Schlechttest: zu lang', () => {
  assert.equal(validation.isValidIban('DE0210010010000682010112345678901234'), false);
});

run('IBAN Schlechttest: unzulässiges Zeichen', () => {
  assert.equal(validation.isValidIban('DE02100100!0006820101'), false);
});

run('IBAN Schlechttest: falsche Prüfziffer', () => {
  assert.equal(validation.isValidIban('DE02100100100006820102'), false);
});

run('BIC Guttest 1', () => {
  assert.equal(validation.isValidBic('PBNKDEFF'), true);
});

run('BIC Guttest 2', () => {
  assert.equal(validation.isValidBic('STSPAT2G'), true);
});

run('BIC Schlechttest: leer', () => {
  assert.equal(validation.isValidBic(''), false);
});

run('BIC Schlechttest: zu kurz', () => {
  assert.equal(validation.isValidBic('PBNKDEF'), false);
});

run('BIC Schlechttest: zu lang', () => {
  assert.equal(validation.isValidBic('PBNKDEFFXXXZ'), false);
});

run('BIC Schlechttest: unzulässiges Zeichen', () => {
  assert.equal(validation.isValidBic('PBNKDE$F'), false);
});

run('Mailto: recipient without optional fields', () => {
  assert.equal(
    validation.buildMailto(' test@example.com ', '', ''),
    'mailto:test@example.com'
  );
});

run('Mailto: subject and body are URL encoded', () => {
  assert.equal(
    validation.buildMailto(
      'test@example.com',
      'Gr\u00fc\u00dfe & Termin',
      'Hallo!\nPasst 10:30 Uhr?'
    ),
    'mailto:test@example.com?subject=Gr%C3%BC%C3%9Fe%20%26%20Termin&body=Hallo!%0APasst%2010%3A30%20Uhr%3F'
  );
});

console.log('\nAlle Validation-Tests erfolgreich.');
