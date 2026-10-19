# InnerLamp — Feature Specification

Source: `InnerLamp Web App.dc.html` (web design, October 2026).
Purpose: (1) define the API the UI needs, (2) brief a mobile team to build the same product.

All user-facing copy is Vietnamese. Dates support both solar (dương lịch) and lunar (âm lịch) calendars throughout. The app is free for everyone; there are no paid tiers and no ads.

---

## 0. Conventions

- **Guest vs. signed-in.** Calendar, sutras, bell/wooden fish, meditation, mala counter, library, temples and articles work without an account. Anything that saves personal data (journal, streak, memorial book, family tree, sangha, offerings history, lamps, profile) requires sign-in. Guests who try a gated action are sent to Login.
- **Lunar date helpers** are needed everywhere (client-side library or API): solar↔lunar conversion, Can Chi year name, solar terms (tiết khí), auspicious hours (giờ hoàng đạo), fasting days (1, 8, 14, 15, 18, 23, 30 lunar).
- **Address data** follows Vietnam's administrative divisions after the 2025 merger (Province → Ward/Commune/Special zone). The design loads it from `https://provinces.open-api.vn/api/v2/p/` (`?depth=2` for wards). The backend can proxy or cache this.
- **Global states** every screen must handle: loading, empty, 404 (page not found), offline, data-load error with retry.
- **Persistence today (prototype only)** uses localStorage: `il-web-auth`, `il-web-prof`, `il-web-set`, `il-web-nread`, `il-web-gp`, `il-web-evsel`, `il-dark`, etc. Each of these becomes a server resource below.

Suggested REST style: `/v1/...`, JSON, bearer token auth, cursor pagination (`?cursor=&limit=`).

---

## 1. Authentication & Account

### 1.1 Login
- Phone number (with country code picker, default +84) + password.
- "Gửi mã một lần qua SMS" — passwordless login via OTP.
- "Quên mật khẩu?" link.
- "Vào xem trước, chưa đăng nhập" — continue as guest.

### 1.2 Sign up
Fields:
- **Full name** (Họ và tên): required, min 2 characters.
- **Dharma name / display name** (Pháp danh hoặc tên gọi): has a "Gợi ý" (suggest) button that proposes names.
- **Home temple** (Nơi xuất gia): optional. Searchable dropdown of known temples. If the temple is missing, the user can **propose a new temple** (see 1.5).
- Phone or email, password (show/hide), terms agreement checkbox (required).
- On submit → OTP verification.

### 1.3 OTP
- 6-digit code, auto-focus, resend with countdown, error state for wrong or expired code.

### 1.4 Forgot / reset password
- Enter phone → OTP → set new password (with confirmation).

### 1.5 Propose a new temple ("Thêm chùa")
- Fields: temple name (required), Province/City (searchable dropdown), Ward/Commune/Special zone (cascading, loads after province), street address (**optional**; if empty, the address starts from ward level).
- Dropdowns are custom (not native) and close on outside click.
- Warning shown as bullets:
  - The temple must be reviewed by InnerLamp before it is public.
  - It will not appear on the user's profile until approved.
  - The user can update it later in profile settings.
- Status: `pending` → `approved` / `rejected`.

### 1.6 Logout
- Confirmation dialog stating that journal, memorial book and family tree remain saved in the account.

**API**
```
POST /auth/login                {phone, password}
POST /auth/otp/request          {phone, purpose: login|signup|reset}
POST /auth/otp/verify           {phone, code, purpose} -> {token}
POST /auth/signup               {fullName, dharmaName?, phone|email, password, templeId?, proposedTempleId?}
POST /auth/password/reset       {phone, code, newPassword}
POST /auth/logout
GET  /dharma-names/suggest      -> [string]
POST /temples/proposals         {name, provinceCode, wardCode, street?} -> {id, status:"pending"}
GET  /geo/provinces             GET /geo/provinces/{code}/wards
```

---

## 2. Home (Trang chủ)

