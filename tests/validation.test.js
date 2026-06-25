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

run('Mailto: CC and BCC are encoded', () => {
  assert.equal(
    validation.buildMailto(
      'to@example.com',
      'Info',
      '',
      'copy@example.com',
      'blind@example.com'
    ),
    'mailto:to@example.com?cc=copy%40example.com&bcc=blind%40example.com&subject=Info'
  );
});

run('Telephone URI removes whitespace', () => {
  assert.equal(validation.buildTel(' +43 1 234 56 78 '), 'tel:+4312345678');
});

run('vCard contains escaped contact data', () => {
  assert.equal(
    validation.buildVCard({
      firstName: 'Anna',
      lastName: 'Muster',
      organization: 'Beispiel, GmbH',
      title: 'Leitung',
      phone: '+43 1 2345',
      email: 'anna@example.com',
      street: 'Hauptstra\u00dfe 1',
      postalCode: '1010',
      city: 'Wien',
      country: '\u00d6sterreich',
      website: 'https://example.com'
    }),
    [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Muster;Anna;;;',
      'FN:Anna Muster',
      'ORG:Beispiel\\, GmbH',
      'TITLE:Leitung',
      'TEL;TYPE=CELL:+43 1 2345',
      'EMAIL;TYPE=INTERNET:anna@example.com',
      'ADR;TYPE=WORK:;;Hauptstra\u00dfe 1;Wien;;1010;\u00d6sterreich',
      'URL:https://example.com',
      'END:VCARD'
    ].join('\r\n')
  );
});

run('Calendar event uses local date-times and escaped text', () => {
  assert.equal(
    validation.buildCalendarEvent({
      title: 'Planung, Teil 1',
      start: '2026-07-01T09:30',
      end: '2026-07-01T10:45',
      location: 'Wien; B\u00fcro',
      description: 'Zeile 1\nZeile 2'
    }, new Date('2026-06-25T10:20:30Z')),
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//qr-code-static//QR Generator//DE',
      'BEGIN:VEVENT',
      'UID:7794eed9@qr-code-static',
      'DTSTAMP:20260625T102030Z',
      'DTSTART:20260701T093000',
      'DTEND:20260701T104500',
      'SUMMARY:Planung\\, Teil 1',
      'LOCATION:Wien\\; B\u00fcro',
      'DESCRIPTION:Zeile 1\\nZeile 2',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
  );
});

run('Calendar event supports multiple VALARM reminders', () => {
  const event = validation.buildCalendarEvent({
    title: 'Besprechung',
    start: '2026-07-01T09:30',
    end: '2026-07-01T10:45',
    location: '',
    description: '',
    reminders: [
      { trigger: '-P1W', label: 'Erinnerung: Termin in 1 Woche' },
      { trigger: '-P2D', label: 'Erinnerung: Termin in 2 Tagen' },
      { trigger: '-P1D', label: 'Erinnerung: Termin in 1 Tag' },
      { trigger: '-PT2H', label: 'Erinnerung: Termin in 2 Stunden' },
      { trigger: '-PT1H', label: 'Erinnerung: Termin in 1 Stunde' },
      { trigger: '-PT30M', label: 'Erinnerung: Termin in 30 Minuten' },
      { trigger: '-PT15M', label: 'Erinnerung: Termin in 15 Minuten' }
    ]
  }, new Date('2026-06-25T10:20:30Z'));

  assert.equal((event.match(/BEGIN:VALARM/g) || []).length, 7);
  ['-P1W', '-P2D', '-P1D', '-PT2H', '-PT1H', '-PT30M', '-PT15M']
    .forEach((trigger) => assert.ok(event.includes(`TRIGGER:${trigger}\r\n`)));
  assert.match(
    event,
    /BEGIN:VALARM\r\nTRIGGER:-PT1H\r\nACTION:DISPLAY\r\nDESCRIPTION:Erinnerung: Termin in 1 Stunde\r\nEND:VALARM/
  );
});

console.log('\nAlle Validation-Tests erfolgreich.');
