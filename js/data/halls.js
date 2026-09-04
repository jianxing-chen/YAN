/* 衍 · the register of halls — 殿图
   Words (道) live here; mechanisms (器) live in the exhibit modules. */

export const HALLS = [
  {
    id: 'chaos', zh: '混沌殿', en: 'HALL OF CHAOS',
    epigraph: { zh: '一切秩序之前，先有对初值的敏感。', en: 'Before all order, sensitivity to the initial condition.' },
    exhibits: [
      { id: 'lorenz', title: { zh: '洛伦兹吸引子', en: 'The Lorenz Attractor' }, subtitle: { zh: '同源的两条轨迹，终将分道扬镳', en: 'two twins of one trajectory, forever diverging' }, hint: { zh: '拖动旋转 · 滚轮缩放', en: 'drag to orbit · wheel to zoom' } },
      { id: 'pendulum', title: { zh: '双摆', en: 'The Double Pendulum' }, subtitle: { zh: '确定律法下的不可预言', en: 'the unpredictable, under perfect law' }, hint: { zh: '拖动摆锤，掷出新的命运', en: 'drag the bob to cast a new fate' } },
      { id: 'henon', title: { zh: '埃农映射', en: 'The Hénon Map' }, subtitle: { zh: '折叠，拉伸，再折叠', en: 'fold, stretch, fold again' }, hint: { zh: '滚轮调参数 a', en: 'wheel tunes parameter a' } },
      { id: 'bifurcation', title: { zh: '倍分岔图', en: 'The Bifurcation Diagram' }, subtitle: { zh: '一条种群之河的泛滥与安分', en: 'a river of populations, flooding and calming' }, hint: { zh: '横向拖动细读 r', en: 'drag across the map to read r' } },
    ],
  },
  {
    id: 'fractal', zh: '分形殿', en: 'HALL OF FRACTALS',
    epigraph: { zh: '无限不在远处，它在每一寸里折叠。', en: 'Infinity is not far away; it is folded into every inch.' },
    exhibits: [
      { id: 'mandelbrot', title: { zh: '曼德博深潜', en: 'The Mandelbrot Dive' }, subtitle: { zh: '一粒公式里的全部海岸线', en: 'every coastline inside one formula' }, hint: { zh: '滚轮潜入深处 · R 回到海面', en: 'wheel to dive · R to surface' } },
      { id: 'julia', title: { zh: '朱利亚之眼', en: 'The Julia Eye' }, subtitle: { zh: '参数 c 的表情变化', en: 'the changing moods of a constant' }, hint: { zh: '点击画布，重选 c', en: 'click to choose a new c' } },
      { id: 'newton', title: { zh: '牛顿花园', en: 'The Newton Garden' }, subtitle: { zh: '三个根的领土之争', en: 'three roots contest a territory' }, hint: { zh: '滑动松弛度 ω', en: 'slide the relaxation ω' } },
      { id: 'apollonian', title: { zh: '阿波罗尼奥斯之垫', en: 'The Apollonian Gasket' }, subtitle: { zh: '圆与圆之间，永远还有一个圆', en: 'between any circles, always one more' }, hint: { zh: '点击任一圆进入其内部', en: 'click a circle to enter it' } },
    ],
  },
  {
    id: 'emergence', zh: '涌现殿', en: 'HALL OF EMERGENCE',
    epigraph: { zh: '没有一滴水打算成浪，没有一只蚂蚁认识巢形。', en: 'No drop intends the wave; no ant knows the mound.' },
    exhibits: [
      { id: 'life', title: { zh: '康威生命游戏', en: "Conway's Game of Life" }, subtitle: { zh: '三条律法里的众生', en: 'a cosmos of three laws' }, hint: { zh: '在暗处点画，播下生命', en: 'draw in the dark to sow life' } },
      { id: 'lenia', title: { zh: '连续生命', en: 'Lenia' }, subtitle: { zh: '会呼吸的光之生物', en: 'creatures made of breathing light' }, hint: { zh: '点击注入一团原生质', en: 'click to inject protoplasm' } },
      { id: 'particle-life', title: { zh: '粒子生命', en: 'Particle Life' }, subtitle: { zh: '六族粒子的爱与恨', en: 'six tribes, an asymmetric heart' }, hint: { zh: '滚轮重掷族谱', en: 'wheel to recast the tribes' } },
      { id: 'boids', title: { zh: '群鸟', en: 'Boids' }, subtitle: { zh: '没有领袖的飞翔', en: 'flight without a leader' }, hint: { zh: '移动指针，扮演捕食者', en: 'move to play the predator' } },
      { id: 'sandpile', title: { zh: '阿贝尔砂堆', en: 'The Abelian Sandpile' }, subtitle: { zh: '每一粒砂都记得自己的位置', en: 'every grain remembers its place' }, hint: { zh: '点击投下砂粒', en: 'click to drop grains' } },
    ],
  },
  {
    id: 'waves', zh: '波浪殿', en: 'HALL OF WAVES',
    epigraph: { zh: '世界不由物组成，而由振动组成。', en: 'The world is not made of things but of vibrations.' },
    exhibits: [
      { id: 'doubleslit', title: { zh: '双缝之影', en: 'The Double Slit' }, subtitle: { zh: '一粒光如何同时穿过两扇门', en: 'how one light passes two doors at once' }, hint: { zh: '滚轮改波长 · 拖动移缝', en: 'wheel for wavelength · drag the barrier' } },
      { id: 'chladni', title: { zh: '克拉尼之盘', en: 'The Chladni Plate' }, subtitle: { zh: '砂粒走向寂静之处', en: 'sand walks to where the sound is silent' }, hint: { zh: '调 m 与 n，看砂重排', en: 'tune m and n, watch the sand rearrange' } },
      { id: 'fourier', title: { zh: '傅里叶之轮', en: 'The Fourier Wheels' }, subtitle: { zh: '任何形状都是圆的合奏', en: 'every shape is a chord of circles' }, hint: { zh: '在左半幅画出你的一笔', en: 'draw your own stroke on the left half' } },
      { id: 'harmonograph', title: { zh: '谐振记录仪', en: 'The Harmonograph' }, subtitle: { zh: '两支摆锤的最后一支舞', en: 'the last dance of two pendulums' }, hint: { zh: '滚轮微调频率之比', en: 'wheel to tune the frequency ratio' } },
    ],
  },
  {
    id: 'growth', zh: '生长殿', en: 'HALL OF GROWTH',
    epigraph: { zh: '形式不是被设计的，是被时间煮出来的。', en: 'Form is not designed; it is cooked by time.' },
    exhibits: [
      { id: 'turing', title: { zh: '图灵斑图', en: "Turing's Patterns" }, subtitle: { zh: '形态发生素的化学之舞', en: 'the chemical dance of morphogens' }, hint: { zh: '点击注入颜料 · 九种典藏形态', en: 'click to inject pigment · nine curated morphs' } },
      { id: 'phyllotaxis', title: { zh: '叶序之螺', en: 'The Phyllotaxis Spiral' }, subtitle: { zh: '黄金角 137.5° 的天赋', en: 'the gift of the golden angle' }, hint: { zh: '滑动偏离角，看秩序瓦解与重生', en: 'slide the divergence, watch order break and heal' } },
      { id: 'lsystem', title: { zh: '文法花园', en: 'The Grammatical Garden' }, subtitle: { zh: '三个字母长成一片森林', en: 'three letters grow a forest' }, hint: { zh: '选择文法，看它生长', en: 'choose a grammar and watch it grow' } },
      { id: 'wilson', title: { zh: '威尔逊迷宫', en: "Wilson's Maze" }, subtitle: { zh: '随机游走抹去自身的环', en: 'a random walk erasing its own loops' }, hint: { zh: '什么都不必做，看它完成自己', en: 'do nothing; watch it complete itself' } },
      { id: 'dla', title: { zh: '扩散限制凝聚', en: 'Diffusion-Limited Aggregation' }, subtitle: { zh: '深海珊瑚由偶然凝结', en: 'deep-sea coral, condensed from chance' }, hint: { zh: '滚轮调整生长偏食', en: 'wheel to tune the sticking bias' } },
    ],
  },
  {
    id: 'cosmos', zh: '天穹殿', en: 'HALL OF THE HEAVENS',
    epigraph: { zh: '引力是最古老的雕塑家。', en: 'Gravity is the oldest sculptor.' },
    exhibits: [
      { id: 'galaxies', title: { zh: '星之碰撞', en: 'The Collision of Galaxies' }, subtitle: { zh: '潮汐尾是宇宙的笔迹', en: 'tidal tails, the universe\'s handwriting' }, hint: { zh: '滚轮调节暗物质晕', en: 'wheel to tune the dark halo' } },
      { id: 'threebody', title: { zh: '三体', en: 'The Three-Body Problem' }, subtitle: { zh: '三只太阳没有日历', en: 'three suns keep no calendar' }, hint: { zh: '拖动投掷新的命运', en: 'drag to cast a new fate' } },
      { id: 'cosmicweb', title: { zh: '宇宙之网', en: 'The Cosmic Web' }, subtitle: { zh: '从均匀到丝缕的一百四十亿年', en: 'fourteen billion years, uniform to filament' }, hint: { zh: '滚轮快进与倒转时间', en: 'wheel to run time forward and back' } },
      { id: 'resonance', title: { zh: '轨道之诗', en: 'The Poetry of Orbits' }, subtitle: { zh: 'p:q 共振画出的蔷薇', en: 'roses drawn by p:q resonance' }, hint: { zh: '选择不同的共振比', en: 'choose another resonance' } },
    ],
  },
  {
    id: 'mind', zh: '心智殿', en: 'HALL OF MIND',
    epigraph: { zh: '你看到的一切，正在被你看到。', en: 'Everything you see is being seen by you.' },
    exhibits: [
      { id: 'perceptron', title: { zh: '感知机花园', en: 'The Perceptron Garden' }, subtitle: { zh: '一颗心灵学习画下边界', en: 'a mind learning to draw the line' }, hint: { zh: '点击左/右半幅种下两类样本', en: 'click left/right half to plant two classes' } },
      { id: 'wireworld', title: { zh: '线世界', en: 'Wireworld' }, subtitle: { zh: '电子在四态中奔跑', en: 'electrons run through four states' }, hint: { zh: '点击切换细胞 · 律面板改变笔', en: 'click cells · pick a brush in 律' } },
      { id: 'ca110', title: { zh: '元胞巡礼', en: 'The Cellular Pilgrimage' }, subtitle: { zh: '二百五十六条律法的天空', en: 'two hundred and fifty-six skies' }, hint: { zh: '点击八位律法开关', en: 'toggle the eight bits of law' } },
    ],
  },
];

export const hallById = id => HALLS.find(h => h.id === id);

export function flatExhibits() {
  const out = [];
  for (const h of HALLS) for (const e of h.exhibits) out.push({ hall: h, exhibit: e });
  return out;
}

export function neighbors(hallId, exId) {
  const flat = flatExhibits();
  const i = flat.findIndex(f => f.hall.id === hallId && f.exhibit.id === exId);
  if (i < 0) return { prev: flat[flat.length - 1], next: flat[0], index: 0 };
  return {
    prev: flat[(i - 1 + flat.length) % flat.length],
    next: flat[(i + 1) % flat.length],
    index: i,
  };
}

const CN_NUM = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export const cnNum = n => (n <= 10 ? CN_NUM[n] : n > 10 && n < 20 ? '十' + CN_NUM[n - 10] : String(n));
