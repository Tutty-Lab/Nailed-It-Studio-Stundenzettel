# Dienstplan & Stundenzettel — Nailed it Studio

App für **Nailed it Studio**, Schössergasse 23, 01067 Dresden (Sachsen).
Oberfläche auf Vietnamesisch. Gültig ab **Oktober 2026**; die
Papier-Stundenzettel davor werden nicht nachgetragen. Ein Laden, ein Passwort,
eine Zeile in Supabase (`store_id = "nailedit"`).

## Öffnung

- Termine über Treatwell (keine Integration), keine festen Schichten.
- Jeden Öffnungstag muss jemand **um 09:00 aufschließen** und jemand **bis 20:00**
  da sein → harte Regel „Trong giờ mở cửa" 09:00–20:00, nie null Personen.
- Vorläufig **Mo–Sa** offen, Sonntag und Feiertage (Sachsen: u. a.
  Reformationstag 31.10., Buß- und Bettag) zu. **Öffnungstage noch vom Betrieb
  zu bestätigen** – änderbar im Tab „Cài đặt".
- Starke Tage **Mo, Do, Fr** (Tagesgewicht 1,5); dort 09–12 und 14–17 Uhr
  mindestens 2 Personen (höchstens 4).
- Pause nur bei langen Diensten nach ArbZG (über 6 h: 30 min, über 8 h: 60 min,
  nie mehr als 6 h am Stück); kurze Dienste ohne Pause.
- Höchstens 8 bezahlte Stunden am Tag, höchstens 5 Tage je Woche.

## Belegschaft (ab 01.10.2026)

| Person | Vertrag | Hinweis |
|---|---|---|
| Phan Ngô Đức Việt | 80 h/Monat | |
| Đinh Thị Vân Anh | 70 h/Monat | |
| Lê Thị Xuân Quỳnh | 70 h/Monat | |
| Nguyễn Hà Linh | 70 h/Monat | |
| Lê Nguyễn Bảo Ngọc | Minijob 630 €/Monat | Stunden = 630 € ÷ Stundenlohn (vorläufig 13,90 € → 45,32 h) |
| Nguyễn Quỳnh Như | 80 h/Monat | Austritt 31.10.2026 (genauer Tag zu bestätigen) |

Die Inhaberin („Chủ tiệm") hilft gelegentlich mit: ohne Soll, wird nie
automatisch eingeplant, kann aber im Tab „Lịch" von Hand eingetragen werden
und zählt dann zur Besetzung.

## Lohn & Stunden je Monat

- Jede Person: Lương tháng (€), Lương giờ (€/h), Giờ/tháng, Ngày vào/thôi làm.
- Sind Lương tháng **und** Lương giờ eingetragen: Soll = Lương tháng ÷ Lương giờ.
  Wird das Soll direkt eingetippt, gilt die eingegebene Zahl.
- Tab „Nhân viên" → „Lương & giờ mục tiêu tháng …": Werte nur für den gewählten
  Monat. Jeder Monat wird als eigener Eintrag gespeichert (`payrollRecords`);
  „Tạo lịch" legt für noch nicht gespeicherte Personen automatisch den
  aktuellen Stand ab. Spätere Änderungen verändern frühere Monate nicht.

## Urlaub / Austritt / Eintritt über Monatsgrenzen

- Urlaub (bezahlt) oder „Không lương" (unbezahlt) als Zeitraum, darf über
  Monate gehen (z. B. 21.10.–21.11.). An diesen Tagen kein Dienst.
- Soll je Monat = volles Monats-Soll × (offene Tage, an denen die Person da ist
  ÷ offene Tage des Monats), auf 30 Minuten gerundet. Beispiel 80 h,
  Urlaub 21.10.–21.11.2026: Oktober 16/25 Tage → 51 h, November 7/24 → 23,5 h.
- Eintritt/Austritt mitten im Monat wird genauso anteilig gerechnet.
- Fehlen dadurch Stunden für Öffnen/Schließen, meldet das Dashboard die
  Lücken; dann im Monats-Lohnfenster Stunden anderer erhöhen oder die
  Inhaberin von Hand eintragen. Auswertung: `docs/danh-gia-12-thang.md`.

## Ablauf

1. Monat oben wählen, Lohn/Stunden prüfen und speichern.
2. „Tạo lịch" – der Plan verteilt das Soll nach starken Tagen, Hauptzeiten und
   Öffnen/Schließen. Reicht das Soll nicht für Öffnen/Schließen oder
   umgekehrt, erscheinen Warnungen im Dashboard.
3. Dienste von Hand anpassen (Zelle antippen), dann im Tab „Chấm công" drucken
   bzw. sperren.
4. Stundenzettel-PDF wie Thienlong: Gesamtstunden, Nachtstunden und
   Sonntagsstunden als leere Felder zum Ausfüllen von Hand.
5. **Ist-Stunden**: im Dienst „Giờ thực tế đã chấm công" eintragen. Geplante
   Stunden gelten nie als gearbeitet. „Tổng kết tháng" zeigt Arbeitstage,
   geplante und tatsächlich erfasste Stunden.

## Offen (vom Betrieb zu bestätigen)

- Öffnungstage je Woche (Sonntag?).
- Stundenlohn der Minijobberin. Achtung: Die Minijob-Grenze 2026 liegt bei
  **603 €/Monat**; 630 € wären ein Midijob (Übergangsbereich).
- Genauer letzter Arbeitstag von Nguyễn Quỳnh Như.

## Entwicklung

```bash
npm install
npm run dev
npm test
```

Supabase: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in `.env.local`. Ohne
Zugangsdaten läuft die App nur lokal (LocalStorage).
