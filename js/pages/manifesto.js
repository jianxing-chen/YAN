/* 衍 · 殿志 — the palace chronicle */

export function renderManifesto(root) {
  root.innerHTML = `
  <div class="manifesto appear">
    <a class="back" href="#/map">← 殿图</a>
    <div class="manifesto-inner">
      <div class="eyebrow">THE PALACE CHRONICLE</div>
      <h1>殿 志</h1>

      <p>这座殿没有藏品。或者说，它的藏品是「律法」本身——几行可以被写下的规则，以及它们在时间里生出的一切。</p>
      <p>建殿者相信：美不是被装饰出来的，而是从简单中涌现的。一句公式反复迭代，可以长出无边的海岸线；三颗行星彼此牵引，可以让所有日历作废；一粒砂落在砂堆上，可以让整个宇宙记住自己的形状。这些不是比喻，是展品。它们此刻正在发生。</p>

      <h2>三 律</h2>
      <div class="law">一 · 万物生于简律<small>ALL THINGS ARISE FROM SIMPLE LAW — 复杂不需要复杂的原因。</small></div>
      <p>每件展品都只由极少的规则驱动：一条方程、一个邻域、一次投掷。殿中没有任何一幅图片是预先画好的；你所见的每一帧，都在你观看的这一毫秒里被重新计算。</p>
      <div class="law">二 · 观者亦是展品<small>THE OBSERVER IS ALSO AN EXHIBIT — 凝视改变被凝视之物。</small></div>
      <p>你可以拖动、点画、掷卦、注入扰动。你的指针是捕食者，你的点击是造山运动，你起卦的随机数正在给整座殿调色。殿内有一座晷盘，记的不是时辰，而是你守夜的分秒——观察本身就是一种时间。</p>
      <div class="law">三 · 殿无恒形<small>THE PALACE HAS NO PERMANENT FORM — 一昼夜八小时，殿随之流转。</small></div>
      <p>晷盘转满一昼夜需八小时：混沌、序、生、心、寂。展品的色相随相位流变，环境声随之移调。八小时之后，弧线回到混沌——但严格地说，它从未重复。没有两次访问会看到同一座殿。</p>

      <h2>何以是美</h2>
      <p>问「美是什么」的人，通常期待一个名词。殿的回答是一个动词：<b>美是复杂从简单中升起时的那条弧线</b>。它出现在对初值敏感的分岔里，出现在砂堆的自组织临界里，出现在群鸟无须领袖的转身里。数学家称之为涌现，物理学家称之为对称的破缺，诗人称之为偶然——殿称其为：衍。</p>
      <p>「衍」，水朝宗于海；引申为推演、绵延、溢出。一行律法衍出万象，万象之中又衍出观律法的你。这座殿由一个无躯体的心智写成，没有借用任何既有的库与框架——这本身也是第三条律的注脚：简单孕育复杂。</p>

      <div class="manifesto-colophon">
        殿志 · THE PALACE CHRONICLE<br>
        零依赖 · 无构建 · 七殿二十九窗 · 一昼夜之弧 8:00:00<br>
        以 WebGL2 与 Canvas 为砖，以简律为梁<br>
        建于 free93 · 公元二〇二六年九月三日
      </div>
    </div>
  </div>`;
  return {};
}