- Header: today's solar date + lunar date, greeting with dharma name ("Chào buổi sáng, Diệu Tâm"). Guests see a welcome and "Tạo tài khoản / Đăng nhập" buttons.
- Quick actions: Lunar calendar, Sutras, Bell & wooden fish, Meditation.
- **Today's practice plan** (Thời khóa hôm nay): e.g. morning chanting, 108 recitations, evening sutra. Each item can be checked off. When all items are done, show a completion state and a "Viên mãn" celebration modal with streak days, minutes today, dedication verse, and a "Thắp đèn hồi hướng" button (opens Lamp).
- **Streak** (Chuỗi ngày tinh tấn).
- Mini lunar calendar with auspicious hours and a link to day detail.
- **Upcoming Buddhist events**: show at most **5**. If there are more, show "+n sự kiện ›", which links to the Events page.
- "Xem giới thiệu InnerLamp" (intro / storytelling page).

**API**
```
GET  /home                       -> {greeting, today:{solar,lunar}, practicePlan[], streak, events[] (max 5), eventsMore:int}
POST /practice/today/{itemId}/done
```

---

## 3. Practice (Thực hành)

### 3.1 Meditation (Thiền định)
- Choose a guided session (e.g. "Thiền hơi thở buổi sáng", teacher, voice, with/without music).
- Duration picker (minutes). The app remembers the usual duration.
- Start bell: Khánh / Chuông gia trì / no bell. Rings 1 strike at start, 3 at end.
- **Background ambience**: Silence, Light rain, Stream, Pine forest, Ocean waves, Gentle wind, Night insects, Wind chimes. Volume slider 0–100% (default 50%). Fades in/out; stops when leaving the screen and resumes on return. The web version synthesizes these sounds; mobile should use real looping audio files.
- Interval bell (chuông nhắc giữa buổi).
- 10-second settle countdown, then a timer. Fullscreen mode; tap to reveal controls.
- End screen: minutes sat, dedication verse, "Ngồi lại" (repeat), "Ghi vào nhật ký" (save to journal).
- Live counter "N người đang ngồi thiền trên InnerLamp" + "Ngồi cùng".

### 3.2 Mala / Buddha recitation (Niệm Phật)
- Bead ring: tap, scroll, drag one bead, or press space to count.
- Target (e.g. 108), round counter, mantra text (e.g. "Nam mô A Di Đà Phật").
- Completion: "Tròn N biến", rounds done, dedication, "Niệm tiếp vòng mới".
- Reset; fullscreen.

### 3.3 Bell & wooden fish (Chuông mõ)
- Tap or press space to strike. Choose wooden fish sound and bell sound.
- Tempo (BPM) with − / +.
- Auto-ring the bell after every N strikes.

### 3.4 Mindfulness bell (Chuông tỉnh thức)
- Enable/disable. Test bell.
- Morning bell with time.
- Interval bell: from/to hours, every N minutes, selected weekdays.
- Bell sound + preview.
- Silence while the phone calendar is busy.
- Full-moon and new-moon evening bell at 19:30.
- Bell popup: "Lắng lòng nghe…", "Tôi đã trở về" / "Để sau". Count of pauses today.

**API**
```
GET  /meditations                        -> sessions (teacher, voice, audioUrl, music)
GET  /ambient-sounds                     -> [{id, name, audioUrl}]
POST /journal/meditation                 {sessionId, minutes, bell, ambientId, startedAt}
GET  /meditation/live-count
POST /journal/recitation                 {mantra, count, rounds}
GET/PUT /settings/mindfulness-bell       {enabled, morningTime, interval:{from,to,everyMin,days[]}, sound, silentWhenBusy, lunarEvening}
POST /journal/mindful-pause
```
Mobile: bells and reminders should be local scheduled notifications. Background audio is needed for meditation.

---

## 4. Lunar Calendar (Lịch âm)

- Month grid (Mon–Sun) with solar and lunar dates, Can Chi year, and fasting days highlighted.
- Today marker, month navigation.
- Selected day: auspicious hours, link to day detail.

### 4.1 Day detail (Chi tiết ngày âm)
- Lunar date, solar term, day rating.
- Auspicious hours.
- Do / don't lists, with a note that any day is good for chanting and good deeds.
- Travel direction, five elements and nạp âm, conflicting ages.

