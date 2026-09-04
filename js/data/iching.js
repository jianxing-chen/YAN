/* 衍 · the oracle — 大衍之数五十，其用四十有九。
   The gate offers a divination: three coins, six lines. The cast hexagram
   seeds the palette drift of your visit — randomness as patron. */

/* rows keyed by upper trigram (0坤 1震 2坎 3兑 4艮 5离 6巽 7乾),
   columns in classical order (乾兑离震巽坎艮坤) → King Wen number */
const KW = [
  [12, 45, 35, 16, 20,  8, 23,  2],
  [25, 17, 21, 51, 42,  3, 27, 24],
  [ 6, 47, 64, 40, 59, 29,  4,  7],
  [10, 58, 38, 54, 61, 60, 41, 19],
  [33, 31, 22, 62, 53, 39, 52, 15],
  [13, 49, 30, 55, 37, 63, 56, 36],
  [44, 28, 50, 32, 57, 48, 18, 46],
  [ 1, 43, 14, 34,  9,  5, 26, 11],
];
const COL = { 7: 0, 3: 1, 5: 2, 1: 3, 6: 4, 2: 5, 4: 6, 0: 7 };

const triIdx = l => (l[0] % 2) | ((l[1] % 2) << 1) | ((l[2] % 2) << 2);
const kingWen = lines => KW[triIdx(lines.slice(3))][COL[triIdx(lines.slice(0, 3))]];

