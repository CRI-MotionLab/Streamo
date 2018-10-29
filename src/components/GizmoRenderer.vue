<!--
mostly stolen from
https://alligator.io/vuejs/vue-html5-canvas/
-->

<script>
  // some vars and helper functions first :

  // david's answer in :
  // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  function hexToRgba(hex, a) {
    if (hex.charAt(0) === '#') {
      var bigint = parseInt(hex.substr(1), 16);
      var r = (bigint >> 16) & 255;
      var g = (bigint >> 8) & 255;
      var b = bigint & 255;
      return `rgba(${r},${g},${b},${a})`;
    }
    return null;
  };

  const lightYellow = '#fff17a';
  const lightBlue = '#7cdde2';
  const lightRed = '#f45a54';
  const darkBlue = '#4951D0';

  const rgbaLightYellow = hexToRgba(lightYellow, 0.8);
  const rgbaLightBlue = hexToRgba(lightBlue, 0.8);
  const rgbaLightRed = hexToRgba(lightRed, 0.8);

  function getRealRadians(normAngle) {
    return Math.PI * (normAngle - 0.25);
  };

  function positionsFromAngle(a, center, radius) { // a belongs to [-1, 1]
    const realAngle = getRealRadians(a);
    const x = Math.cos(realAngle);
    const y = Math.sin(realAngle);
    return [
      { x: center.x + x * radius, y: center.y + y * radius },
      { x: center.x - x * radius, y: center.y - y * radius }
    ];
  };

  export default {
    // Gets us the provider property from the parent <my-canvas> component.
    inject: [ 'provider' ],
    props: {
      name: { type: String, default: '' },
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
    render() {
      // Since the parent canvas has to mount first, it's *possible* that the context may not be
      // injected by the time this render function runs the first time.
      if(!this.provider.context) return;
      const ctx = this.provider.context;

      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const center = { x: w * 0.5, y: h * 0.5 };
      const radius = 0.375 * w;

      // Clear previous render.
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, w, h);

      ///// draw diagonal line

      ctx.beginPath();
      const pos = positionsFromAngle(0, center, radius);
      ctx.moveTo(pos[0].x, pos[0].y);
      ctx.lineTo(pos[1].x, pos[1].y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = darkBlue;
      ctx.stroke();

      ///// draw yellow circle at the center

      ctx.beginPath();
      ctx.arc(center.x, center.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = rgbaLightYellow; // 'rgba(243, 240, 114, 0.8)';
      ctx.fill();

      ///// draw red lines

      const angle = this.z;
      const anti = angle < 0;
      ctx.lineWidth = 10;

      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, getRealRadians(0), getRealRadians(angle), anti);
      ctx.strokeStyle = rgbaLightRed;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, getRealRadians(1), getRealRadians(angle + 1), anti);
      ctx.strokeStyle = rgbaLightRed;
      ctx.stroke();

      const posX = { x: center.x + this.x * radius, y: center.y };
      const posY = { x: center.x, y: center.y - this.y * radius };

      ///// draw yellow and blue lines

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(posX.x, posX.y);
      ctx.strokeStyle = rgbaLightYellow;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(posY.x, posY.y);
      ctx.strokeStyle = rgbaLightBlue;
      ctx.stroke();

      ///// draw dots :

      // center and diagonal black dots
      ctx.beginPath();
      ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pos[0].x, pos[0].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pos[1].x, pos[1].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();

      // yellow and blue lines ends
      ctx.beginPath();
      ctx.arc(posX.x, posX.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = rgbaLightYellow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(posY.x, posY.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = rgbaLightBlue;
      ctx.fill();

      // yellow and blue lines black dots
      ctx.beginPath();
      ctx.arc(posX.x, posX.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(posY.x, posY.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();

      // red lines ends
      const posZ = positionsFromAngle(angle, center, radius);
      ctx.beginPath();
      ctx.arc(posZ[0].x, posZ[0].y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = rgbaLightRed;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(posZ[1].x, posZ[1].y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = rgbaLightRed;
      ctx.fill();

      // red lines black dots
      ctx.beginPath();
      ctx.arc(posZ[0].x, posZ[0].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(posZ[1].x, posZ[1].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    },
  };
</script>