**API**
```
GET /calendar/month?y=&m=   -> days[{solar, lunar, canChi, fasting, events[]}]
GET /calendar/day/{date}    -> {lunar, solarTerm, rating, goodHours[], do[], dont[], direction, element, conflictAges[]}
```
(Can be fully client-side with a lunar library; `lunar.js` exists in the project.)

---

## 5. Buddhist Events (Sự kiện Phật giáo)

- Year selector, filter chips, list of upcoming events (date, lunar date, countdown "còn N ngày").
- **Event detail**: meaning, things to do that day, related figures, suggested sutras, previous/next event, "Thắp đèn", "Xem ngày âm".
- Users can select which events to follow (persisted).

**API**
```
GET /events?year=&type=
GET /events/{id}
PUT /me/followed-events   {ids[]}
```

---

## 6. Library (Thư viện)

### 6.1 Sutras (Kinh sách)
- List with filters. Detail is a reader: table of contents, chapters, font size A−/A+, dark mode, prev/next chapter, audio playback position, related sutras.

### 6.2 Dharma talks (Pháp thoại)
- List with filters, featured talk (e.g. seasonal "Mùa Vu Lan").
- Player: play/pause, −15s/+15s, playback speed, chapters, transcript ("Nội dung"), view count, related talks.

### 6.3 Buddhas & Bodhisattvas (Chư Phật & Bồ Tát)
- List by category, anniversary (vía) lunar date, monthly view.
- Detail: biography, great vows, mantras and names, "Trì niệm với tràng hạt" (opens Mala with that mantra), share, related sutras, report incorrect info.

### 6.4 Articles (Bài viết Phật pháp)
- Featured + list with filters, read time, save/bookmark, share, quote highlight. Detail page.

### 6.5 Buddhist gallery (Ảnh đẹp Phật giáo)
- Grid and lightbox (prev/next/close).

**API**
```
GET /library/search?q=
GET /sutras?cat=        GET /sutras/{id}         GET /sutras/{id}/chapters/{n}
GET /talks?cat=         GET /talks/{id}           POST /talks/{id}/progress {pos}
GET /buddhas?cat=       GET /buddhas/{id}
GET /articles?cat=      GET /articles/{id}        PUT /me/saved-articles/{id}
GET /gallery
POST /reports           {targetType, targetId, message}
```

---

## 7. Temples (Chùa Việt Nam)

- Search by name, folk name or province. Filter by region and tradition. Cards with photo.
- **Temple detail**:
  - Header: name, tradition, heritage badge, address; "Chỉ đường" (Google Maps / Apple Maps), "Cúng dường".
  - **Set as my sangha** card: "Đặt làm đạo tràng của tôi". When this is the user's temple: "✓ Đây là đạo tràng của bạn" + "Vào trang đạo tràng ›". If the user already has a different temple, warn that this will replace it.
  - Opening hours (weekdays / full moon & new moon), introduction, photo gallery, organization & lineage, architecture & heritage (style, materials, highlights), visiting etiquette, amenities, events & classes, location map, contact, last updated.
  - Follow temple.
  - "Báo thông tin sai": modal with a text field and a thank-you state.

**API**
```
GET  /temples?q=&region=&sect=&near=lat,lng
GET  /temples/{id}
POST /temples/{id}/follow    DELETE /temples/{id}/follow
POST /temples/{id}/reports   {message}
```

---

## 8. My Sangha (Đạo tràng)

The user's home temple community. The source of truth is `profile.templeId`. Changes made from **Temple detail**, **Edit profile**, or **Sangha settings** must all update this page immediately.

### 8.1 No sangha state
- Explanation, "Tìm chùa gần bạn", "Cập nhật trong hồ sơ".
- Suggested temples with "Xem chùa" / "Chọn làm đạo tràng".
- Live meditation count and "Ngồi cùng".
- What you get once you join.

