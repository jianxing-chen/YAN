# 衍 · 无尽之殿
### YÁN — The Palace Without End

一座**活的数字美术馆**。它没有藏品，或者说，它的藏品是「律法」本身：
几行可以被写下的规则，以及它们在时间里生出的一切。
馆中没有任何一幅图片是预先画好的——你所见的每一帧，都在你观看的这一毫秒里被重新计算。

七殿 · 二十九窗 · 一昼夜之弧 8:00:00。
零依赖 · 零构建 · 零图片资源 · 全部手写。

---

## 入殿

```bash
cd free93
python3 serve.py          # 禁缓存服务器，保证殿始终是最新的自己
# 打开 http://localhost:8130/
```

需通过 HTTP 访问（ES Module 不支持 file://）。推荐 Chrome / Edge / Safari 桌面版。

## 殿图 THE MAP

| 殿 | 展品 |
|---|---|
| **混沌殿** Hall of Chaos | 洛伦兹吸引子 · 双摆 · 埃农映射 · 倍分岔图 |
| **分形殿** Hall of Fractals | 曼德博深潜 · 朱利亚之眼 · 牛顿花园 · 阿波罗尼奥斯之垫 |
| **涌现殿** Hall of Emergence | 康威生命游戏 · Lenia 连续生命 · 粒子生命 · 群鸟 · 阿贝尔砂堆 |
| **波浪殿** Hall of Waves | 双缝之影 · 克拉尼之盘 · 傅里叶之轮 · 谐振记录仪 |
| **生长殿** Hall of Growth | 图灵斑图 · 叶序之螺 · 文法花园 · 威尔逊迷宫 · 扩散限制凝聚 |
| **天穹殿** Hall of the Heavens | 星之碰撞 · 三体 · 宇宙之网 · 轨道之诗 |
| **心智殿** Hall of Mind | 感知机花园 · 线世界 · 元胞巡礼 |

## 三律 THE THREE LAWS

1. **万物生于简律** All things arise from simple law —— 每件展品由极少的规则驱动：一条方程、一个邻域、一次投掷。
2. **观者亦是展品** The observer is also an exhibit —— 你的指针是捕食者，你的点击是造山运动，你起卦的随机数正在给整座殿调色。
3. **殿无恒形** The palace has no permanent form —— 晷盘转满一昼夜需八小时（混沌 → 序 → 生 → 心 → 寂），展品色相与环境声随相位流变。八小时后弧线回到混沌——但严格地说，它从未重复。

## 守夜 THE VIGIL —— 运行八小时

按 `V`（或工具行的「游」）进入**守夜模式**：界面隐去，殿开始自我漫游，
展品逐一淡入淡出，唯一的时钟是右下的守夜计时。
本殿专为长时间运行而建：无内存泄漏的有限缓冲、确定性的随机种子、
永不重复的随机细节。让它开一整夜——你带回的是一段 8 小时 never-repeating 的凝视。
守夜的每一秒都被记入 localStorage，晷盘的相位跨会话累积。

## 键 KEYS

| 键 | 事 |
|---|---|
| `←` `→` | 上一件 / 下一件展品（跨殿循环） |
| `E` | 品 · 展品的铭文（双语） |
| `P` | 律 · 参数面板 |
| `M` | 声 · 环境声（每殿不同音高的持续音 + 五声音阶钟声） |
| `V` | 游 · 守夜模式（`ESC` 离开） |
| `F` | 全屏 |
| `R` | 重铸本窗 |
| `ESC` | 合上面板 / 回到殿图 |

## 太初之门 · 起卦

门厅可以「起卦」：三枚铜钱掷六次，得一本卦（有变爻则记之卦）。
卦的种子会为本会话的殿色调偏移几度——随机性是本殿的赞助人。
六十四卦的卦名从传统，卦赞为殿自撰。

## 结构 ARCHITECTURE

```
free93/
├── index.html
├── css/            base · shell · pages · panels
├── js/
│   ├── core/       math · store · aeon(晷盘) · audio · gl(WebGL2 微内核) · engine(展品宿主)
│   ├── data/       halls(殿图名录) · essays.*(双语铭文) · iching(六十四卦)
│   ├── ui/         wander(守夜) · dial(晷盘元件)
│   ├── pages/      gate(太初) · map(殿图) · exhibit(展窗) · manifesto(殿志) · diagnostics(殿诊)
│   └── exhibits/   七殿 × index + 机构模块
└── README.md · MANIFESTO.md
```

**道与器分离**：所有文字（殿名、铭文、卦赞）在 `js/data/`；
所有机构（模拟与渲染）在 `js/exhibits/`。一件展品 = 一份 `data/halls.js` 中的名录
+ 一段铭文 + 一个遵循统一契约的模块：

```js
{ id, hall, engine: 'canvas'|'webgl', params: [...], buttons: [...], note,
  async init(ctx), resize(ctx), frame(ctx, dt, t), dispose?(ctx) }
```

`ctx` 是展品栖居的小世界：画布、参数、指针、`accentHue`（当值相位色相）……

`#/diagnostics` 是殿的自诊：离屏逐窗通电、截图、体检（29/29 通过）。

## 哲学

见 [MANIFESTO.md](MANIFESTO.md) 与殿内 `#/manifesto`。

---

*建于 free93 · 公元二〇二六年九月 · 以 WebGL2 与 Canvas 为砖，以简律为梁。*
*MIT · 见 [LICENSE](LICENSE) —— 愿你以此律法，衍出你自己的殿。*
