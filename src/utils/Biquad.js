class Biquad {
  constructor(params) {
    this.params = Object.assign({}, {
      sr: 44100,
      f0: 10,
      q: 0.1,
      mode: 'lowpass',
    }, params);

    this.a0 = this.a1 = this.a2 = this.b0 = this.b1 = this.b2 = 0;
    this.w0 = this.cosw0 = this.sinw0 = this.alpha = 0;
    this.b0norm = this.b1norm = this.b2norm = this.a1norm = this.a2norm = 0;
    this.xMinusOne = this.xMinusTwo = this.yMinusOne = this.yMinusTwo = 0;

    this._updateCoefficients();
  }

  setSamplingRate(sr) {
    this.params.sr = sr;
    this._updateCoefficients();
  }

  setF(f) {
    this.params.f0 = f;
    this._updateCoefficients();
  }

  setQ(q) {
    this.params.q = q;
    this._updateCoefficients();
  }

  setMode(mode) {
    this.params.mode = mode;
    this._updateCoefficients();
  }

  _updateCoefficients() {
    this.params.q = Math.max(this.params.q, 0.001);
    this.w0 = 2 * Math.PI * this.params.f0 / this.params.sr;
    this.cosw0 = Math.cos(this.w0);
    this.sinw0 = Math.sin(this.w0);
    this.alpha = this.sinw0 / (2 * this.params.q);

    switch (this.params.mode) {
      case 'lowpass':
        this.b0 = (1 - this.cosw0) / 2;
        this.b1 = 1 - this.cosw0;
        this.b2 = this.b0;
        this.a0 = 1 + this.alpha;
        this.a1 = -2 * this.cosw0;
        this.a2 = 1 - this.alpha;
        break;
      case 'highpass':
        this.b0 = (1 + this.cosw0) / 2;
        this.b1 = -(1 + this.cosw0);
        this.b2 = this.b0;
        this.a0 = 1 + this.alpha;
        this.a1 = -2 * this.cosw0;
        this.a2 = 1 - this.alpha;
        break;
      case 'bandpass':
        // constant skirt gain, peak gain = Q
        // b0 = sinw0 / 2; // = q * alpha;
        // b1 = 0;
        // b2 = -sinw0 / 2; // = -q * alpha;
        // a0 = 1 + alpha;
        // a1 = -2 * cosw0;
        // a2 = 1 - alpha;

        // constant 0 dB peak gain
        this.b0 = this.alpha;
        this.b1 = 0;
        this.b2 = -this.alpha;
        this.a0 = 1 + this.alpha;
        this.a1 = -2 * this.cosw0;
        this.a2 = 1 - this.alpha;
        break;
      case 'notch':
        this.b0 = 1;
        this.b1 = -2 * this.cosw0;
        this.b2 = 1;
        this.a0 = 1 + this.alpha;
        this.a1 = -2 * this.cosw0;
        this.a2 = 1 - this.alpha;
        break;
      case 'allpass':
        this.b0 = 1 - this.alpha;
        this.b1 = -2 * this.cosw0;
        this.b2 = 1 + this.alpha;
        this.a0 = 1 + this.alpha;
        this.a1 = -2 * this.cosw0;
        this.a2 = 1 - this.alpha;
        break;
      default: // no way
        break;
    }

    this.b0norm = this.b0 / this.a0;
    this.b1norm = this.b1 / this.a0;
    this.b2norm = this.b2 / this.a0;
    this.a1norm = this.a1 / this.a0;
    this.a2norm = this.a2 / this.a0;
  }

  process(x) {
    const y = this.b0norm * x +
              this.b1norm * this.xMinusOne +
              this.b2norm * this.xMinusTwo -
              this.a1norm * this.yMinusOne -
              this.a2norm * this.yMinusTwo;

    this.xMinusTwo = this.xMinusOne;
    this.xMinusOne = x;
    this.yMinusTwo = this.yMinusOne;
    this.yMinusOne = y;

    return y;
  }

  reset() {
    this.xMinusOne = this.xMinusTwo = 0;
    this.yMinusOne = this.yMinusTwo = 0;
  }
};

module.exports = Biquad;