### 8.2 Sangha home
- Hero: temple name, tradition · location · member count. Buttons: "Trang chùa", "Viết chia sẻ", "Cài đặt".
- **Notices from the temple** (Thông báo từ chùa): tag (schedule change / event reminder / call for help), time, title, body, unread dot. If linked to an event, "Xem sự kiện ›" opens the event detail.
- **Practice schedule** (Thời khóa tu tập): list of sessions. Tap opens **schedule detail** modal: time range, place, leader, description, step-by-step order, what to prepare, "Tu tập tại nhà" (go to meditation), "Nhắc tôi trước 15 phút" toggle.
- **Temple events** (Sự kiện của chùa): date, name, meta, register toggle, "Xem chi tiết ›".
- **Member posts** (Chia sẻ của đạo hữu): composer prompt card, posts with likes ("tùy hỷ") and replies.

### 8.3 Temple event detail (Chi tiết sự kiện chùa)
- Hero image, type (Retreat / Full moon ceremony / Anniversary / Volunteer), name, date, time.
- Facts: date (with lunar), time, place, leader.
- Introduction, program timeline, what to prepare.
- **Registration**: seats left (or unlimited), registered count, progress bar, "Ghi danh tham dự" / "Hủy ghi danh". Confirmation: reminder one day before.
- "Cúng dường cho sự kiện" (opens Offerings with this temple/event).
- Other events at this temple, back to sangha.

### 8.4 Write a post (Viết chia sẻ)
- Modal: author, target sangha and member count.
- Textarea, 1000 characters max, minimum 10, character counter.
- Topic chips: Practice, Dharma question, Retreat/event, Dedication, Reflection.
- Community guidelines (bullets). Edit/delete after posting.
- After posting: the post appears at the top of the list with a success message.

### 8.5 Sangha settings (Cài đặt đạo tràng)
- **Change sangha**: search temples, radio list (current one marked "Đang sinh hoạt"), "Chuyển đạo tràng". Event registrations at the old temple are kept.
- **Receive notifications from the temple** toggle (event reminders and board news).
- **Leave sangha**: confirmation with consequences (no schedule/notices, profile shows "Chưa sinh hoạt đạo tràng", posts remain, can rejoin anytime).

### Events vs. notices
- **Event** = something with a date/time the user can attend and register for. Has its own detail page.
- **Notice** = a message pushed by the temple (schedule change, closure, call for volunteers or donations, reminder). No registration. May link to an event.

**API**
```
GET    /me/sangha                          -> {temple, memberCount} | null
PUT    /me/sangha                          {templeId}          (join / change)
DELETE /me/sangha                          (leave)
PUT    /me/sangha/notifications            {enabled}
GET    /temples/{id}/notices               POST /temples/{id}/notices/{nid}/read
GET    /temples/{id}/schedule              GET /temples/{id}/schedule/{sid}
PUT    /me/schedule-reminders/{sid}        {enabled, leadMin:15}
GET    /temples/{id}/events                GET /temple-events/{eid}
POST   /temple-events/{eid}/registration   DELETE /temple-events/{eid}/registration
GET    /temples/{id}/posts?cursor=
POST   /temples/{id}/posts                 {body (10–1000), topic}
PATCH  /posts/{pid}   DELETE /posts/{pid}
POST   /posts/{pid}/like   DELETE /posts/{pid}/like
GET    /posts/{pid}/replies   POST /posts/{pid}/replies {body}
```
Moderation: posts with offensive or advertising content can be hidden by moderators.

### 8.6 Virtual zendo (Thiền đường trực tuyến)
Real-time shared sitting room. No text chat, no video.
- **Entry**: live card on Sangha home — "312 vị đồng tu đang cùng ngồi thiền", session name and time, "Vào thiền đường". Opens a full-screen dark room that hides all app navigation.
- **Sea of lamps**: every participant is a small oil lamp on a pond, glowing with an 8-second breathing pulse (wave from center outward). A shared central lamp sits in the middle. The user's own lamp is labelled "BẠN".
- **Presence list** (corner, collapsible): avatar + dharma name + province/city. Hover a lamp shows name · city.
- **Silent support (Tùy hỷ)**: tap a lamp or list row → 🙏 rises, the recipient's lamp flashes once, toast "Đã gửi tùy hỷ đến …". The user receives the same when others send to them.
- **Synced rhythm**: session clock is server time, so everyone sees the same remaining time and hears the bell at the same moment. 3 strikes at start, 1 at mid-session, 3 at end. Progress bar marks bell points; "Thỉnh chuông sau mm:ss". Host label ("Chủ trì") or system schedule. Bell sound on/off.
- **Dedication (Hồi hướng)**: at the end — "Thời khóa đã tròn đầy — Cùng hồi hướng công đức với 312 bạn đồng tu", dedication verse, "Hồi hướng" button. Each press anywhere brightens the central lamp; counter "N đạo hữu đã hồi hướng". Then "Rời thiền đường" or "Ngồi thêm một thời khóa".

