/* 衍 · 分形殿 essays */
export default {
  _hall: {
    zh: [
      '海岸线有多长？曼德博答：取决于你的尺子有多短。尺子越短，海岸越长，直至无限——而面积却有限。无限折叠在有限之中，这就是分形的定义。',
    ],
    en: [
      'How long is a coastline? Mandelbrot answered: it depends on the length of your ruler. The shorter the ruler, the longer the coast, without limit — within a finite area. Infinity folded into the finite: that is a fractal.',
    ],
  },

  mandelbrot: {
    zh: [
      'z → z² + c。一个复数、一次乘法、一次加法——没有比这更简单的律法了。然而它画出了数学史上被放大次数最多的边界：简化到极致，复杂到无尽。',
      '沿边界潜入任何一处：海马谷、象群谷、三旋谷——每一个新的数量级里都藏着新的风景，并且每一处都藏着一个完整的小曼德博，像自相似的海螺。悬浮的色相由殿的昼夜之弧供给。',
      '殿中此窗受浮点所限，最深约两万倍——这是诚实的极限。无限不被展示，只被暗示：你永远到不了边界，边界永远在你的下一个数量级里。',
    ],
    en: [
      'z → z² + c. One complex number, one multiplication, one addition — no law could be simpler. Yet it draws the most magnified boundary in the history of mathematics: maximal simplicity, endless complexity.',
      'Dive anywhere along the rim — Seahorse Valley, Elephant Valley, triple spirals — each order of magnitude hides new scenery, and each hides an entire smaller Mandelbrot, like self-similar shells.',
      'This window is honestly limited by floating point to a dive of some twenty-thousand-fold. Infinity is not displayed; it is implied. You never reach the boundary — it waits in your next order of magnitude.',
    ],
  },

  julia: {
    zh: [
      '曼德博是目录，朱利亚是词条。每个复数 c 都对应一个朱利亚集合：c 在曼德博内部，集合连通如雾；c 落在外部，集合碎成尘埃。一个图集收尽了另一个的所有章节。',
      '点画布，重选 c——你拨动的是那条参数之河。河的此岸是完整的雾，彼岸是飞散的星；河岸本身，正是曼德博的边界。',
    ],
    en: [
      'The Mandelbrot set is a table of contents; every Julia set is one entry. For each constant c the Julia set is either connected like mist or shattered into dust — and the frontier between the two is the Mandelbrot boundary itself.',
      'Click to choose a new c. You are wading in the parameter river: mist on one bank, flying dust on the other, and the water\'s edge is the Mandelbrot set.',
    ],
  },

  newton: {
    zh: [
      '牛顿迭代法解 z³ = 1：从任意一点出发，沿切线跳水，多数人几步之内到达一个根。但「多数人属于哪个根」的边界，是无理的火花状——没有一条平滑的分界线。',
      '三个根三分天下，却三分不出一条直线。把松弛度 ω 从 1 拨开，领土地图开始扭曲、翻卷、生出触须——数值方法的一次小改动，让整个复平面换了地质年代。',
    ],
    en: [
      'Newton\'s method solving z³ = 1: start anywhere, dive along tangents, and most points reach a root within a few steps. But which root claims you is decided by a spark-shaped border no line can smooth.',
      'Loosen the relaxation ω and the map of territories begins to twist and grow tendrils — one small change of method, and the whole complex plane enters a new geological age.',
    ],
  },

  apollonian: {
    zh: [
      '三个相切的圆之间，恰好还能放进一个与之皆切的第四圆——阿波罗尼奥斯在公元前三世纪就算出了它的大小。放进之后，缝隙里还有缝隙，圆里生圆，直到无限。',
      '这不是密铺，是挤让：每个圆的存在都由邻圆的相切定义，没有一个是被安排的。残余的缝隙总面积趋于零，而缝隙的个数趋于无穷——有限与无限在此握手言和。',
      '点击任何一个圆，进入它的内部——那里有另一整座垫子。',
    ],
    en: [
      'Between three mutually tangent circles there is room for exactly one more tangent to all three — Apollonius computed it in the third century BC. Place it, and every gap contains further gaps, circles begetting circles, without end.',
      'Nothing here is arranged; each circle exists because its neighbors touch. The leftover area tends to zero while the number of gaps tends to infinity — the finite and the infinite shaking hands.',
      'Click any circle to enter it. Inside, another entire gasket.',
    ],
  },
};
