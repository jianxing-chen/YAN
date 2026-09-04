/* 衍 · soundscape — rooms have resonance.
   A still drone tuned to each hall's root, a slow breath of filtered noise,
   and rare pentatonic bells on transitions. Nothing loops recognizably;
   everything is synthesized, quiet, and optional. */

const PENTA = [0, 3, 5, 7, 10];  // minor pentatonic offsets

export const HALL_MOOD = {
  gate:      { root: 110.00, cut: 260, noise: .015, bell: .10 },
  map:       { root: 110.00, cut: 300, noise: .012, bell: .08 },
  chaos:     { root: 110.00, cut: 340, noise: .018, bell: .10 },
  fractal:   { root: 130.81, cut: 420, noise: .010, bell: .12 },
  emergence: { root: 146.83, cut: 380, noise: .014, bell: .10 },
  waves:     { root: 164.81, cut: 520, noise: .050, bell: .09 },
  growth:    { root: 196.00, cut: 460, noise: .012, bell: .11 },
  cosmos:    { root: 98.00,  cut: 240, noise: .020, bell: .13 },
  mind:      { root: 220.00, cut: 600, noise: .010, bell: .08 },
};

class Soundscape {
  constructor() {
    this.on = false;
    this.ac = null;
    this.mood = HALL_MOOD.gate;
    this.nodes = null;
  }

  unlock() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ac = new AC();
    this.nodes = this._build();
    this._apply(this.mood, 0);
  }

  _build() {
    const ac = this.ac;
    const master = ac.createGain();
    master.gain.value = 0;
    master.connect(ac.destination);

    const drone = ac.createGain();
    drone.gain.value = .16;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = this.mood.cut; lp.Q.value = .4;
    drone.connect(lp); lp.connect(master);

    const oscs = [];
    for (const [type, det, g] of [['sawtooth', -5, .30], ['sawtooth', 5, .26], ['sine', 0, .5]]) {
      const o = ac.createOscillator();
      o.type = type; o.detune.value = det;
      const og = ac.createGain(); og.gain.value = g;
      o.connect(og); og.connect(drone);
      o.start();
      oscs.push(o);
    }
    /* slow filter breath */
    const lfo = ac.createOscillator(); lfo.frequency.value = .045;
    const lfoG = ac.createGain(); lfoG.gain.value = this.mood.cut * .35;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();

    /* noise wash */
    const len = ac.sampleRate * 4;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0;
    for (let i = 0; i < len; i++) { b0 = b0 * .985 + (Math.random() * 2 - 1) * .015; d[i] = b0 * 6; }
    const noise = ac.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const nf = ac.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 800; nf.Q.value = .6;
    const ng = ac.createGain(); ng.gain.value = this.mood.noise;
    noise.connect(nf); nf.connect(ng); ng.connect(master);
    noise.start();

    return { master, lp, oscs, ng, nf };
  }

  _apply(mood, ramp = 3) {
    this.mood = mood;
    if (!this.nodes) return;
    const t = this.ac.currentTime;
    const n = this.nodes;
    for (let i = 0; i < n.oscs.length; i++) {
      n.oscs[i].frequency.setTargetAtTime(mood.root * (i === 2 ? .5 : 1), t, ramp / 2);
    }
    n.lp.frequency.setTargetAtTime(mood.cut, t, ramp / 2);
    n.ng.gain.setTargetAtTime(mood.noise, t, ramp / 2);
  }

  setOn(v) {
    this.unlock();
    if (!this.nodes) return;
    this.on = v;
    const t = this.ac.currentTime;
    this.nodes.master.gain.setTargetAtTime(v ? .16 : 0, t, v ? 2.5 : .8);
  }

  toggle() { this.setOn(!this.on); return this.on; }

  setHall(moodKey) {
    const mood = HALL_MOOD[moodKey] || HALL_MOOD.gate;
    if (mood !== this.mood) {
      this._apply(mood, 5);
      if (this.on) this.bell();
    }
  }

  bell(pick = Math.floor(Math.random() * 5)) {
    if (!this.on || !this.ac) return;
    const ac = this.ac, t = ac.currentTime;
    const freq = this.mood.root * 2 * Math.pow(2, PENTA[pick] / 12);
    for (const [mul, g, dec] of [[1, .05, 4.5], [2.76, .012, 2.4]]) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = freq * mul;
      const og = ac.createGain();
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(g, t + .02);
      og.gain.exponentialRampToValueAtTime(.0001, t + dec);
      o.connect(og); og.connect(this.nodes.master);
      o.start(t); o.stop(t + dec + .1);
    }
  }
}

export const sound = new Soundscape();
