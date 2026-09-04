/* 衍 · 生长殿 essays */
export default {
  _hall: {
    zh: [
      '形式不是被设计的，是被时间煮出来的。一粒种子不懂得叶的排列，一枚胚胎不认识自己的手指——它们只是让化学与几何慢慢起作用。此殿陈列「等待」的成果。',
    ],
    en: [
      'Form is not designed; it is cooked by time. A seed does not understand phyllotaxis; an embryo has never seen a finger. They merely let chemistry and geometry do their slow work. This hall exhibits what waiting produces.',
    ],
  },

  turing: {
    zh: [
      '一九五二年，图灵问了一个不像数学家问的问题：一颗均匀的胚胎，怎么知道自己该在哪里长出斑纹？他的答案：两种化学物质相互反应又相互扩散，均匀态失稳，纹样自发浮现。他没活着看到验证——十年后，生物学家在真兽的皮毛上找到了他的方程。',
      '此窗即 Gray–Scott 反应：吃颜料的 U，催化它自身与 V 的转化。拖动参数，你在选择一个物种的皮毛：豹点、珊瑚、指纹、迷宫。同一对反应物，万千种皮——形态的多样性不藏在基因里，藏在参数的地理里。',
      '点击注入颜料。斑纹会愈合、竞争、遗忘你的痕迹。',
    ],
    en: [
      'In 1952 Turing asked a most unmathematical question: how does a uniform embryo know where to put its stripes? His answer — two chemicals reacting and diffusing — destabilizes uniformity, and pattern pours out on its own. He did not live to see it confirmed; a decade later biologists found his equations in real skins.',
      'This window runs Gray–Scott. Slide the parameters and you choose a creature\'s coat: leopard, coral, fingerprint, maze. The variety of form is not hidden in genes but in the geography of parameters.',
      'Click to inject pigment. The pattern heals, competes, and forgets you.',
    ],
  },

  phyllotaxis: {
    zh: [
      '向日葵的每一粒籽都长在前一粒旋转 137.5° 的位置——黄金角，最难用有理数逼近的角度。后果是：相邻的籽永不相叠，也永不留缝，阳光的分配达到无刻意的公平。',
      '滑动偏离角，看秩序瓦解：137° 是螺旋，135° 是整齐的射线臂，其余角度是杂乱的星团。植物没有学过数论——它们只是逐个长出，而数论早已等在那里。',
    ],
    en: [
      'Each sunflower seed sits 137.5° around from the last — the golden angle, the angle hardest to approximate by fractions. The consequence: no seed shadows another, none leaves a gap, and sunlight is shared without anyone intending it.',
      'Slide the divergence and watch order shatter: 137° makes spirals, 135° makes spokes, the rest make chaos. Plants never studied number theory — they simply grew one seed at a time, and number theory was already waiting.',
    ],
  },

  lsystem: {
    zh: [
      '一九六八年，生物学家 Lindenmayer 用三个字母描述藻类的生长：F 前进，[ 入枝，] 出枝；一条改写规则，一代代重写。几个字符，长成整片森林。',
      '文法花园是「描述即生长」的证明：这里的树没有画过一笔——它们是被「念」出来的。基因组再短，只要带上递归，就能长出无限的分形侧影。',
    ],
    en: [
      'In 1968 the biologist Lindenmayer described algae growth with three letters: F advance, [ branch, ] unbranch; one rewriting rule, applied generation after generation. A few characters, a whole forest.',
      'The grammatical garden proves that description can be growth: not one line of these trees was drawn — they were recited. A genome however short, given recursion, grows an infinite silhouette.',
    ],
  },

  wilson: {
    zh: [
      '威尔逊算法生成迷宫的方式令人不安：让一个醉汉在格子里随机游走，走成环就抹去环，直到踏遍每一格。留下的一笔贯通的线，是「均匀生成树」——所有迷宫等可能，无一偏好。',
      '此窗无事可做，这正是要点。你可以看一粒彻底的随机如何在规则下走向完备：没有设计，没有目标，结束时每一条走廊都既是偶然又是必然。完工的一瞬，它会安静地重新开始。',
    ],
    en: [
      'Wilson\'s algorithm builds a maze in a disturbing way: send a drunkard walking at random, erase his loops, and continue until every cell is visited. What remains is a uniform spanning tree — all mazes equally likely, none preferred.',
      'There is nothing to do here, and that is the point. Watch pure randomness become completeness under rule: no design, no goal, and at the end every corridor is both accident and necessity. On completion it quietly begins again.',
    ],
  },

  dla: {
    zh: [
      '让粒子在水中布朗运动，碰到已凝成的核就停下——如此简单的「黏住即留」，长出的是深海珊瑚般的分形枝。没有哪个粒子选择了自己的位置；每个位置都是千万次错身之后的第一次相遇。',
      '枝为什么这么细？因为在 DLA 的世界里，外枝先到者屏蔽了后来者——增长的几何学是不平等的几何学。殿允许你调整「黏性」：越难黏，枝越密；越易黏，世界越尖锐。',
    ],
    en: [
      'Let particles wander by Brownian motion until they touch the frozen core and stick — from so simple a law grows deep-sea coral. No particle chose its position; each position is a first meeting after ten thousand near misses.',
      'Why are the branches so thin? Whoever reaches outward first shadows all who follow — growth geometry is the geometry of inequality. Tune the stickiness: the harder to stick, the denser the bloom; the easier, the sharper the world.',
    ],
  },
};