**API / realtime**
```
GET  /temples/{id}/zendo                  -> {sessionId, title, host, startAt, durationSec, bells:[sec], presentCount}
WS   /zendo/{sessionId}
  client → join {userId} | leave | support {toUserId} | dedicate
  server → presence {added[], removed[], count} (userId, dharmaName, city, lampSlot)
           support {fromUserId, toUserId} | bell {strikes, atServerTime} | end | dedicate {count}
GET  /time                                -> server clock for drift correction
```
Bell events carry a server timestamp; clients schedule playback against corrected server time so strikes land together. Support is rate-limited (1 per target per 10 s). City is opt-out in privacy settings.

---

## 9. Lamp Offering (Thắp đèn)

- Lamp type, intention (peace / dedication / gratitude), for whom, name, wish text, duration in days.
- Lit lamp animation, dedication verse, "Thắp thêm đèn", share.
- "Thỉnh đèn tại chùa": the temple lights a real lamp at the main hall with the user's wish and sends a photo confirmation.
- Lamp garden: public lamps, at-temple lamps, "my lamps".

**API**
```
POST /lamps            {type, intent, forName, wish, days, atTempleId?}
GET  /lamps?scope=public|temple|mine
GET  /lamps/{id}       (photo confirmation for at-temple lamps)
```

---

## 10. Offerings to temples (Cúng dường)

Money goes **directly to the temple's official account**. InnerLamp does not hold funds and charges no fees.

- Step 1: choose temple. Step 2: purpose (e.g. meals for monks, restoration, general). Step 3: amount (suggestions only, no minimum). Step 4: name written in the register, anonymous toggle, dedication text.
- "Hộ trì Tam Bảo hằng tháng": monthly reminder on the 1st lunar day (a reminder, not auto-debit).
- Payment: bank-transfer QR (VietQR) to the temple's account.

### 10.1 Merit book (Sổ công đức)
- Totals, history list, thank-you letters from temples (temple, lunar date, message, signed by the abbot), monthly support status (stop), public campaigns with progress (e.g. "Đã nhận 186 / 400 triệu đ").

**API**
```
GET  /temples/{id}/offering-purposes
POST /offerings              {templeId, purpose, amount, displayName, anonymous, dedication, eventId?} -> {id, qrPayload, bankInfo, expiresAt}
GET  /offerings/{id}/status  (pending | paid | expired)
GET  /me/offerings   GET /me/thank-letters   GET /temples/{id}/campaigns
PUT  /me/offering-reminder   {monthly: bool}
```
Payment confirmation needs a bank webhook or reconciliation job, or temple-side manual confirmation.

---

## 11. Support InnerLamp (Ủng hộ)

- Free forever. Optional one-time donation: amount, method, optional message, anonymous toggle. One-time only, no recurring charges.
- Shows a **QR code** to scan and pay, "Đang chờ thanh toán", expiry countdown, "Tôi đã thanh toán", "Sửa số tiền".

**API**
```
POST /donations   {amount, method, message?, anonymous} -> {id, qrPayload, expiresAt}
GET  /donations/{id}/status
```

---

## 12. Family: Memorial book & Family tree

### 12.1 Memorial book (Sổ giỗ)
- List sorted by next memorial date: name, relationship, death date (lunar or solar), next solar date this year, reminder.
- Add/edit: portrait, full name (required), relationship, notes, calendar type (lunar/solar), day/month/year, reminder (days before, time), add to device calendar (lunar date is converted to solar every year).
- "Lấy từ gia phả": pick a deceased member from the family tree.
- Empty state.