/* 64 hexagrams — names follow tradition; the glosses are the palace's own */
export const HEX = [
  { n: 1,  zh: '乾', en: 'The Creative', g: '六爻皆阳，纯动不息', ge: 'six unbroken lines — pure motion, no rest' },
  { n: 2,  zh: '坤', en: 'The Receptive', g: '全然敞开，负载万形', ge: 'wholly open, carrying every form' },
  { n: 3,  zh: '屯', en: 'Difficulty at the Beginning', g: '芽顶石而出，难是生的第一步', ge: 'a sprout lifts stone; difficulty is life\'s first act' },
  { n: 4,  zh: '蒙', en: 'Youthful Folly', g: '蒙昧不是罪，是提问的姿势', ge: 'ignorance is not sin; it is the posture of asking' },
  { n: 5,  zh: '需', en: 'Waiting', g: '云已聚而雨未落，等待亦是有为', ge: 'clouds gathered, rain withheld — waiting is also doing' },
  { n: 6,  zh: '讼', en: 'Conflict', g: '各执一辞时，让律法开口', ge: 'when each insists, let the law speak' },
  { n: 7,  zh: '师', en: 'The Army', g: '众需律，律需正', ge: 'the many need law; law needs rectitude' },
  { n: 8,  zh: '比', en: 'Holding Together', g: '水行地上，亲比乃安', ge: 'water over earth — closeness is safety' },
  { n: 9,  zh: '小畜', en: 'Small Taming', g: '力小而蓄，密云不雨', ge: 'small force, stored; dense cloud, no rain yet' },
  { n: 10, zh: '履', en: 'Treading', g: '履虎尾而不咬，礼在分寸', ge: 'tread the tiger\'s tail unharmed — propriety is measure' },
  { n: 11, zh: '泰', en: 'Peace', g: '天气下降，地气上升，交通则泰', ge: 'heaven descends, earth rises; circulation is peace' },
  { n: 12, zh: '否', en: 'Standstill', g: '各守其位，交流断绝', ge: 'each keeps its place; the flow is cut' },
  { n: 13, zh: '同人', en: 'Fellowship', g: '火向天上，同行者不孤', ge: 'fire rising to heaven; the like-minded are not alone' },
  { n: 14, zh: '大有', en: 'Great Possession', g: '有而不私，大有乃存', ge: 'possessing without hoarding keeps the holding great' },
  { n: 15, zh: '谦', en: 'Modesty', g: '山藏于地，愈低愈高', ge: 'a mountain hides in the plain; the lower, the higher' },
  { n: 16, zh: '豫', en: 'Enthusiasm', g: '雷出地奋，先声夺人', ge: 'thunder leaves the earth — the drum before the march' },
  { n: 17, zh: '随', en: 'Following', g: '随时而动，不失其时', ge: 'move with the hour; lose no hour' },
  { n: 18, zh: '蛊', en: 'Work on the Decayed', g: '皿中生虫，乱需整饬', ge: 'worms in the bowl — disorder calls for ordering' },
  { n: 19, zh: '临', en: 'Approach', g: '泽上有地，居高而临下', ge: 'ground above the lake — nearness from above' },
  { n: 20, zh: '观', en: 'Contemplation', g: '风行地上，观我生进退', ge: 'wind over the land: watch, then act' },
  { n: 21, zh: '噬嗑', en: 'Biting Through', g: '咬去梗塞，路才通', ge: 'bite through the obstruction; the road opens' },
  { n: 22, zh: '贲', en: 'Grace', g: '山下有火，文饰有度', ge: 'fire under the mountain — adornment with measure' },
  { n: 23, zh: '剥', en: 'Splitting Apart', g: '剥极而复，床足渐蚀', ge: 'stripping to the bone — and then, the return' },
  { n: 24, zh: '复', en: 'Return', g: '一阳来复，冬至之心', ge: 'one yang returns — the heart of midwinter' },
  { n: 25, zh: '无妄', en: 'Innocence', g: '循律而行，不妄为', ge: 'move within law; nothing forced' },
  { n: 26, zh: '大畜', en: 'Great Taming', g: '山中藏天，厚积待发', ge: 'heaven inside the mountain — vast reserve, awaiting' },
  { n: 27, zh: '颐', en: 'Nourishment', g: '颐养之道，观其所养', ge: 'watch what you feed; it feeds you back' },
  { n: 28, zh: '大过', en: 'Great Excess', g: '栋桡之危，非常之时行非常之事', ge: 'the ridgepole bends — extraordinary times, extraordinary acts' },
  { n: 29, zh: '坎', en: 'The Abysmal', g: '重险相叠，惟诚可渡', ge: 'danger upon danger; sincerity is the boat' },
  { n: 30, zh: '离', en: 'Radiance', g: '火附于物而明，明需所附', ge: 'flame clings to burn — brightness needs something to cling to' },
  { n: 31, zh: '咸', en: 'Influence', g: '二气感应，寂然不动，感而遂通', ge: 'two breaths answer each other; still, yet stirred' },
  { n: 32, zh: '恒', en: 'Duration', g: '雷风相与，长久之道', ge: 'thunder and wind together — the way of lasting' },
  { n: 33, zh: '遯', en: 'Retreat', g: '远小人，非逃，是全', ge: 'withdrawing is not fleeing; it is keeping whole' },
  { n: 34, zh: '大壮', en: 'Great Power', g: '壮而以正，羊触藩则困', ge: 'strength with measure — the ram that charges is stuck' },
  { n: 35, zh: '晋', en: 'Progress', g: '明出地上，进而向光', ge: 'sun above the land — advance toward light' },
  { n: 36, zh: '明夷', en: 'Darkening of the Light', g: '明入地中，晦而转', ge: 'light enters the earth; in darkness, turn inward' },
  { n: 37, zh: '家人', en: 'The Family', g: '火燃风生，各正其位', ge: 'fire fed by wind — each in the right place' },
  { n: 38, zh: '睽', en: 'Opposition', g: '二女同居，志不同行', ge: 'under one roof, opposite aims — difference is data' },
  { n: 39, zh: '蹇', en: 'Obstruction', g: '前有险，止于当止', ge: 'danger ahead — stopping is also moving' },
  { n: 40, zh: '解', en: 'Deliverance', g: '雷雨作，结自解', ge: 'the thunderstorm breaks; knots untie themselves' },
  { n: 41, zh: '损', en: 'Decrease', g: '损下益上，损中有得', ge: 'lessen to strengthen — loss is a door' },
  { n: 42, zh: '益', en: 'Increase', g: '风雷相益，与时偕行', ge: 'wind and thunder aid each other; increase rides the moment' },
  { n: 43, zh: '夬', en: 'Breakthrough', g: '决而去之，刚决柔', ge: 'the dam gives — the firm resolves the soft' },
  { n: 44, zh: '姤', en: 'Coming to Meet', g: '一阴始生，遇合之初', ge: 'one yin arrives — the first meeting' },
  { n: 45, zh: '萃', en: 'Gathering', g: '泽上于地，聚以成祀', ge: 'water gathering on earth — assembly, and its meaning' },
  { n: 46, zh: '升', en: 'Pushing Upward', g: '木生地中，日长日高', ge: 'a tree inside the soil, taller every day' },
  { n: 47, zh: '困', en: 'Oppression', g: '泽无水，困而不失其亨', ge: 'the lake drained — even trapped, the through-line holds' },
  { n: 48, zh: '井', en: 'The Well', g: '井养不穷，迁邑不改井', ge: 'the well is never emptied; move the town, the well stays' },
  { n: 49, zh: '革', en: 'Revolution', g: '泽中有火，革而信之', ge: 'fire in the lake — change, and trust it' },
  { n: 50, zh: '鼎', en: 'The Cauldron', g: '木火成烹饪，养贤之器', ge: 'wood feeds fire in the vessel — the pot that nourishes' },
  { n: 51, zh: '震', en: 'Arousing', g: '雷惊百里，惧者不丧匕鬯', ge: 'thunder for a hundred li — the composed keep their cup' },
  { n: 52, zh: '艮', en: 'Keeping Still', g: '两山相重，止于所当止', ge: 'mountain on mountain — stop where stopping is right' },
  { n: 53, zh: '渐', en: 'Development', g: '山上有木，渐进不跃', ge: 'trees on the mountain — growing by degrees, not leaps' },
  { n: 54, zh: '归妹', en: 'The Marrying Maiden', g: '位不当则戒', ge: 'out of place, even joy misfires — know your station' },
  { n: 55, zh: '丰', en: 'Abundance', g: '明动相资，盛大宜日中', ge: 'brightness and motion together — peak at noon' },
  { n: 56, zh: '旅', en: 'The Wanderer', g: '山上有火，行而不居', ge: 'fire on the mountain — travel, do not dwell' },
  { n: 57, zh: '巽', en: 'Gentleness', g: '随风入物，柔而愈入', ge: 'wind entering all things — soft, therefore deep' },
  { n: 58, zh: '兑', en: 'Joyousness', g: '丽泽相滋，说而不谄', ge: 'two lakes feeding each other — joy without flattery' },
  { n: 59, zh: '涣', en: 'Dispersion', g: '风行水上，涣然冰释', ge: 'wind over water — the ice dissolves' },
  { n: 60, zh: '节', en: 'Limitation', g: '泽上有水，节以制度', ge: 'water held by banks — limit as form' },
  { n: 61, zh: '中孚', en: 'Inner Truth', g: '泽上有风，感于中诚', ge: 'wind on the lake — moved by inner sincerity' },
  { n: 62, zh: '小过', en: 'Small Excess', g: '飞鸟遗音，宜下不宜上', ge: 'the bird\'s fading cry — better low than high' },
  { n: 63, zh: '既济', en: 'After Completion', g: '水在火上，功成而思患', ge: 'water over fire, done — now guard it' },
  { n: 64, zh: '未济', en: 'Before Completion', g: '火在水上，未济而有无穷', ge: 'fire over water, unfinished — and so, infinite' },
];

/* three coins, six throws → lines bottom-up; 6 old-yin 7 yang 8 yin 9 old-yang */
export function cast(rng = Math.random) {
  const lines = [], changing = [];
  for (let i = 0; i < 6; i++) {
    const sum = (rng() < .5 ? 3 : 2) + (rng() < .5 ? 3 : 2) + (rng() < .5 ? 3 : 2);
    lines.push(sum);
    if (sum === 6 || sum === 9) changing.push(i);
  }
  const hex = HEX[kingWen(lines) - 1];
  let next = null;
  if (changing.length) {
    const flipped = lines.map(v => (v === 6 ? 7 : v === 9 ? 8 : v));
    next = HEX[kingWen(flipped) - 1];
  }
  return { lines, changing, hex, next };
}

export function seedFrom(lines) {
  let h = 2166136261;
  for (const v of lines) { h ^= v + 6; h = Math.imul(h, 16777619); }
  return h >>> 0;
}
