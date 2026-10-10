// Lịch âm Việt Nam (múi giờ +7), trích từ prototype mobile InnerLamp
(function () {
const PI = Math.PI;
function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  return jd;
}
function newMoonJd(k) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return jd1 + C1 - deltat;
}
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  return L - PI * 2 * Math.floor(L / (PI * 2));
}

const TIETKHI = ['Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'];
const NAPAM = [['Hải Trung Kim', 'vàng trong biển'], ['Lư Trung Hỏa', 'lửa trong lò'], ['Đại Lâm Mộc', 'gỗ rừng lớn'], ['Lộ Bàng Thổ', 'đất ven đường'], ['Kiếm Phong Kim', 'vàng mũi kiếm'], ['Sơn Đầu Hỏa', 'lửa đỉnh núi'], ['Giản Hạ Thủy', 'nước khe suối'], ['Thành Đầu Thổ', 'đất trên thành'], ['Bạch Lạp Kim', 'vàng chân đèn'], ['Dương Liễu Mộc', 'gỗ cây dương liễu'], ['Tuyền Trung Thủy', 'nước trong suối'], ['Ốc Thượng Thổ', 'đất mái nhà'], ['Tích Lịch Hỏa', 'lửa sấm sét'], ['Tùng Bách Mộc', 'gỗ tùng bách'], ['Trường Lưu Thủy', 'nước chảy dài'], ['Sa Trung Kim', 'vàng trong cát'], ['Sơn Hạ Hỏa', 'lửa chân núi'], ['Bình Địa Mộc', 'gỗ đồng bằng'], ['Bích Thượng Thổ', 'đất trên vách'], ['Kim Bạch Kim', 'vàng pha bạc'], ['Phúc Đăng Hỏa', 'lửa ngọn đèn'], ['Thiên Hà Thủy', 'nước trên trời'], ['Đại Trạch Thổ', 'đất nền nhà lớn'], ['Thoa Xuyến Kim', 'vàng trang sức'], ['Tang Đố Mộc', 'gỗ cây dâu'], ['Đại Khê Thủy', 'nước khe lớn'], ['Sa Trung Thổ', 'đất pha cát'], ['Thiên Thượng Hỏa', 'lửa trên trời'], ['Thạch Lựu Mộc', 'gỗ cây lựu'], ['Đại Hải Thủy', 'nước biển lớn']];
const TRUC = [
  ['Kiến', 0, ['Xuất hành', 'Nhậm chức', 'Gặp gỡ, thăm hỏi'], ['Động thổ', 'Đào giếng', 'An táng']],
  ['Trừ', 1, ['Dọn dẹp, trừ bỏ việc cũ', 'Chữa bệnh', 'Cúng giải, sám hối'], ['Cưới hỏi', 'Xuất hành xa']],
  ['Mãn', 1, ['Cúng lễ, cầu phúc', 'Khai trương', 'Nhập kho'], ['Kiện tụng', 'Nhậm chức']],
  ['Bình', 0, ['Sửa sang nhà cửa', 'Làm đường', 'Việc thường ngày'], ['Khai trương lớn', 'Đào ao']],
  ['Định', 1, ['Cưới hỏi', 'Ký kết', 'Nhập học', 'An vị tượng Phật'], ['Kiện tụng', 'Xuất hành xa']],
  ['Chấp', 0, ['Xây dựng', 'Trồng cây', 'Tuyển người'], ['Xuất tiền lớn', 'Dời nhà']],
  ['Phá', -1, ['Phá dỡ nhà cũ', 'Chữa bệnh'], ['Cưới hỏi', 'Khai trương', 'Ký kết']],
  ['Nguy', -1, ['Cúng lễ', 'Tĩnh tu'], ['Leo cao', 'Đi thuyền', 'Việc mạo hiểm']],
  ['Thành', 1, ['Khai trương', 'Cưới hỏi', 'Nhập trạch', 'Khởi công'], ['Kiện tụng']],
  ['Thu', -1, ['Thu hoạch', 'Thu nợ', 'Nhập kho'], ['An táng', 'Khởi công', 'Xuất hành']],
  ['Khai', 1, ['Khai trương', 'Xuất hành', 'Cầu tài', 'Nhập học'], ['An táng', 'Động thổ']],
  ['Bế', -1, ['Đắp đê, lấp hố', 'Tĩnh tu'], ['Khai trương', 'Xuất hành', 'Chữa mắt']],
];
const HANH = { 'Kim': '#B8862F', 'Mộc': '#5E8A6C', 'Thủy': '#4F7896', 'Hỏa': '#C0573F', 'Thổ': '#8A6A45' };
const CAN_H = ['Mộc', 'Mộc', 'Hỏa', 'Hỏa', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Thủy', 'Thủy'];
const CHI_H = ['Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];
function tietIdx(jd) { return Math.floor(sunLongitude(jd + 0.5 - 7 / 24) / PI * 12) % 24; }
function dayAlmanac(dd, mm, yy) {
  const jd = jdFromDate(dd, mm, yy), dc = (jd + 9) % 10, dz = (jd + 1) % 12;
  const L = solar2lunar(dd, mm, yy, 7);
  const ti = tietIdx(jd);
  let start = 0; while (start < 20 && tietIdx(jd - start - 1) === ti) start++;
  let nxt = 1; while (nxt < 20 && tietIdx(jd + nxt) === ti) nxt++;
  const sd = new Date(yy, mm - 1, dd - start);
  const mz = (2 + Math.floor(((ti + 3) % 24) / 2)) % 12;
  const tr = TRUC[(dz - mz + 12) % 12];
  const hd = '110011010010'[(dz - ((L.m - 1) % 6) * 2 + 12) % 12] === '1';
  const score = (hd ? 1 : -1) + tr[1];
  const R = score >= 2 ? ['Đại cát', '#3F7A55'] : score === 1 ? ['Cát', '#5E8A6C'] : score === 0 ? ['Bình', '#8A6A45'] : score === -1 ? ['Hung', '#B8662F'] : ['Đại hung', '#C64545'];
  const s60 = ((dc * 6 - dz * 5) % 60 + 60) % 60, na = NAPAM[Math.floor(s60 / 2)], naH = na[0].split(' ').pop();
  return { rating: R[0], rColor: R[1], score, truc: tr[0], hd, good: tr[2], bad: tr[3],
    tiet: TIETKHI[ti], tietFrom: String(sd.getDate()).padStart(2, '0') + '/' + String(sd.getMonth() + 1).padStart(2, '0'), tietNext: TIETKHI[(ti + 1) % 24], tietIn: nxt,
    napam: na[0], napamGloss: na[1], napamH: naH, can: LCAN[dc], chi: LCHI[dz], canH: CAN_H[dc], chiH: CHI_H[dz] };
}
function sunLong12(dayNumber, tz) { return Math.floor(sunLongitude(dayNumber - 0.5 - tz / 24) / PI * 6); }
function newMoonDay(k, tz) { return Math.floor(newMoonJd(k) + 0.5 + tz / 24); }
function lunarMonth11(yy, tz) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = newMoonDay(k, tz);
  if (sunLong12(nm, tz) >= 9) nm = newMoonDay(k - 1, tz);
  return nm;
}
function leapMonthOffset(a11, tz) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0, i = 1, arc = sunLong12(newMoonDay(k + i, tz), tz);
  do { last = arc; i++; arc = sunLong12(newMoonDay(k + i, tz), tz); } while (arc !== last && i < 14);
  return i - 1;
}
function solar2lunar(dd, mm, yy, tz) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1, tz);
  if (monthStart > dayNumber) monthStart = newMoonDay(k, tz);
  let a11 = lunarMonth11(yy, tz), b11 = a11, lunarYear;
  if (a11 >= monthStart) { lunarYear = yy; a11 = lunarMonth11(yy - 1, tz); }
  else { lunarYear = yy + 1; b11 = lunarMonth11(yy + 1, tz); }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = 0, lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const lmo = leapMonthOffset(a11, tz);
    if (diff >= lmo) { lunarMonth = diff + 10; if (diff === lmo) leap = 1; }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { d: lunarDay, m: lunarMonth, y: lunarYear, leap };
}
window.ilSolar2Lunar = solar2lunar;
const LCAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const LCHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const LMONTH = ['Một', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'];
const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WDFULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const VERSES = [
  { lines: ['Tâm dẫn đầu các pháp,', 'Tâm làm chủ, tâm tạo.', 'Nếu tâm được thanh tịnh,', 'Nói làm đều an vui.'], src: 'Kinh Pháp Cú — phẩm Song Yếu' },
  { lines: ['Không làm các điều ác,', 'Siêng làm những việc lành,', 'Giữ tâm ý trong sạch,', 'Ấy lời chư Phật dạy.'], src: 'Kinh Pháp Cú' },
  { lines: ['Hơi thở vào, biết vào,', 'Hơi thở ra, biết ra.', 'Thân và tâm một nhịp,', 'Giây phút này an nhiên.'], src: 'Kinh Quán Niệm Hơi Thở' },
  { lines: ['Như sen mọc giữa nước,', 'Chẳng nhiễm chút bùn nhơ.', 'Người trí sống giữa đời,', 'Tâm vẫn thường thanh tịnh.'], src: 'Kinh Tương Ưng Bộ' },
];
const LEVENTS = {
  '1/1': 'Vía Đức Di Lặc — Tết Nguyên Đán', '15/1': 'Rằm tháng Giêng — Tết Nguyên Tiêu',
  '8/2': 'Đức Phật Thích Ca xuất gia', '15/2': 'Đức Phật Thích Ca nhập Niết bàn',
  '19/2': 'Vía Quán Thế Âm đản sinh', '21/2': 'Vía Phổ Hiền Bồ Tát',
  '4/4': 'Vía Văn Thù Bồ Tát', '15/4': 'Đại lễ Phật Đản', '16/4': 'Khai kỳ An cư kiết hạ',
  '19/6': 'Vía Quán Thế Âm thành đạo', '13/7': 'Vía Đại Thế Chí Bồ Tát',
  '15/7': 'Đại lễ Vu Lan Báo Hiếu', '30/7': 'Vía Địa Tạng Bồ Tát',
  '22/8': 'Vía Nhiên Đăng Cổ Phật', '19/9': 'Vía Quán Thế Âm xuất gia',
  '30/9': 'Vía Phật Dược Sư', '5/10': 'Vía Đạt Ma Tổ Sư',
  '17/11': 'Vía Phật A Di Đà', '8/12': 'Đức Phật Thích Ca thành đạo',
};
function gJdToDate(jd) {
  let b, c;
  if (jd > 2299160) { const a = jd + 32044; b = Math.floor((4 * a + 3) / 146097); c = a - Math.floor(b * 146097 / 4); } else { b = 0; c = jd + 32082; }
  const d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * d / 4), m = Math.floor((5 * e + 2) / 153);
  return [e - Math.floor((153 * m + 2) / 5) + 1, m + 3 - 12 * Math.floor(m / 10), b * 100 + d - 4800 + Math.floor(m / 10)];
}
function lunar2solar(ld, lm, ly, leap, tz) {
  let a11, b11;
  if (lm < 11) { a11 = lunarMonth11(ly - 1, tz); b11 = lunarMonth11(ly, tz); } else { a11 = lunarMonth11(ly, tz); b11 = lunarMonth11(ly + 1, tz); }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lm - 11; if (off < 0) off += 12;
  if (b11 - a11 > 365) { const lo = leapMonthOffset(a11, tz); let lmm = lo - 2; if (lmm < 0) lmm += 12; if (leap && lm !== lmm) return null; if (leap || off >= lo) off += 1; }
  return gJdToDate(newMoonDay(k + off, tz) + ld - 1);
}
function gioL2S(ld, lm, ly) {
  for (let d = ld; d >= 29 || d === ld; d--) {
    const r = lunar2solar(d, lm, ly, 0, 7); if (!r) return null;
    const L = solar2lunar(r[0], r[1], r[2], 7);
    if (L.d === d && L.m === lm) return new Date(r[2], r[1] - 1, r[0]);
  }
  return null;
}
window.IL = { PI, gioL2S, jdFromDate, solar2lunar, lunar2solar, dayAlmanac, LCAN, LCHI, LMONTH, WDFULL, VERSES, HANH, TIETKHI, NAPAM };
})();
