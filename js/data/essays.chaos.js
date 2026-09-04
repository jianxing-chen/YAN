/* 衍 · 混沌殿 essays */
export default {
  _hall: {
    zh: [
      '混沌不是无序。混沌是「太诚实的秩序」——系统一丝不苟地服从定律，只因对初值敏感到极致，而变得不可预言。定律与预言在此分家：我们写得出方程，却算不出下周的天气。',
    ],
    en: [
      'Chaos is not disorder. It is order that is too honest — a system obeying its laws perfectly, yet unpredictable because it is exquisitely sensitive to where it began.',
    ],
  },

  lorenz: {
    zh: [
      '一九六三年，气象学家洛伦兹把大气浓缩成三条方程：对流强度、温差、垂直温度分布。x、y、z 三个数在空间里画出双翼——人们后来叫它蝴蝶。蝴蝶不是他画的，是方程自己飞出来的。',
      '殿中放飞了两只几乎相同的轨迹：初值只差万分之一。起初它们形影不离，随后分歧指数增长，各赴 attractor 的另一翼。这就是「蝴蝶效应」的本义：不是蝴蝶引起风暴，而是任何有限的观测，终有测不准的那一天。',
      '吸引子是所有未来的集合。轨迹永不自交、永不逃逸、永不重复——它就是「衍」的形状：被定律束缚的无限。',
    ],
    en: [
      'In 1963 Edward Lorenz condensed the atmosphere into three equations. The variables draw two wings of a butterfly — a shape no one designed; the equations simply flew there.',
      'Two trajectories are released, differing by one part in ten thousand. They embrace briefly, then diverge exponentially toward opposite wings. The butterfly effect is not that a butterfly causes storms — it is that every finite measurement eventually meets its horizon.',
      'The attractor is the set of all futures: never crossing itself, never escaping, never repeating. Law-bound infinity — the shape of yán.',
    ],
  },

  pendulum: {
    zh: [
      '双摆的每一步都由牛顿定律精确决定，没有任何随机数参与。然而把五只摆的初角错开万分之一，几秒之内它们便各自天涯。决定论与可预言性，在此悄然分手。',
      '拉住摆锤，掷出新的初始条件——你在做的事情，正是上帝在宇宙开厂那天做的事情：只定初值，然后退后。留下的墨迹是相空间的书法，每一笔都合法，无一笔可测。',
    ],
    en: [
      'Every step of a double pendulum is fixed by Newton\'s laws; no dice are thrown. Nudge five copies apart by one part in ten thousand and within seconds they are strangers. Determinism and predictability quietly part ways here.',
      'Grab a bob and throw a new beginning — you are doing what was done on the first morning of the universe: setting initial conditions, then stepping back.',
    ],
  },

  henon: {
    zh: [
      '一九七六年，埃农寻找一个最简的「洛伦兹切片」。他得到两个代数式：新位置的 x 由旧 y 而来，新 y 还要减去旧的 x。翻译过来只有两个动作：拉伸，折叠。',
      '拉伸使邻近者分离（混沌之源），折叠使逃逸者归返（吸引子之源）。一张无穷薄的面团，被反复擀折——每一层都保留着上一层的褶皱。你看到的尘埃带，其实是一条被折了无穷次的曲线：维数介于线与面之间，约 1.26。',
    ],
    en: [
      'In 1976 Michel Hénon sought the simplest possible slice of Lorenz-like flow and found two algebraic lines — which translate to just two gestures: stretch, and fold.',
      'Stretching separates neighbors (the seed of chaos); folding recalls the fugitives (the making of an attractor). What looks like dust is one curve folded infinitely often — a dimension between line and surface, near 1.26.',
    ],
  },

  bifurcation: {
    zh: [
      '取一个最简单的种群模型：明年数量 = r × 今年数量 ×（1 − 今年数量）。一个参数 r，一个变量 x。梅在一九七六年写道：如此简单的方程，也未必安分。',
      'r 小于三时，种群归于一个定数；r 越过三，定数裂为二、四、八……裂痕的间距按 4.669… 倍收缩——费根鲍姆常数，全世界的「裂变」共用这一个数。r≈3.57 处，周期彻底粉碎为混沌；而混沌深处仍有秩序之窗（3.83 附近的周期三）——秩序是岛，混沌是海，海里还有岛。',
      '横向拖动，细读 r 的每一寸。所有复杂的地貌，都长在一条抛物线上。',
    ],
    en: [
      'Take the simplest population model: next year = r × this year × (1 − this year). One parameter, one variable. Robert May\'s 1976 warning: simple equations need not behave.',
      'Past r = 3 the fixed point splits into two, four, eight — the splitting intervals shrink by Feigenbaum\'s universal 4.669. At r ≈ 3.57 periodicity shatters; yet inside the chaos sit windows of order. Islands in the sea, seas in the islands.',
      'Drag across the map. The entire landscape of complexity grows on one parabola.',
    ],
  },
};
