/* ДомСтрой — расчёты и разделы страницы.
   Формулы и наборы вопросов повторяют Telegram-бота: один и тот же сценарий. */
(function () {
'use strict';

// ── настройки компании (в боте они живут в базе и правятся админом) ──
var S = {
  price_base: 54000, price_fine: 64000, price_turnkey: 92000, build_months: '5–7',
  rate_family: 6, rate_it: 6, rate_milfam: 6, rate_mil: 18,
  limit_kids_1: 6000000, limit_kids_2: 8000000, limit_kids_3: 10000000,
  down_min: 20.1, rate_after_15: 10, subsidy_years: 15,
  waste_tile: 10, waste_tile_diagonal: 15, waste_bath: 15,
  waste_laminate: 5, waste_laminate_diagonal: 15,
  paint_coverage: 8, primer_l_m2: 0.2, gypsum_kg_mm: 0.9, bag_gypsum: 30,
  glue_bag: 25, hydro_kg_m2: 1.5, crosses_per_tile: 4,
  gkl_sheet_m2: 3, gkl_profile_m_m2: 3, gkl_hangers_m2: 3, gkl_screws_m2: 25,
  block_volume: 0.0469, block_glue_kg_m3: 27, brick_per_m2: 51, power_factor: 0.7
};
var PHONE = '+7 961 817-77-17', PHONE_DIGITS = '79618177717';
var BOT = 'https://t.me/domstroy161_bot?start=site';

// ── числа ────────────────────────────────────────────────────────────
function ru(n) { return Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' '); }
function dec(n, d) {
  d = d === undefined ? 1 : d;
  var v = Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
  return String(v).replace('.', ',');
}
function money(n) { return ru(n) + ' ₽'; }
function up(n) { return Math.ceil(n - 1e-9); }
function annuity(p, rate, years) {
  var r = rate / 100 / 12, n = years * 12;
  if (n <= 0) return 0;
  if (r === 0) return p / n;
  var k = Math.pow(1 + r, n);
  return p * r * k / (k - 1);
}
function balance(p, rate, years, months) {
  var r = rate / 100 / 12, n = years * 12;
  if (r === 0) return Math.max(0, p * (1 - months / n));
  var k = Math.pow(1 + r, n), m = Math.pow(1 + r, months);
  return p * (k - m) / (k - 1);
}
function $(sel, root) { return (root || document).querySelector(sel); }
function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

// ── справочники ──────────────────────────────────────────────────────
var TIERS = [
  { k: 'base', n: 'Стройвариант', p: S.price_base, spec: [
    'Ленточный фундамент 400 × 1000 мм', 'Армированная плита перекрытия',
    'Газоблок с облицовочным кирпичом, стена 400 мм', 'Четырёхскатная крыша, металлочерепица',
    'Окна Rehau, входная металлическая дверь', 'Закладные под коммуникации, дренажный колодец'] },
  { k: 'fine', n: 'Чистовая отделка', p: S.price_fine, spec: [
    'Всё из «Стройварианта»', 'Разводка электрики',
    'Отопление: котёл, радиаторы, тёплый пол', 'Сантехника до 5 мокрых точек',
    'Полусухая стяжка пола', 'Механизированная штукатурка Knauf MP 75'] },
  { k: 'turnkey', n: 'Под ключ', p: S.price_turnkey, spec: [
    'Всё из «Чистовой отделки»', 'Ламинат или плитка', 'Межкомнатные двери',
    'Натяжные потолки', 'Гипсокартонные работы', 'Розетки и выключатели'] }
];

var PROJECTS = [{
  id: 'p92',
  title: 'Одноэтажный дом 92,35 м²',
  area: 92.35,
  rooms: '3 спальни · кухня-гостиная 31,9 м² · санузел · котельная',
  descr: 'Кухня-гостиная с выходом на участок, три спальни, раздельный санузел с ванной, ' +
         'котельная и гардеробная. Облицовка кирпичом, четырёхскатная крыша из металлочерепицы.',
  photos: ['img/p1.jpg', 'img/p2.jpg', 'img/p3.jpg'],
  plan: 'img/plan.jpg',
  built: true
}];

var BUILT = [
  ['img/h01.jpg', 'Фасад со стороны входа'],
  ['img/h02.jpg', 'Кладка клинкерного кирпича вблизи'],
  ['img/h03.jpg', 'Окно и отлив, вид сбоку'],
  ['img/h04.jpg', 'Главный фасад вечером'],
  ['img/h05.jpg', 'Дом на участке'],
  ['img/h06.jpg', 'Боковой фасад'],
  ['img/h07.jpg', 'Кухня-гостиная после штукатурки'],
  ['img/h08.jpg', 'Стена под отделку, выведены розетки'],
  ['img/h09.jpg', 'Коридор и проёмы'],
  ['img/h10.jpg', 'Спальня, окно на участок'],
  ['img/h11.jpg', 'Спальня после механизированной штукатурки'],
  ['img/h12.jpg', 'Санузел, подготовка под плитку'],
  ['img/h13.jpg', 'Котельная с закладными'],
  ['img/h14.jpg', 'Проёмы и откосы'],
  ['img/h15.jpg', 'Задний фасад'],
  ['img/h16.jpg', 'Дом перед сдачей']
];

var SERVICES = [
  ['Разработка проектов', 'Планировка, стиль, материалы. Архитекторы и инженеры ведут проект от эскиза до сдачи в строительство, помогаем с документами и разрешениями.', null],
  ['Кадастровые работы', 'Топографическая съёмка, межевание участка, документы для регистрации участка и дома. Консультируем по земельному законодательству.', null],
  ['Геодезические работы', 'Кадастровый план участка, определение площади и границ, межевание. Точные данные для проектирования и регистрации.', null],
  ['Земляные работы', 'Очистка и подготовка участка, срез и рыхление грунта, корчевание пней, выравнивание рельефа, вывоз грунта.', null],
  ['Фундамент', 'Ленточный фундамент под ключ: разметка, траншеи, песчаная подушка, армирование и опалубка, заливка бетона, монолитная плита.', ['foundation', 'Посчитать фундамент']],
  ['Кладочные работы', 'Кладка из любого штучного материала — газоблок, кирпич. Поможем выбрать материал, цвет шва и тип кирпича.', null],
  ['Кровельные работы', 'Специализируемся на четырёхскатных вальмовых крышах. Металлочерепица, профнастил, ондулин, шифер, мягкая кровля.', null],
  ['Механизированная штукатурка', 'Гипсовая штукатурка Knauf MP 75 по маякам, с армированием стыков сеткой. В 2–3 раза быстрее ручной, стены готовы к отделке через 7–10 дней.', ['plaster', 'Посчитать штукатурку']],
  ['Укладка плитки и ламината', 'Замер, демонтаж старого покрытия, подготовка основания, комплектация материалами, укладка плитки, ламината и линолеума.', ['tile', 'Посчитать плитку']],
  ['Отделочные и ремонтные работы', 'Внутренняя отделка: штукатурка, покраска, обои, плитка, напольные покрытия. Косметический и капитальный ремонт, дизайн интерьера.', ['paint', 'Посчитать краску']],
  ['Демонтаж', 'Частичный и полный демонтаж: стены и перегородки, полы, сантехника, окна и двери, старая штукатурка и плитка, снос построек.', null]
];

var PROGRAMS = [
  { k: 'family', n: 'Семейная', rate: S.rate_family, note: 'Лимит зависит от числа детей: 6, 8 или 10 млн ₽.' },
  { k: 'it', n: 'IT-ипотека', rate: S.rate_it, note: 'Для сотрудников аккредитованных IT-компаний.' },
  { k: 'milfam', n: 'Семейная военная', rate: S.rate_milfam, note: 'Сочетание НИС и семейной. Только на готовый дом.' },
  { k: 'mil', n: 'Военная (НИС)', rate: S.rate_mil, note: 'Взнос и платежи вносит государство, пока вы служите.' }
];

var TILE_SIZES = {
  '20x30': [0.20, 0.30, 3.5, 0.30], '25x40': [0.25, 0.40, 4.0, 0.25],
  '30x30': [0.30, 0.30, 4.0, 0.30], '30x60': [0.30, 0.60, 4.5, 0.20],
  '60x60': [0.60, 0.60, 5.5, 0.15], '60x120': [0.60, 1.20, 7.0, 0.10]
};
function tileOpts(keys) {
  return (keys || Object.keys(TILE_SIZES)).map(function (k) {
    return { v: k, l: k.replace('x', ' × ') + ' см' };
  });
}
var APPLIANCES = [
  ['ind', 'Индукционная панель', 7.4, '3 × 6 мм²', '32 А', 'УЗО 30 мА'],
  ['oven', 'Духовой шкаф', 3.5, '3 × 2,5 мм²', '16 А', 'УЗО 30 мА'],
  ['wash', 'Стиральная машина', 2.5, '3 × 2,5 мм²', '16 А', 'дифавтомат 30 мА'],
  ['dish', 'Посудомоечная машина', 2.2, '3 × 2,5 мм²', '16 А', 'дифавтомат 30 мА'],
  ['boil', 'Водонагреватель', 3.0, '3 × 2,5 мм²', '16 А', 'УЗО 10 мА'],
  ['cond', 'Кондиционер', 3.5, '3 × 2,5 мм²', '16 А', '—'],
  ['warm', 'Тёплый пол', 3.0, '3 × 2,5 мм²', '16 А', 'УЗО 30 мА'],
  ['sock', 'Розетки в комнатах', 3.5, '3 × 2,5 мм²', '16 А', 'УЗО 30 мА'],
  ['light', 'Освещение', 2.0, '3 × 1,5 мм²', '10 А', '—']
];

var HEIGHTS = [{ v: 2.5, l: '2,5 м' }, { v: 2.7, l: '2,7 м' }, { v: 3, l: '3 м' }];
var OPENINGS = [
  { v: '1x1', l: '1 окно и 1 дверь' }, { v: '2x1', l: '2 окна и 1 дверь' },
  { v: '2x2', l: '2 окна и 2 двери' }, { v: '0x0', l: 'Без окон и дверей' },
  { v: 'custom', l: '✍️ Свои размеры' }
];
var WIN_STD = [1.4, 1.5], DOR_STD = [0.9, 2.1], DEPTH_STD = 0.2;

function openings(v) {
  if (v.op === 'custom') {
    return [+v.win, +v.dor, +v.winW, +v.winH, +v.dorW, +v.dorH, +v.dep];
  }
  var parts = String(v.op || '1x1').split('x');
  var w = parseInt(parts[0], 10), d = parseInt(parts[1], 10);
  if (isNaN(w) || isNaN(d)) { w = 1; d = 1; }
  return [w, d, WIN_STD[0], WIN_STD[1], DOR_STD[0], DOR_STD[1], DEPTH_STD];
}
function roomPerimeter(v, area) {
  var r = v._room;
  return r && r.per ? +r.per : 4 * Math.sqrt(Math.max(area, 0.01));
}

// ── набор вопросов: один в один с ботом ──────────────────────────────
function F(key, kind, q, extra) {
  var f = { key: key, kind: kind, q: q, opts: [], presets: [], def: null, unit: '',
            hint: '', useRoom: '', min: 0.1, max: 1e8, int: false };
  for (var k in extra) f[k] = extra[k];
  return f;
}

var CALCS = {
  room: { icon: 'room', title: 'Площадь комнаты', hint: 'Пол, стены, откосы',
    lead: ['Сделаем ремонт', 'Отделочные работы'],
    fields: [
      F('len', 'num', 'Какая длина комнаты?', { unit: 'м', def: 4.5, max: 50, presets: [3, 4, 5, 6] }),
      F('wid', 'num', 'Какая ширина комнаты?', { unit: 'м', def: 3.2, max: 50, presets: [2.5, 3, 3.5, 4] }),
      F('hei', 'choice', 'Какая высота потолка?', { opts: HEIGHTS, def: 2.7 }),
      F('op', 'choice', 'Сколько в комнате окон и дверей?', { opts: OPENINGS, def: '1x1',
        hint: 'По кнопкам берём стандартные размеры: окно 1,4 × 1,5 м, дверь 0,9 × 2,1 м' }),
      F('win', 'num', 'Сколько окон?', { unit: 'шт.', def: 1, min: 0, max: 20, int: true, presets: [0, 1, 2, 3] }),
      F('dor', 'num', 'Сколько дверей?', { unit: 'шт.', def: 1, min: 0, max: 20, int: true, presets: [0, 1, 2] }),
      F('winW', 'num', 'Ширина окна?', { unit: 'м', def: 1.4, max: 10, presets: [1.2, 1.4, 1.8] }),
      F('winH', 'num', 'Высота окна?', { unit: 'м', def: 1.5, max: 10, presets: [1.2, 1.5, 1.8] }),
      F('dorW', 'num', 'Ширина двери?', { unit: 'м', def: 0.9, max: 10, presets: [0.7, 0.8, 0.9] }),
      F('dorH', 'num', 'Высота двери?', { unit: 'м', def: 2.1, max: 10, presets: [2, 2.1] }),
      F('dep', 'choice', 'Какая глубина откоса?', { def: 0.2, opts: [
        { v: 0.1, l: '10 см' }, { v: 0.15, l: '15 см' }, { v: 0.2, l: '20 см' },
        { v: 0.25, l: '25 см' }, { v: 0.3, l: '30 см' }] })
    ],
    calc: function (v) {
      var L = +v.len, W = +v.wid, H = +v.hei, o = openings(v);
      var wins = o[0], dors = o[1], ww = o[2], wh = o[3], dw = o[4], dh = o[5], dep = o[6];
      var floor = L * W, per = 2 * (L + W);
      var holes = wins * ww * wh + dors * dw * dh;
      var walls = Math.max(0, per * H - holes);
      var slopes = (wins * (ww + 2 * wh) + dors * (dw + 2 * dh)) * dep;
      return { rows: [
          ['Площадь пола', dec(floor) + ' м²', ''],
          ['Периметр', dec(per) + ' м', ''],
          ['Площадь стен', dec(walls) + ' м²', 'проёмы вычтены'],
          ['Откосы', dec(slopes) + ' м²', 'их штукатурят и красят'],
          ['Объём', dec(floor * H) + ' м³', '']],
        note: 'Комнату запомнили — размеры подставятся в другие расчёты.',
        memo: { floor: +floor.toFixed(2), per: +per.toFixed(2), walls: +walls.toFixed(2),
                slopes: +slopes.toFixed(2), hei: H } };
    } },

  ceiling: { icon: 'ceil', title: 'Потолок', hint: 'Натяжной или гипсокартон',
    lead: ['Потолок под ключ', 'Отделочные работы'],
    fields: [
      F('type', 'choice', 'Какой потолок делаете?', { def: 'stretch', opts: [
        { v: 'stretch', l: 'Натяжной' }, { v: 'gkl', l: 'Из гипсокартона' },
        { v: 'paint', l: 'Покраска или побелка' }] }),
      F('area', 'num', 'Какая площадь потолка?', { unit: 'м²', def: 15, max: 5000,
        useRoom: 'floor', presets: [10, 15, 20, 30], hint: 'Это та же площадь, что у пола' }),
      F('lamps', 'num', 'Сколько будет светильников?', { unit: 'шт.', def: 4, min: 0, max: 100,
        int: true, presets: [0, 2, 4, 6] }),
      F('lvl', 'choice', 'Сколько уровней?', { def: 1, opts: [{ v: 1, l: '1 уровень' }, { v: 2, l: '2 уровня' }] })
    ],
    calc: function (v) {
      var area = +v.area, per = roomPerimeter(v, area);
      if (v.type === 'stretch') {
        return { rows: [
            ['Полотно', dec(area * 1.05) + ' м²', 'запас 5%'],
            ['Багет по периметру', dec(per * 1.05) + ' м', ''],
            ['Закладные под светильники', v.lamps + ' шт.', '']],
          note: 'Натяжной потолок кроят по замеру — размеры нужны точные.' };
      }
      var lv = +v.lvl === 2 ? 1.4 : 1, prof = area * S.gkl_profile_m_m2 * lv;
      return { rows: [
          ['Листы ГКЛ 1,2 × 2,5 м', up(area * 1.1 / S.gkl_sheet_m2) + ' шт.', ''],
          ['Профиль ПП 60×27', up(prof / 3) + ' шт.', up(prof) + ' м, по 3 м'],
          ['Профиль ПН 28×27', up(per / 3) + ' шт.', ''],
          ['Подвесы', up(area * S.gkl_hangers_m2 * lv) + ' шт.', ''],
          ['Саморезы', ru(up(area * S.gkl_screws_m2 * lv)) + ' шт.', ''],
          ['Лента и шпаклёвка', dec(area * 1.2) + ' м · ' + dec(area * 0.5) + ' кг', '']],
        note: 'Во влажных помещениях — влагостойкий ГКЛВ.' };
    } },

  laminate: { icon: 'floor', title: 'Ламинат', hint: 'Упаковки, подложка, плинтус',
    lead: ['Уложим ламинат', 'Укладка ламината'],
    fields: [
      F('area', 'num', 'Какая площадь пола?', { unit: 'м²', def: 15, max: 5000,
        useRoom: 'floor', presets: [10, 15, 20, 30] }),
      F('lay', 'choice', 'Как будете укладывать?', { def: 'straight', opts: [
        { v: 'straight', l: 'Прямая' }, { v: 'diagonal', l: 'По диагонали' }, { v: 'herringbone', l: 'Ёлочкой' }] }),
      F('pack', 'choice', 'Сколько м² в одной упаковке?', { def: 2, opts: [
        { v: 1.8, l: '1,8 м²' }, { v: 2, l: '2 м²' }, { v: 2.4, l: '2,4 м²' }, { v: 2, l: 'Не знаю' }],
        hint: 'Указано на коробке. «Не знаю» — считаем по 2 м²' })
    ],
    calc: function (v) {
      var area = +v.area, straight = v.lay === 'straight';
      var waste = straight ? S.waste_laminate : S.waste_laminate_diagonal;
      var q = area * (1 + waste / 100), pack = +v.pack;
      var plinth = up(roomPerimeter(v, area) * 1.05 / 2.5);
      return { rows: [
          ['Ламинат', up(q / pack) + ' упак.', dec(q) + ' м², запас ' + waste + '%'],
          ['Подложка', dec(area) + ' м²', ''],
          ['Плинтус', plinth + ' шт.', 'по 2,5 м'],
          ['Углы и соединители', (plinth + 4) + ' шт.', '']],
        note: 'Ламинат кладут от окна. На ёлочку и диагональ подрезки больше.' };
    } },

  tile: { icon: 'tile', title: 'Плитка', hint: 'Пол или стены',
    lead: ['Уложим плитку', 'Укладка плитки'],
    fields: [
      F('where', 'choice', 'Что облицовываем?', { def: 'floor', opts: [
        { v: 'floor', l: 'Пол' }, { v: 'wall', l: 'Стены' }] }),
      F('area', 'num', 'Какая площадь?', { unit: 'м²', def: 10, max: 5000,
        useRoom: 'floor', presets: [5, 10, 15, 20, 30] }),
      F('size', 'choice', 'Какой размер плитки?', { def: '30x60', opts: tileOpts() }),
      F('lay', 'choice', 'Как будете укладывать?', { def: 'straight', opts: [
        { v: 'straight', l: 'Прямая' }, { v: 'offset', l: 'Со смещением' }, { v: 'diagonal', l: 'По диагонали' }] })
    ],
    calc: function (v) {
      var area = +v.area, diag = v.lay === 'diagonal';
      var waste = diag ? S.waste_tile_diagonal : S.waste_tile;
      var t = TILE_SIZES[v.size], q = area * (1 + waste / 100);
      var count = up(q / (t[0] * t[1])), glue = area * t[2];
      return { rows: [
          ['Плитка', count + ' шт.', dec(q) + ' м², запас ' + waste + '%'],
          ['Клей', up(glue / S.glue_bag) + ' меш.', ru(glue) + ' кг'],
          ['Затирка', dec(Math.max(1, area * t[3])) + ' кг', ''],
          ['Крестики или СВП', ru(count * S.crosses_per_tile) + ' шт.', ''],
          ['Грунтовка', dec(area * S.primer_l_m2) + ' л', '']],
        note: 'Запас берём на плитку, клей и затирку считаем на чистую площадь.' };
    } },

  bath: { icon: 'bath', title: 'Санузел', hint: 'Плитка, клей, гидроизоляция',
    lead: ['Санузел под ключ', 'Укладка плитки'],
    fields: [
      F('kind', 'choice', 'Какой у вас санузел?', { def: 'both', opts: [
        { v: 'both', l: 'Совмещённый' }, { v: 'bath', l: 'Раздельный: ванная' }, { v: 'wc', l: 'Раздельный: туалет' }] }),
      F('size', 'choice', 'Какие размеры санузла?', { def: '1.7x2.0', opts: [
        { v: '1.5x1.7', l: '1,5 × 1,7 м (2,6 м²)' }, { v: '1.7x1.7', l: '1,7 × 1,7 м (2,9 м²)' },
        { v: '1.7x2.0', l: '1,7 × 2,0 м (3,4 м²)' }, { v: '2.0x2.5', l: '2,0 × 2,5 м (5 м²)' },
        { v: 'custom', l: '✍️ Свои размеры' }] }),
      F('len', 'num', 'Длина санузла?', { unit: 'м', def: 2, max: 20, presets: [1.5, 1.7, 2, 2.5] }),
      F('wid', 'num', 'Ширина санузла?', { unit: 'м', def: 1.7, max: 20, presets: [1.5, 1.7, 2] }),
      F('up', 'choice', 'До какой высоты кладём плитку?', { def: 2.5, opts: [
        { v: 2.5, l: 'До потолка, 2,5 м' }, { v: 2.1, l: 'До верха двери, 2,1 м' },
        { v: 1.2, l: 'Фартук, 1,2 м' }, { v: 0, l: 'Только пол' }] }),
      F('tile', 'choice', 'Какой размер плитки?', { def: '30x60',
        opts: tileOpts(['20x30', '25x40', '30x60', '60x60']).concat([{ v: 'diff', l: 'Разная на пол и стены' }]) }),
      F('ft', 'choice', 'Размер плитки на пол?', { def: '60x60', opts: tileOpts() }),
      F('wt', 'choice', 'Размер плитки на стены?', { def: '30x60', opts: tileOpts() }),
      F('ex', 'multi', 'Что есть в санузле?', { def: ['door', 'tub'], opts: [
        { v: 'door', l: 'Дверь' }, { v: 'tub', l: 'Ванна с экраном' },
        { v: 'shower', l: 'Душевая' }, { v: 'box', l: 'Короб для труб' }] })
    ],
    calc: function (v) {
      var size = String(v.size || '1.7x2.0'), L, W;
      if (size === 'custom') { L = +v.len; W = +v.wid; }
      else { var p = size.split('x'); L = +p[0]; W = +p[1]; }
      var upTo = +v.up, ex = v.ex || [];
      var floor = L * W, per = 2 * (L + W), walls = per * upTo;
      if (upTo > 0) {
        if (ex.indexOf('door') >= 0) walls -= 0.8 * Math.min(2, upTo);
        if (ex.indexOf('tub') >= 0) walls += Math.max(L, W) * 0.6;
        if (ex.indexOf('box') >= 0) walls += 1.5;
      }
      walls = Math.max(0, walls);
      var ft, wt;
      if (v.tile === 'diff') { ft = v.ft; wt = v.wt; } else { ft = wt = v.tile; }
      var waste = 1 + S.waste_bath / 100;
      var f = TILE_SIZES[ft], w = TILE_SIZES[wt];
      var fq = floor * waste, wq = walls * waste;
      var fn = up(fq / (f[0] * f[1])), wn = walls > 0 ? up(wq / (w[0] * w[1])) : 0;
      var glue = floor * f[2] + walls * w[2], grout = floor * f[3] + walls * w[3];
      var hydroArea = floor + per * 0.2 + (ex.indexOf('shower') >= 0 ? 4.8 : 0);
      var rows = [['Плитка на пол', fn + ' шт.', dec(fq) + ' м² с запасом ' + S.waste_bath + '%']];
      if (walls > 0) rows.push(['Плитка на стены', wn + ' шт.', dec(wq) + ' м² с запасом ' + S.waste_bath + '%']);
      rows.push(['Клей', up(glue / S.glue_bag) + ' меш.', ru(glue) + ' кг']);
      rows.push(['Затирка', dec(Math.max(1, grout)) + ' кг', '']);
      rows.push(['Крестики или СВП', ru((fn + wn) * S.crosses_per_tile) + ' шт.', '']);
      rows.push(['Грунтовка', dec((floor + walls) * S.primer_l_m2) + ' л', '']);
      rows.push(['Гидроизоляция', ru(hydroArea * S.hydro_kg_m2) + ' кг', 'пол и 20 см по стенам']);
      if (upTo > 0) rows.push(['Уголки и раскладка', dec(upTo * 2) + ' м', '']);
      return { rows: rows, note: 'В санузле много подрезки, поэтому запас 15%.' };
    } },

  wallpaper: { icon: 'paper', title: 'Обои', hint: 'Рулоны и клей',
    lead: ['Поклеим обои', 'Отделочные работы'],
    fields: [
      F('area', 'num', 'Какая площадь комнаты (по полу)?', { unit: 'м²', def: 15, max: 5000,
        useRoom: 'floor', presets: [10, 15, 20, 25, 30] }),
      F('hei', 'choice', 'Какая высота потолка?', { def: 2.7, opts: [
        { v: 2.7, l: 'До 3 м' }, { v: 3.2, l: 'Выше 3 м' }] }),
      F('w', 'choice', 'Какая ширина рулона?', { def: 1.06, opts: [
        { v: 1.06, l: '1,06 м — метровые' }, { v: 0.53, l: '0,53 м — узкие' }] }),
      F('rap', 'choice', 'Нужно подгонять рисунок?', { def: 0, opts: [
        { v: 0, l: 'Нет, без подгона' }, { v: 0.32, l: 'Да, есть раппорт' }] })
    ],
    calc: function (v) {
      var area = +v.area, per = roomPerimeter(v, area);
      var rw = +v.w, h = +v.hei + +v.rap;
      var strips = up(per / rw), perRoll = Math.max(1, Math.floor(10 / h));
      var rolls = up(strips / perRoll) + 1;
      return { rows: [
          ['Рулонов', rolls + ' шт.', dec(rw) + ' × 10 м, уже с запасом'],
          ['Полос нужно', strips + ' шт.', ''],
          ['Из рулона выходит', perRoll + ' полос', ''],
          ['Клей', up(rolls / (rw > 1 ? 3 : 6)) + ' пачк.', '']],
        note: 'Подгон рисунка считаем 32 см. Рулоны 12 и 15 м дают меньше остатков.' };
    } },

  paint: { icon: 'paint', title: 'Краска', hint: 'Стены, потолок, откосы',
    lead: ['Покрасим под ключ', 'Отделочные работы'],
    fields: [
      F('what', 'choice', 'Что будете красить?', { def: 'walls', opts: [
        { v: 'walls', l: 'Стены' }, { v: 'ceil', l: 'Потолок' },
        { v: 'both', l: 'Стены и потолок' }, { v: 'slope', l: 'Только откосы' }] }),
      F('area', 'num', 'Какая площадь комнаты (по полу)?', { unit: 'м²', def: 15, max: 5000,
        useRoom: 'floor', presets: [10, 15, 20, 25, 30] }),
      F('coats', 'choice', 'Сколько слоёв?', { def: 2, opts: [
        { v: 1, l: '1 слой' }, { v: 2, l: '2 слоя, советуем' }] }),
      F('op', 'choice', 'Сколько в комнате окон и дверей?', { opts: OPENINGS, def: '1x1',
        hint: 'Их откосы тоже красят' }),
      F('win', 'num', 'Сколько окон?', { unit: 'шт.', def: 1, min: 0, max: 20, int: true, presets: [0, 1, 2, 3] }),
      F('dor', 'num', 'Сколько дверей?', { unit: 'шт.', def: 1, min: 0, max: 20, int: true, presets: [0, 1, 2] }),
      F('winW', 'num', 'Ширина окна?', { unit: 'м', def: 1.4, max: 10, presets: [1.2, 1.4, 1.8] }),
      F('winH', 'num', 'Высота окна?', { unit: 'м', def: 1.5, max: 10, presets: [1.2, 1.5, 1.8] }),
      F('dorW', 'num', 'Ширина двери?', { unit: 'м', def: 0.9, max: 10, presets: [0.7, 0.8, 0.9] }),
      F('dorH', 'num', 'Высота двери?', { unit: 'м', def: 2.1, max: 10, presets: [2, 2.1] }),
      F('dep', 'choice', 'Какая глубина откоса?', { def: 0.2, opts: [
        { v: 0.1, l: '10 см' }, { v: 0.15, l: '15 см' }, { v: 0.2, l: '20 см' },
        { v: 0.25, l: '25 см' }, { v: 0.3, l: '30 см' }] })
    ],
    calc: function (v) {
      var room = v._room || {};
      var floor = +(v.area || room.floor || 15);
      var H = +(room.hei || 2.7), coats = +v.coats, o = openings(v);
      var wins = o[0], dors = o[1], ww = o[2], wh = o[3], dw = o[4], dh = o[5], dep = o[6];
      var per = roomPerimeter(v, floor);
      var slopes = room.slopes !== undefined ? +room.slopes
        : (wins * (ww + 2 * wh) + dors * (dw + 2 * dh)) * dep;
      var walls = room.walls !== undefined ? +room.walls
        : Math.max(0, per * H - wins * ww * wh - dors * dw * dh);
      var area, label;
      if (v.what === 'walls') { area = walls + slopes; label = 'стены и откосы'; }
      else if (v.what === 'ceil') { area = floor; label = 'потолок'; }
      else if (v.what === 'both') { area = walls + slopes + floor; label = 'стены, откосы и потолок'; }
      else { area = slopes; label = 'только откосы'; }
      var litres = area * coats / S.paint_coverage;
      var cans = [0.9, 2.5, 5, 9], can = null;
      for (var i = 0; i < cans.length; i++) if (litres <= cans[i]) { can = cans[i]; break; }
      return { rows: [
          ['Красим', dec(area) + ' м²', label],
          ['Краска', dec(litres) + ' л', coats + ' сл., 1 л ≈ ' + dec(S.paint_coverage) + ' м²'],
          ['Ближайшая банка', can ? dec(can) + ' л' : 'две по 9 л', ''],
          ['Грунтовка', dec(area / S.paint_coverage) + ' л', 'один слой']],
        note: 'Откосы: (ширина + 2 × высота проёма) × глубину откоса.' };
    } },

  plaster: { icon: 'plaster', title: 'Штукатурка', hint: 'Мешки, маяки, грунт',
    lead: ['Заказать штукатурку', 'Механизированная штукатурка'],
    fields: [
      F('area', 'num', 'Какая площадь стен?', { unit: 'м²', def: 40, max: 10000, useRoom: 'walls',
        presets: [20, 40, 60, 100], hint: 'Не знаете точно? Для комнаты это примерно площадь пола × 2,5' }),
      F('mm', 'choice', 'Насколько ровные стены?', { def: 20, opts: [
        { v: 10, l: 'Ровные, слой 10 мм' }, { v: 20, l: 'Перепады, слой 20 мм' },
        { v: 30, l: 'Кривые, слой 30 мм' }] })
    ],
    calc: function (v) {
      var area = +v.area, mm = +v.mm;
      var kilos = area * mm * S.gypsum_kg_mm, line = area / 2.7;
      return { rows: [
          ['Смесь', up(kilos / S.bag_gypsum) + ' меш.', ru(kilos) + ' кг, мешок ' + S.bag_gypsum + ' кг'],
          ['Маяки', up(line / 1.3) + ' шт.', 'шаг 1,3 м'],
          ['Уголки', up(line / 6) + ' шт.', ''],
          ['Грунтовка', dec(area * S.primer_l_m2) + ' л', '']],
        note: 'Механизированная штукатурка сохнет 7–10 дней и идёт в 2–3 раза быстрее ручной.' };
    } },

  foundation: { icon: 'found', title: 'Фундамент и стены', hint: 'Бетон, блок, кирпич',
    lead: ['Построим фундамент', 'Возведение фундамента'],
    fields: [
      F('len', 'num', 'Длина дома?', { unit: 'м', def: 10, max: 100, presets: [8, 10, 12, 15] }),
      F('wid', 'num', 'Ширина дома?', { unit: 'м', def: 12, max: 100, presets: [8, 10, 12, 15] }),
      F('inner', 'num', 'Длина внутренних несущих стен?', { unit: 'м', def: 10, min: 0, max: 500, presets: [0, 6, 10, 15] }),
      F('w', 'choice', 'Ширина ленты?', { def: 0.4, opts: [
        { v: 0.3, l: '300 мм' }, { v: 0.4, l: '400 мм, стандарт' }, { v: 0.5, l: '500 мм' }] }),
      F('h', 'choice', 'Глубина ленты?', { def: 1, opts: [
        { v: 0.8, l: '800 мм' }, { v: 1, l: '1000 мм, стандарт' }, { v: 1.2, l: '1200 мм' }] }),
      F('wall', 'choice', 'Высота стен?', { def: 3, opts: [
        { v: 2.8, l: '2,8 м' }, { v: 3, l: '3 м' }, { v: 3.2, l: '3,2 м' }] }),
      F('holes', 'num', 'Площадь проёмов окон и дверей?', { unit: 'м²', def: 18, min: 0, max: 1000, presets: [12, 18, 25, 35] })
    ],
    calc: function (v) {
      var L = +v.len, W = +v.wid, inner = +v.inner, bw = +v.w, bh = +v.h;
      var per = 2 * (L + W), run = per + inner;
      var concrete = run * bw * bh * 1.05, rebar = run * 4 * 1.1;
      var wallArea = Math.max(0, per * +v.wall - +v.holes);
      return { rows: [
          ['Длина ленты', dec(run) + ' м', ''],
          ['Бетон', dec(concrete) + ' м³', up(concrete / 6) + ' миксера по 6 м³'],
          ['Арматура ⌀12', ru(rebar) + ' м', '4 нитки'],
          ['Песок на подушку', dec(run * bw * 0.3) + ' м³', ''],
          ['Опалубка', dec(run * bh * 2) + ' м²', ''],
          ['Газоблок 250×625×300', ru(up(wallArea * 0.3 / S.block_volume)) + ' шт.', dec(wallArea * 0.3) + ' м³'],
          ['Клей для блоков', ru(wallArea * 0.3 * S.block_glue_kg_m3) + ' кг', ''],
          ['Облицовочный кирпич', ru(up(wallArea * S.brick_per_m2)) + ' шт.', S.brick_per_m2 + ' шт. на м²']],
        note: 'Наш стандарт: лента 400 × 1000 мм, стена 400 мм из газоблока с облицовкой.' };
    } },

  electric: { icon: 'bolt', title: 'Электрика', hint: 'Кабель и автоматы',
    lead: ['Консультация электрика', 'Электрика'],
    fields: [
      F('items', 'multi', 'Что подключаем?', { def: ['ind', 'oven', 'wash', 'sock', 'light'],
        opts: APPLIANCES.map(function (a) { return { v: a[0], l: a[1] }; }) }),
      F('limit', 'choice', 'Какая выделенная мощность?', { def: 15, opts: [
        { v: 5, l: '5 кВт' }, { v: 10, l: '10 кВт' }, { v: 15, l: '15 кВт, обычно' }] })
    ],
    calc: function (v) {
      var chosen = APPLIANCES.filter(function (a) { return (v.items || []).indexOf(a[0]) >= 0; });
      var rows = chosen.map(function (a) {
        return [a[1], a[3], a[4] + (a[5] !== '—' ? ' · ' + a[5] : '')];
      });
      var total = chosen.reduce(function (s, a) { return s + a[2]; }, 0);
      var factored = total * S.power_factor, limit = +v.limit;
      rows.push(['Суммарная мощность', dec(total) + ' кВт', 'с одновременностью ' + dec(factored) + ' кВт']);
      return { rows: rows,
        note: factored <= limit
          ? 'Укладываетесь в выделенные ' + limit + ' кВт. Мощную технику ведут отдельными линиями от щитка.'
          : 'Не укладываетесь в ' + limit + ' кВт — нужна прибавка мощности или разнос нагрузки по времени.',
        warn: factored > limit };
    } },

  mortgage: { icon: 'bank', title: 'Ипотека', hint: 'Платёж по программам',
    lead: ['Помочь с одобрением', 'Помощь с ипотекой'],
    fields: [
      F('prog', 'choice', 'Какая программа?', { def: 'family',
        opts: PROGRAMS.map(function (p) { return { v: p.k, l: p.n + ', ' + dec(p.rate) + '%' }; }) }),
      F('kids', 'choice', 'Сколько у вас детей?', { def: 2, opts: [
        { v: 1, l: '1 ребёнок, до 6 млн ₽' }, { v: 2, l: '2 детей, до 8 млн ₽' },
        { v: 3, l: '3 и больше, до 10 млн ₽' }] }),
      F('price', 'num', 'Сколько стоит дом?', { unit: '₽', def: 7000000, min: 100000, max: 1e8,
        int: true, presets: [3000000, 5000000, 7000000, 10000000] }),
      F('down', 'choice', 'Какой первоначальный взнос?', { def: 20, opts: [
        { v: 10, l: '10%' }, { v: 20, l: '20%' }, { v: 30, l: '30%' }, { v: 50, l: '50%' }] }),
      F('term', 'choice', 'На какой срок?', { def: 20, opts: [
        { v: 15, l: '15 лет' }, { v: 20, l: '20 лет' }, { v: 25, l: '25 лет' }, { v: 30, l: '30 лет' }] })
    ],
    calc: function (v) {
      var prog = PROGRAMS.filter(function (p) { return p.k === v.prog; })[0] || PROGRAMS[0];
      var rate = prog.rate, price = +v.price, downPct = +v.down, years = +v.term;
      var down = price * downPct / 100, loan = price - down;
      var rows = [
        ['Программа', prog.n + ', ' + dec(rate) + '%', prog.note],
        ['Первый взнос', money(down), dec(downPct) + '%'],
        ['Кредит', money(loan), years + ' лет']];
      if (v.prog === 'family') {
        var limit = S['limit_kids_' + (+v.kids)];
        rows.push(['Лимит программы', money(limit),
          loan <= limit ? 'проходит' : 'превышен на ' + money(loan - limit)]);
      }
      if (downPct < S.down_min) {
        rows.push(['Взнос ниже обычного', 'банки просят от ' + dec(S.down_min) + '%', 'уточним условия у менеджера']);
      }
      var payment = annuity(loan, rate, years);
      rows.push([years > S.subsidy_years ? 'Платёж до ' + S.subsidy_years + ' лет' : 'Ежемесячный платёж',
        ru(payment) + ' ₽/мес', '']);
      if (years > S.subsidy_years) {
        var rest = balance(loan, rate, years, S.subsidy_years * 12);
        rows.push(['Платёж после ' + S.subsidy_years + ' лет',
          ru(annuity(rest, S.rate_after_15, years - S.subsidy_years)) + ' ₽/мес',
          'ставка вырастет, но не выше ' + dec(S.rate_after_15) + '%']);
      }
      return { rows: rows,
        note: 'Субсидирование ставки действует 15–30 лет. Ставку и сумму подтверждает банк.',
        warn: v.prog === 'milfam' };
    } }
};

var CALC_ORDER = ['room', 'ceiling', 'laminate', 'tile', 'bath', 'wallpaper', 'paint', 'plaster', 'foundation', 'electric', 'mortgage'];

function skip(id, f, v) {
  var detail = ['win', 'dor', 'winW', 'winH', 'dorW', 'dorH', 'dep'];
  if ((id === 'room' || id === 'paint') && detail.indexOf(f.key) >= 0) return v.op !== 'custom';
  if (id === 'paint') {
    if (f.key === 'area' && v.what === 'slope') return true;
    if (f.key === 'op' && v.what === 'ceil') return true;
  }
  if (id === 'bath') {
    if ((f.key === 'len' || f.key === 'wid') && v.size !== 'custom') return true;
    if ((f.key === 'ft' || f.key === 'wt') && v.tile !== 'diff') return true;
    if (f.key === 'wt' && +v.up === 0) return true;
  }
  if (id === 'ceiling') {
    if (f.key === 'lamps' && v.type !== 'stretch') return true;
    if (f.key === 'lvl' && v.type !== 'gkl') return true;
  }
  if (id === 'mortgage' && f.key === 'kids' && v.prog !== 'family') return true;
  return false;
}

// ── иконки плиток ────────────────────────────────────────────────────
var ICONS = {
  room: '<path d="M4 4h16v16H4z"/><path d="M4 14h16M14 4v16"/>',
  ceil: '<path d="M3 7h18M5 7v10h14V7"/><path d="M9 12h6"/>',
  floor: '<path d="M3 6h18v12H3z"/><path d="M3 10h18M3 14h18M9 6v4M15 10v4M9 14v4"/>',
  tile: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  bath: '<path d="M4 11h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M7 11V6a2 2 0 0 1 4 0"/>',
  paper: '<path d="M5 4h9v16H7a2 2 0 0 1-2-2z"/><path d="M14 4h3a2 2 0 0 1 2 2v3h-5z"/>',
  paint: '<path d="M5 4h10v6H5z"/><path d="M15 7h3v5l-4 2v6h-3v-7l4-2z"/>',
  plaster: '<path d="M3 15 15 3l6 6L9 21z"/><path d="M11 7l6 6"/>',
  found: '<path d="M3 10h18v9H3z"/><path d="M3 10 12 4l9 6"/><path d="M8 19v-5h8v5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  bank: '<path d="M3 10h18L12 4z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>'
};
function icon(name) {
  return '<svg viewBox="0 0 24 24">' + (ICONS[name] || ICONS.room) + '</svg>';
}

// ── память о комнате ─────────────────────────────────────────────────
var ROOM_KEY = 'ds_room';
function savedRoom() {
  try { return JSON.parse(localStorage.getItem(ROOM_KEY) || 'null'); } catch (e) { return null; }
}
function saveRoom(memo) {
  try { localStorage.setItem(ROOM_KEY, JSON.stringify(memo)); } catch (e) { /* приватный режим */ }
  paintMemo();
}
function paintMemo() {
  var box = $('#memo'); box.innerHTML = '';
  var r = savedRoom();
  if (!r) return;
  var line = el('div', 'memo');
  line.innerHTML = 'Комната запомнена: пол <b>' + dec(r.floor) + ' м²</b>, стены <b>' + dec(r.walls) +
    ' м²</b> — подставляем в расчёты.';
  var drop = el('button', 'link', 'Забыть');
  drop.addEventListener('click', function () {
    try { localStorage.removeItem(ROOM_KEY); } catch (e) { /* ignore */ }
    paintMemo();
  });
  line.appendChild(drop);
  box.appendChild(line);
}

// ── расчёт стоимости дома (первый экран) ─────────────────────────────
var area = 110, tier = 'fine', plot = 'yes', pay = 'mort', lastCalc = null;
var PLOTS = [{ v: 'yes', l: 'Есть' }, { v: 'help', l: 'Нужна помощь' }, { v: 'soon', l: 'В процессе покупки' }];
var PAYS = [{ v: 'own', l: 'Свои средства' }, { v: 'mort', l: 'Ипотека' },
            { v: 'matcap', l: 'Ипотека и маткапитал' }, { v: 'none', l: 'Пока не решил' }];

function selectBox(opts, value, onChange, label) {
  var sel = el('select', 'inp');
  sel.setAttribute('aria-label', label);
  opts.forEach(function (o) {
    var op = el('option', '', o.l); op.value = o.v;
    if (o.v === value) op.selected = true;
    sel.appendChild(op);
  });
  sel.addEventListener('change', function () { onChange(sel.value); });
  return sel;
}

function setArea(v, from) {
  v = Math.min(400, Math.max(40, Math.round(v || 0)));
  area = v;
  if (from !== 'inp') $('#areaInp').value = v;
  if (from !== 'range') $('#areaRange').value = Math.min(250, Math.max(60, v));
  paintHouse();
}

function paintHouse() {
  var tabs = $('#tabs'); tabs.innerHTML = '';
  TIERS.forEach(function (t) {
    var b = el('button', 'tab');
    b.type = 'button';
    b.setAttribute('aria-pressed', t.k === tier ? 'true' : 'false');
    b.innerHTML = '<b>' + t.n + '</b><span>' + ru(t.p) + ' ₽/м²</span>';
    b.addEventListener('click', function () { tier = t.k; paintHouse(); });
    tabs.appendChild(b);
  });

  var cur = TIERS.filter(function (t) { return t.k === tier; })[0];
  var total = cur.p * area;
  $('#sum').textContent = money(total);
  $('#sumNote').textContent = cur.n + ' · ' + ru(cur.p) + ' ₽/м² · ' + area + ' м²';

  var down = total * S.down_min / 100;
  var mini = $('#mini'); mini.innerHTML = '';
  [['Срок строительства', S.build_months + ' мес.'],
   ['Первый взнос ' + dec(S.down_min) + '%', money(down)],
   ['Платёж по семейной, 20 лет', ru(annuity(total - down, S.rate_family, 20)) + ' ₽/мес']
  ].forEach(function (r) {
    var row = el('div', 'row');
    row.innerHTML = '<span>' + r[0] + '</span><b>' + r[1] + '</b>';
    mini.appendChild(row);
  });

  lastCalc = { title: 'Стоимость дома', rows: [
    ['Площадь', area + ' м²'], ['Вариант', cur.n], ['Стоимость', money(total)],
    ['Участок', (PLOTS.filter(function (p) { return p.v === plot; })[0] || {}).l],
    ['Оплата', (PAYS.filter(function (p) { return p.v === pay; })[0] || {}).l]] };

  var spec = $('#specBody');
  if (!spec.childElementCount) {
    TIERS.forEach(function (t) {
      var card = el('div', 'card');
      card.innerHTML = '<h3>' + t.n + '<span>' + ru(t.p) + ' ₽/м²</span></h3><ul>' +
        t.spec.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';
      spec.appendChild(card);
    });
  }
}

// ── проекты ──────────────────────────────────────────────────────────
var BANDS = [['До 100 м²', 0, 100], ['100–120 м²', 100, 120], ['Больше 120 м²', 120, 1e5], ['Все проекты', 0, 1e5]];
var band = 3;

function paintProjects() {
  var f = $('#projFilter'); f.innerHTML = '';
  BANDS.forEach(function (b, i) {
    var c = el('button', 'chip', b[0]);
    c.type = 'button';
    c.setAttribute('aria-pressed', i === band ? 'true' : 'false');
    c.addEventListener('click', function () { band = i; paintProjects(); });
    f.appendChild(c);
  });

  var grid = $('#projGrid'); grid.innerHTML = '';
  var list = PROJECTS.filter(function (p) { return p.area >= BANDS[band][1] && p.area < BANDS[band][2]; });
  grid.className = list.length === 1 ? 'grid-3 solo' : 'grid-3';
  if (!list.length) {
    var empty = el('p', 'lede', 'В этой площади проектов пока нет. Покажем похожие или подготовим проект под вас.');
    grid.appendChild(empty);
    var ask = el('button', 'btn ghost', 'Подобрать проект');
    ask.addEventListener('click', function () { openLead('Подбор проекта'); });
    grid.appendChild(ask);
    return;
  }
  list.forEach(function (p) {
    var card = el('button', 'pcard');
    card.type = 'button';
    card.innerHTML =
      '<span class="ph"><img src="' + p.photos[0] + '" alt="' + p.title + '" loading="lazy"></span>' +
      '<span class="in">' +
        '<h3>' + p.title + '</h3>' +
        '<span class="tags"><span class="tag">' + dec(p.area, 2) + ' м²</span>' +
          (p.built ? '<span class="tag">построен</span>' : '') +
          '<span class="tag">планировка есть</span></span>' +
        '<span class="lede" style="font-size:13.5px">' + p.rooms + '</span>' +
        '<span class="price-row"><span class="p">' + money(p.area * S.price_base) + '</span>' +
        '<span class="k">стройвариант</span></span>' +
      '</span>';
    card.addEventListener('click', function () { openProject(p); });
    grid.appendChild(card);
  });
}

function openProject(p) {
  var box = $('#modal .box');
  box.classList.add('wide');
  $('#mTitle').textContent = p.title;
  $('#mStep').textContent = dec(p.area, 2) + ' м²';
  var body = $('#mBody'); body.innerHTML = '';

  var gal = el('div', 'card-ph');
  p.photos.concat([p.plan]).forEach(function (src, i) {
    var b = el('button'); b.type = 'button';
    b.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
    b.addEventListener('click', function () {
      openLightbox(p.photos.map(function (s) { return [s, p.title]; })
        .concat([[p.plan, 'Планировка · ' + p.title]]), i);
    });
    gal.appendChild(b);
  });
  body.appendChild(gal);

  body.appendChild(el('p', 'lede', p.descr));

  var res = el('div', 'res');
  TIERS.forEach(function (t) {
    var r = el('div', 'r');
    r.innerHTML = '<span class="n"><b>' + t.n + '</b>' + ru(t.p) + ' ₽/м²</span>' +
      '<span class="v">' + money(t.p * p.area) + '</span>';
    res.appendChild(r);
  });
  body.appendChild(res);
  body.appendChild(el('p', 'note', 'Стоимость ориентировочная: точную смету прораб считает после обсуждения проекта. ' +
    'Планировку меняем под вас.'));

  var foot = $('#mFoot'); foot.innerHTML = '';
  var want = el('button', 'btn', 'Хочу такой дом');
  want.addEventListener('click', function () { openLead('Строительство по проекту «' + p.title + '»'); });
  var photos = el('button', 'btn ghost', 'Фото построенного дома');
  photos.addEventListener('click', function () { closeModal(); openLightbox(BUILT, 0); });
  foot.appendChild(want);
  if (p.built) foot.appendChild(photos);
  lastCalc = { title: p.title, rows: [['Площадь', dec(p.area, 2) + ' м²'],
    ['Стройвариант', money(p.area * S.price_base)], ['Под ключ', money(p.area * S.price_turnkey)]] };
  openModal();
}

// ── построенный дом ──────────────────────────────────────────────────
function paintGallery() {
  var g = $('#gal'); g.innerHTML = '';
  BUILT.slice(0, 7).forEach(function (item, i) {
    var b = el('button'); b.type = 'button';
    b.setAttribute('aria-label', item[1]);
    b.innerHTML = '<img src="' + item[0] + '" alt="' + item[1] + '" loading="lazy">';
    b.addEventListener('click', function () { openLightbox(BUILT, i); });
    g.appendChild(b);
  });
}

// ── просмотр фотографий ──────────────────────────────────────────────
var lbList = [], lbIdx = 0;
function openLightbox(list, idx) {
  lbList = list; lbIdx = idx || 0;
  $('#lb').hidden = false;
  document.body.style.overflow = 'hidden';
  paintLightbox();
  $('#lbClose').focus();
}
function paintLightbox() {
  var item = lbList[lbIdx];
  $('#lbImg').src = item[0];
  $('#lbImg').alt = item[1] || '';
  $('#lbCap').textContent = item[1] || '';
  $('#lbCount').textContent = (lbIdx + 1) + ' / ' + lbList.length;
}
function closeLightbox() {
  $('#lb').hidden = true;
  if ($('#modal').hidden) document.body.style.overflow = '';
}
function stepLightbox(d) {
  lbIdx = (lbIdx + d + lbList.length) % lbList.length;
  paintLightbox();
}

// ── модальное окно ───────────────────────────────────────────────────
var lastFocus = null;
function openModal() {
  lastFocus = document.activeElement;
  $('#modal').hidden = false;
  document.body.style.overflow = 'hidden';
  var first = $('#mBody button, #mBody input, #mFoot button');
  if (first) first.focus();
}
function closeModal() {
  $('#modal').hidden = true;
  $('#modal .box').classList.remove('wide');
  $('#mStep').textContent = '';
  if ($('#lb').hidden) document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

// ── калькуляторы: вопрос за вопросом ─────────────────────────────────
function paintTiles() {
  var t = $('#tiles'); t.innerHTML = '';
  CALC_ORDER.forEach(function (id) {
    var c = CALCS[id];
    var b = el('button', 'tile');
    b.type = 'button';
    b.innerHTML = '<span class="ic">' + icon(c.icon) + '</span>' +
      '<span class="tx"><b>' + c.title + '</b><span>' + c.hint + '</span></span>';
    b.addEventListener('click', function () { openCalc(id); });
    t.appendChild(b);
  });
}

function openCalc(id, preset) {
  var c = CALCS[id];
  var values = {}, given = [];
  var room = savedRoom();
  if (room) values._room = room;
  for (var k in (preset || {})) { values[k] = preset[k]; given.push(k); }
  var idx = 0;

  function visible() {
    return c.fields.filter(function (f) { return !skip(id, f, values); });
  }
  function asked() {
    return visible().filter(function (f) { return given.indexOf(f.key) < 0; });
  }

  function render() {
    var fields = visible();
    while (idx < fields.length && given.indexOf(fields[idx].key) >= 0 && values[fields[idx].key] !== undefined) idx++;
    $('#mTitle').textContent = c.title;
    var body = $('#mBody'); body.innerHTML = '';
    var foot = $('#mFoot'); foot.innerHTML = '';

    if (idx >= fields.length) { renderResult(body, foot); return; }

    var f = fields[idx];
    var list = asked();
    var pos = 0;
    for (var i = 0; i < list.length; i++) if (list[i].key === f.key) pos = i + 1;
    $('#mStep').textContent = 'Вопрос ' + (pos || 1) + ' из ' + list.length;

    body.appendChild(el('p', 'q-title', f.q));
    if (f.hint) body.appendChild(el('p', 'q-hint', f.hint));

    if (f.kind === 'choice') {
      var opts = el('div', 'opts');
      f.opts.forEach(function (o) {
        var b = el('button', 'opt', o.l);
        b.type = 'button';
        b.addEventListener('click', function () { answer(f, o.v); });
        opts.appendChild(b);
      });
      body.appendChild(opts);
    } else if (f.kind === 'multi') {
      var chosen = values[f.key] || f.def.slice();
      values[f.key] = chosen;
      var wrapM = el('div', 'opts');
      f.opts.forEach(function (o) {
        var b = el('button', 'opt', o.l);
        b.type = 'button';
        b.setAttribute('aria-pressed', chosen.indexOf(o.v) >= 0 ? 'true' : 'false');
        b.addEventListener('click', function () {
          var at = chosen.indexOf(o.v);
          if (at >= 0) chosen.splice(at, 1); else chosen.push(o.v);
          render();
        });
        wrapM.appendChild(b);
      });
      body.appendChild(wrapM);
      var done = el('button', 'btn', 'Готово');
      done.addEventListener('click', function () {
        if (!chosen.length) return;
        idx++; render();
      });
      foot.appendChild(done);
    } else {
      var optsN = el('div', 'opts');
      var room2 = values._room;
      if (f.useRoom && room2 && room2[f.useRoom]) {
        var rv = Math.round(room2[f.useRoom] * 10) / 10;
        var rb = el('button', 'opt', 'Моя комната: ' + dec(rv) + ' ' + f.unit);
        rb.type = 'button';
        rb.addEventListener('click', function () { answer(f, rv); });
        optsN.appendChild(rb);
      }
      f.presets.forEach(function (p) {
        var label = f.unit === '₽' ? dec(p / 1e6) + ' млн ₽' : dec(p) + ' ' + f.unit;
        var b = el('button', 'opt', label.trim());
        b.type = 'button';
        b.addEventListener('click', function () { answer(f, p); });
        optsN.appendChild(b);
      });
      body.appendChild(optsN);

      var row = el('div', 'numrow');
      var inp = el('input', 'inp');
      inp.type = 'number'; inp.inputMode = 'decimal';
      inp.placeholder = 'Своё значение' + (f.unit ? ', ' + f.unit : '');
      inp.style.flex = '1 1 160px';
      var go = el('button', 'btn ghost', 'Посчитать');
      var err = el('p', 'hint bad'); err.hidden = true;
      function submit() {
        var n = parseFloat(String(inp.value).replace(',', '.'));
        if (isNaN(n) || n < f.min || n > f.max) {
          err.textContent = 'Нужно число от ' + dec(f.min) + ' до ' + dec(f.max) + '.';
          err.hidden = false; inp.focus(); return;
        }
        answer(f, f.int ? Math.round(n) : n);
      }
      go.addEventListener('click', submit);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      row.appendChild(inp); row.appendChild(go);
      body.appendChild(row);
      body.appendChild(err);
    }

    if (idx > 0) {
      var back = el('button', 'btn ghost', 'Назад');
      back.addEventListener('click', function () {
        idx = Math.max(0, idx - 1);
        while (idx > 0 && given.indexOf(visible()[idx].key) >= 0) idx--;
        render();
      });
      foot.appendChild(back);
    }
    var close = el('button', 'link', 'Закрыть');
    close.addEventListener('click', closeModal);
    foot.appendChild(close);
  }

  function answer(f, value) {
    values[f.key] = value;
    if (id === 'ceiling' && f.key === 'type' && value === 'paint') {
      closeModal();
      openCalc('paint', { what: 'ceil' });
      return;
    }
    idx++;
    render();
  }

  function renderResult(body, foot) {
    $('#mStep').textContent = 'Результат';
    var out = c.calc(values);
    var res = el('div', 'res');
    out.rows.forEach(function (r) {
      var row = el('div', 'r');
      row.innerHTML = '<span class="n"><b>' + r[0] + '</b>' + (r[2] || '') + '</span>' +
        '<span class="v">' + r[1] + '</span>';
      res.appendChild(row);
    });
    body.appendChild(res);
    if (out.note) body.appendChild(el('p', 'note' + (out.warn ? ' warn' : ''), out.note));
    body.appendChild(el('p', 'hint', 'Расчёт примерный. Точное количество — после замера.'));
    if (out.memo) saveRoom(out.memo);
    lastCalc = { title: c.title, rows: out.rows.map(function (r) { return [r[0], r[1]]; }) };

    var lead = el('button', 'btn', c.lead[0]);
    lead.addEventListener('click', function () { openLead(c.lead[1]); });
    var again = el('button', 'btn ghost', 'Посчитать ещё');
    again.addEventListener('click', function () { values = room ? { _room: room } : {}; given = []; idx = 0; render(); });
    var copy = el('button', 'link', 'Скопировать расчёт');
    copy.addEventListener('click', function () {
      var text = c.title + '\n' + out.rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
      copyText(text, copy, 'Скопировать расчёт');
    });
    foot.appendChild(lead); foot.appendChild(again); foot.appendChild(copy);
  }

  render();
  openModal();
}

// ── ипотека: карточки программ ───────────────────────────────────────
function paintPrograms() {
  var box = $('#progs'); box.innerHTML = '';
  PROGRAMS.forEach(function (p) {
    var b = el('button', 'prog');
    b.type = 'button';
    b.innerHTML = '<span class="rate">' + dec(p.rate) + '%</span><h3>' + p.n + '</h3>' +
      '<p>' + p.note + '</p><span class="go">Посчитать платёж →</span>';
    b.addEventListener('click', function () { openCalc('mortgage', { prog: p.k }); });
    box.appendChild(b);
  });
}

// ── услуги ───────────────────────────────────────────────────────────
function paintServices() {
  var box = $('#srv'); box.innerHTML = '';
  SERVICES.forEach(function (s) {
    var card = el('div', 'scard');
    card.appendChild(el('h3', '', s[0]));
    card.appendChild(el('p', '', s[1]));
    var more = el('div', 'more');
    var lead = el('button', 'link', 'Оставить заявку');
    lead.addEventListener('click', function () { openLead(s[0]); });
    more.appendChild(lead);
    if (s[2]) {
      var calcBtn = el('button', 'link', s[2][1]);
      calcBtn.addEventListener('click', function () { openCalc(s[2][0]); });
      more.appendChild(calcBtn);
    }
    card.appendChild(more);
    box.appendChild(card);
  });
}

// ── подбор участка ───────────────────────────────────────────────────
var LAND_PLACES = ['Аксайский район', 'Ростов-на-Дону', 'Батайск', 'Другое место в области'];
var LAND_BUDGETS = ['До 1 млн ₽', '1–2 млн ₽', '2–3 млн ₽', 'Больше 3 млн ₽', 'Пока не знаю'];
var landPlace = LAND_PLACES[0], landBudget = LAND_BUDGETS[1];

function paintLand() {
  [['#landPlace', LAND_PLACES, function (v) { landPlace = v; }, function () { return landPlace; }],
   ['#landBudget', LAND_BUDGETS, function (v) { landBudget = v; }, function () { return landBudget; }]
  ].forEach(function (cfg) {
    var box = $(cfg[0]); box.innerHTML = '';
    cfg[1].forEach(function (v) {
      var c = el('button', 'chip', v);
      c.type = 'button';
      c.setAttribute('aria-pressed', cfg[3]() === v ? 'true' : 'false');
      c.addEventListener('click', function () { cfg[2](v); paintLand(); });
      box.appendChild(c);
    });
  });
}

// ── заявка ───────────────────────────────────────────────────────────
var WHEN = ['В ближайший месяц', 'В течение 3 месяцев', 'В этом году', 'Пока присматриваюсь'];
var PLACES = ['Аксайский район', 'Ростов-на-Дону', 'Батайск', 'Другое место'];
var WAYS = ['Позвонить', 'Telegram', 'WhatsApp'];

function chipRow(list, value, onPick) {
  var box = el('div', 'chips');
  list.forEach(function (v) {
    var c = el('button', 'chip', v);
    c.type = 'button';
    c.setAttribute('aria-pressed', v === value() ? 'true' : 'false');
    c.addEventListener('click', function () {
      onPick(v);
      Array.prototype.forEach.call(box.children, function (ch) {
        ch.setAttribute('aria-pressed', ch.textContent === v ? 'true' : 'false');
      });
    });
    box.appendChild(c);
  });
  return box;
}

function openLead(service) {
  var box = $('#modal .box');
  box.classList.remove('wide');
  $('#mTitle').textContent = 'Заявка';
  $('#mStep').textContent = service || '';
  var body = $('#mBody'); body.innerHTML = '';
  var foot = $('#mFoot'); foot.innerHTML = '';

  var when = WHEN[0], place = PLACES[0], way = WAYS[0];
  var form = el('form', 'fields');
  form.noValidate = true;

  function field(label, node) {
    var f = el('div', 'field');
    f.appendChild(el('span', 'fl', label));
    f.appendChild(node);
    return f;
  }
  var name = el('input', 'inp'); name.autocomplete = 'name'; name.placeholder = 'Как к вам обращаться';
  var phone = el('input', 'inp'); phone.inputMode = 'tel'; phone.autocomplete = 'tel'; phone.placeholder = '+7 900 000-00-00';
  var comment = el('textarea', 'inp'); comment.placeholder = 'Опишите задачу в одной-двух фразах — необязательно';

  form.appendChild(field('Имя', name));
  form.appendChild(field('Телефон', phone));
  form.appendChild(field('Когда планируете начать', chipRow(WHEN, function () { return when; }, function (v) { when = v; })));
  form.appendChild(field('Где находится объект', chipRow(PLACES, function () { return place; }, function (v) { place = v; })));
  form.appendChild(field('Комментарий', comment));
  form.appendChild(field('Как удобнее связаться', chipRow(WAYS, function () { return way; }, function (v) { way = v; })));
  var err = el('p', 'hint bad'); err.hidden = true;
  form.appendChild(err);
  body.appendChild(form);

  if (lastCalc) {
    body.appendChild(el('p', 'note', 'К заявке приложим расчёт: ' + lastCalc.title + ' — ' +
      lastCalc.rows.map(function (r) { return r[0] + ' ' + r[1]; }).join(', ')));
  }

  var send = el('button', 'btn', 'Отправить заявку');
  var fine = el('p', 'hint');
  fine.style.flex = '1 1 180px';
  fine.textContent = 'Отправляя, вы соглашаетесь на обработку персональных данных.';
  foot.appendChild(send); foot.appendChild(fine);

  function compose() {
    var lines = ['Заявка с сайта domstroy161', 'Услуга: ' + (service || 'Консультация')];
    if (lastCalc) lines.push('Расчёт: ' + lastCalc.title + ' — ' +
      lastCalc.rows.map(function (r) { return r[0] + ' ' + r[1]; }).join(', '));
    lines.push('Когда начать: ' + when);
    lines.push('Где объект: ' + place);
    if (comment.value.trim()) lines.push('Комментарий: ' + comment.value.trim());
    lines.push('Имя: ' + name.value.trim());
    lines.push('Телефон: ' + phone.value.trim());
    lines.push('Связь: ' + way);
    return lines.join('\n');
  }

  function submit() {
    if (name.value.trim().length < 2) {
      err.textContent = 'Напишите, как к вам обращаться.'; err.hidden = false; name.focus(); return;
    }
    if (phone.value.replace(/\D/g, '').length < 10) {
      err.textContent = 'Телефон нужен с кодом — 10 или 11 цифр.'; err.hidden = false; phone.focus(); return;
    }
    var text = compose();
    body.innerHTML = '';
    foot.innerHTML = '';
    var done = el('div', 'sent');
    done.innerHTML = '<span class="tick"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="m5 13 4 4L19 7"/></svg></span><h3>Заявка готова, ' + name.value.trim() + '</h3>' +
      '<p class="hint">Отправьте её менеджеру одним нажатием — он ответит в рабочее время, ' +
      'пн–пт с 9:00 до 16:00.</p>';
    body.appendChild(done);
    var pre = el('p', 'note');
    pre.style.whiteSpace = 'pre-line';
    pre.textContent = text;
    body.appendChild(pre);

    var tg = el('a', 'btn', 'Отправить в Telegram');
    tg.href = BOT; tg.target = '_blank'; tg.rel = 'noopener';
    var wa = el('a', 'btn ghost', 'Написать в WhatsApp');
    wa.href = 'https://wa.me/' + PHONE_DIGITS + '?text=' + encodeURIComponent(text);
    wa.target = '_blank'; wa.rel = 'noopener';
    var call = el('a', 'btn ghost', 'Позвонить ' + PHONE);
    call.href = 'tel:+' + PHONE_DIGITS;
    var copy = el('button', 'link', 'Скопировать заявку');
    copy.addEventListener('click', function () { copyText(text, copy, 'Скопировать заявку'); });
    foot.appendChild(tg); foot.appendChild(wa); foot.appendChild(call); foot.appendChild(copy);
    tg.focus();
  }

  send.addEventListener('click', submit);
  form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
  openModal();
  name.focus();
}

function copyText(text, btn, original) {
  var ok = function () { btn.textContent = 'Скопировано'; setTimeout(function () { btn.textContent = original; }, 1600); };
  var fail = function () { btn.textContent = 'Выделите вручную'; setTimeout(function () { btn.textContent = original; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(fail);
  } else { fail(); }
}

// ── события страницы ─────────────────────────────────────────────────
$('#areaInp').addEventListener('input', function () { setArea(parseFloat(this.value), 'inp'); });
$('#areaRange').addEventListener('input', function () { setArea(parseFloat(this.value), 'range'); });
$('#plotSel').appendChild(selectBox(PLOTS, plot, function (v) { plot = v; paintHouse(); }, 'Участок'));
$('#paySel').appendChild(selectBox(PAYS, pay, function (v) { pay = v; paintHouse(); }, 'Как планируете оплачивать'));
$('#toMort').addEventListener('click', function () {
  var cur = TIERS.filter(function (t) { return t.k === tier; })[0];
  openCalc('mortgage', { price: Math.round(cur.p * area) });
});
$('#allPhotos').addEventListener('click', function () { openLightbox(BUILT, 0); });
$('#landGo').addEventListener('click', function () {
  openLead('Подбор участка: ' + landPlace + ', бюджет ' + landBudget);
});
$('#lbClose').addEventListener('click', closeLightbox);
$('#lbPrev').addEventListener('click', function () { stepLightbox(-1); });
$('#lbNext').addEventListener('click', function () { stepLightbox(1); });

document.addEventListener('click', function (e) {
  if (e.target.closest('[data-close]')) { closeModal(); return; }
  var lead = e.target.closest('[data-lead]');
  if (lead) { openLead(lead.dataset.lead); return; }
  var cp = e.target.closest('[data-copy]');
  if (cp) { copyText(cp.dataset.copy, cp, 'Скопировать'); }
});
document.addEventListener('keydown', function (e) {
  if (!$('#lb').hidden) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
    return;
  }
  if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
});

paintHouse();
paintProjects();
paintGallery();
paintTiles();
paintMemo();
paintPrograms();
paintServices();
paintLand();
})();
