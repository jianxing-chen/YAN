/* 衍 · 涌现殿 essays */
export default {
  _hall: {
    zh: [
      '没有一滴水打算成浪，没有一只蚂蚁认识巢形，没有一个神经元写下了这首诗。涌现是：简律的大量重复之下，高层次的新事物不请自来。它不是被发明的，是被放出来的。',
    ],
    en: [
      'No drop intends the wave; no ant knows the mound; no neuron wrote this line. Emergence is the arrival of higher-level things uninvited, from masses of simple rule-following. Not invented — released.',
    ],
  },

  life: {
    zh: [
      '一九七〇年，康威在围棋盘上设计了三条律法：活格少于两个邻居则死于孤独，多于三个则死于拥挤，恰有三个空邻居则诞生。没有第四条。半个多世纪后，人们仍在同一张棋盘上发现新的物种。',
      '滑翔机是此界的第一件信物：五个格子，一代代翻涌，却整体斜行不倦——「动」不是任何一格的属性，是格局的属性。生命游戏后来被证明是图灵完备的：在它的棋盘上，人们造出了计数器、打字机，乃至一台完整计算机。换言之：这套比算盘还简单的规则，可以计算任何可计算之物。',
      '在暗处点画，播下你的种子。你会看到：此地从不预言，只 obey。',
    ],
    en: [
      'In 1970 Conway drew three laws on a Go board: die of loneliness below two neighbors, die of crowding above three, be born on exactly three. There is no fourth law. Half a century later, new species are still being found on the same board.',
      'The glider was the first treaty gift: five cells churning generation after generation, yet traveling as one. Motion is not a property of any cell — it is a property of the pattern. Life was later proven Turing-complete: counters, typewriters, even a whole computer have been built on this board.',
      'Draw in the dark. This place never predicts; it only obeys.',
    ],
  },

  lenia: {
    zh: [
      '康威的生命是一格一跳的突变；Lenia 把它连续化：状态取 0 到 1 之间的实数，邻域是一枚光滑的环形核，更新是一段呼吸般的映射。于是生命不再是像素的明灭，而是光的涨落。',
      '这些光之生物没有基因、没有目的、没有程序员。它们滑行、吞并、分裂、死去——每一次形态都被邻域实时地重新计算出来，像烛火被空气实时地重新决定。点击注一团原生质，看它学会游泳。',
      '若殿中一片死寂，请再播种。此地无常住民，只有反复到访的过客——这本身即是展品的一部分。',
    ],
    en: [
      'Conway\'s life jumps; Lenia makes it continuous — states between 0 and 1, a smooth ring-shaped neighborhood, an update like breathing. Life stops being flickering pixels and becomes the rise and fall of light.',
      'These creatures have no genome, no purpose, no programmer. They glide, swallow, split, and die — every shape recomputed in real time by the neighborhood, the way a candle is recomputed by the air. Inject protoplasm and watch it learn to swim.',
      'If the chamber falls silent, sow again. There are no residents here, only returning guests — and that, too, is part of the exhibit.',
    ],
  },

  'particle-life': {
    zh: [
      '六族粒子，一张 6×6 的「好感矩阵」：A 族是否亲近 B 族，与 B 族是否亲近 A 族毫无关系——这份不对称，就是此界的全部化学。',
      '没有键、没有模板、没有蓝图。只有引力与斥力在此消彼长，粒子们自发结成细胞状、膜状、捕食链状的形态，并且——真正的奇迹——这些形态会移动、修复、竞争。一个反对称的好感表，长出了「社会」。',
      '滚轮重掷族谱：另一张矩阵，就是另一种生物学。',
    ],
    en: [
      'Six tribes and a 6×6 table of affinities: whether tribe A is drawn to tribe B has nothing to do with whether B is drawn to A. That asymmetry is this world\'s entire chemistry.',
      'No bonds, no templates, no blueprint — only attraction and repulsion trading favors, and yet particles assemble themselves into cells, membranes, predator-prey shapes that move and mend. An asymmetric table of likes grew something like a society.',
      'Turn the wheel to recast the tribes: another matrix, another biology.',
    ],
  },

  boids: {
    zh: [
      '一九八七年，Reynolds 只用三条律法就造出了鸟群：与邻者保持同向、靠近群心、避开过近者。没有头鸟，没有编制，没有指令。转瞬即成的群体转向，是几千次局部商议的同时发生。',
      '把指针伸进鸟群——你现在是鹰。惊散的波澜会以涟漪传播、愈合、忘却。群体没有记忆，个体只有邻居；然而「群」这个名词，所指的既不是这只鸟，也不是那只。',
    ],
    en: [
      'In 1987 Reynolds raised a flock from three rules: steer with your neighbors, toward the group, away from the too-close. No lead bird, no roster, no orders. The flock\'s instant turns are thousands of local negotiations happening at once.',
      'Put your hand into the flock — you are the hawk now. The panic ripples outward, heals, is forgotten. The flock has no memory; each bird has only neighbors. And yet the noun "flock" refers to neither this bird nor that one.',
    ],
  },

  sandpile: {
    zh: [
      '往桌心持续落砂。砂堆长高，直到某粒砂触发一场雪崩——雪崩有大有小，大小服从幂律：小崩无数，巨崩罕见，中间没有特征尺度。巴克等人在一九八七年称之为「自组织临界」：系统自己走到悬崖边上，然后停在悬崖边上。',
      '此堆有一条群岛的律法：落砂次序无关紧要——先落一亿粒再落一粒，与逐粒而落，终局之形分毫不差。数学家说，这是阿贝尔群的单位元在此显形。物理学家说，这是守恒与耗散的合谋。诗人说：砂记得。',
    ],
    en: [
      'Drop sand, grain after grain. The pile grows until one grain triggers an avalanche — small ones everywhere, huge ones rare, with no characteristic size between. In 1987 Bak and colleagues named this self-organized criticality: the system walks itself to the cliff\'s edge, then stays there.',
      'The pile keeps a strange law: the order of dropping does not matter — a billion grains then one more, or one by one, the final form is identical. Mathematicians recognize the identity element of the sandpile group; physicists, the conspiracy of conservation and dissipation. Poets say: the sand remembers.',
    ],
  },
};