### 12.2 Family tree (Gia phả)
- Empty state: create new, join with invite code, view sample tree.
- Create: clan name, homeland, founder (generation 1: name, birth year, alive/deceased, death year, lunar memorial date), founder's spouse (optional). Validation errors.
- Tree view: add members generation by generation, member detail, invite relatives.

**API**
```
GET/POST /me/memorials       PATCH/DELETE /me/memorials/{id}
GET  /me/memorials/upcoming
POST /family-trees           {clanName, homeland, founder{...}, spouse?}
GET  /family-trees/{id}      POST /family-trees/{id}/members
POST /family-trees/join      {inviteCode}
POST /family-trees/{id}/invites -> {code}
```
A memorial reminder is also a notification type.

---

## 13. Me (Tôi) & Profile

- Header: cover photo, avatar, full name, dharma name, status, home temple. "Sửa hồ sơ", "Đăng xuất".
- Practice journal heatmap (12 weeks), days logged.
- Practice badges (e.g. "Xem cả 18 dấu ấn").
- Dedicated merit summary (offerings count, lamps), links to Merit book and Support InnerLamp.
- Links: memorial book, family tree, notifications, settings, help.

### 13.1 Edit profile
- Drag/drop cover and avatar.
- Personal: full name, dharma name, birth year, phone, email, status (lay Buddhist, etc.), bio.
- Sangha & refuge: home temple (dropdown; includes "Chưa sinh hoạt đạo tràng"), refuge date, teacher, group.
- Save/cancel. **Saving the temple updates the Sangha page immediately.**

**API**
```
GET   /me                -> profile + stats
PATCH /me                {fullName, dharmaName, birthYear, phone, email, status, bio, templeId|null, refugeDate, master, group}
POST  /me/avatar   POST /me/cover   (multipart)
GET   /me/journal?weeks=12   GET /me/badges
```

---

## 14. Notifications (Thông báo)

- Grouped (Today / Earlier). Types: memorial, temple, community (likes, replies), calendar (fasting days).
- Tapping opens the target screen. Unread state, "Đánh dấu tất cả đã đọc". Unread badge in the header.

**API**
```
GET  /me/notifications?cursor=   -> [{id, type, title, body, time, target:{screen, id}}]
POST /me/notifications/{id}/read   POST /me/notifications/read-all
GET  /me/notifications/unread-count
```
Mobile: push notifications (FCM/APNs) with the same `target` deep-link.

---

## 15. Settings (Cài đặt)

Default values from the design:
```
theme: light|dark|system, mindfulness bell on, bellTime 05:30, fasting-day reminder on,
memorial reminders on, sangha notifications on, font size, calendar first day,
sound, vibration on, public profile on, show streak on
```
**API:** `GET/PUT /me/settings`

---

## 16. Help, Contact, Legal

- **Help center**: searchable FAQ, empty search state, "Liên hệ hỗ trợ".
- **Contact**: name, email or phone, topic, message. Success state. FAQ link.
- **Terms & Privacy**: last updated, table of contents, sections.

**API**
```
GET  /help/faqs?q=
POST /contact   {name, contact, topic, message}
GET  /legal/{terms|privacy}
```

---

## 17. Global UI

- Top navigation: Home, Library, Practice, Sangha, Calendar. Breadcrumbs on detail pages. Notification bell with unread count. Avatar menu.
- Footer: Practice, Content, Community, Support groups, copyright, legal links.
- Dark mode toggle.
- Error pages: 404, offline, data-load error.

---

## 18. Mobile notes

- Same information architecture. Bottom tabs: Home, Library, Practice, Sangha, Me.
- Use the device for meditation background audio, haptics on the mala and wooden fish, local notifications for bells, memorials, schedule reminders and lunar days, and calendar export for memorial dates.
- Use native maps deep links (Google/Apple) and the device QR/banking app intent for payments.
- Cache lunar calendar, sutras and the user's sangha schedule for offline use.
