function interpolate([r1,g1,b1], [r2,g2,b2], x){
	return [
		r1 + (r2 - r1) * x,
		g1 + (g2 - g1) * x,
		b1 + (b2 - b1) * x
	]
}

export default function gradient(name, r){
	r = Math.min(Math.max(r, 0), 1)

	const colors = maps[name]
	const i = 
		r === 1 ? colors.length - 1 :
		r === 0 ? 1 :
		colors.findIndex(c => c.index > r)

	const lower = colors[i - 1]
	const upper = colors[i]

	const res = interpolate(lower.rgb, upper.rgb, (r - lower.index) / (upper.index - lower.index))

	return res.map(Math.round)
}

// https://github.com/bpostlethwaite/colormap/blob/master/colorScales.js
// but with unneeded gradients removed
const maps = {
	stars:[{index:0,rgb:[0,0,255]},{index:1,rgb:[255,255,255]}],
	space:[{index:0,rgb:[255,255,255]},{index:.05,rgb:[50,5,50]},{index:1,rgb:[15,5,15]}],
	hotish:[{index:0,rgb:[230,0,0]},{index:0.3,rgb:[255,210,0]},{index:.5,rgb:[200,200,200]}, {index:1,rgb:[255,255,255]}],
	yiorrd:[{index:0,rgb:[128,0,38]},{index:0.125,rgb:[189,0,38]},{index:0.25,rgb:[227,26,28]},{index:0.375,rgb:[252,78,42]},{index:0.5,rgb:[253,141,60]},{index:0.625,rgb:[254,178,76]},{index:0.75,rgb:[254,217,118]},{index:0.875,rgb:[255,237,160]},{index:1,rgb:[255,255,204]}],
	magma: [{index:0,rgb:[28,16,68]},{index:0.25,rgb:[79,18,123]},{index:0.38,rgb:[129,37,129]},{index:0.5,rgb:[181,54,122]},{index:0.63,rgb:[229,80,100]},{index:0.75,rgb:[251,135,97]},{index:1,rgb:[254,194,135]}],
	magma2: [{"index":0,"rgb":[28,16,68]},{"index":0.13,"rgb":[172,0,187]},{"index":0.25,"rgb":[219,0,170]},{"index":0.38,"rgb":[255,0,130]},{"index":0.5,"rgb":[255,63,74]},{"index":0.63,"rgb":[255,123,0]},{"index":0.75,"rgb":[234,176,0]},{"index":0.88,"rgb":[190,228,0]},{"index":1,"rgb":[147,255,0]}],
	progress: [{index:0.000, rgb:[255, 255, 170]},{index:0.072, rgb:[255, 170, 86]},{index:0.142, rgb:[255, 0, 0]},{index:0.249, rgb:[191, 0, 191]},{index:0.350, rgb:[127, 127, 127]},{index:0.470, rgb:[0, 191, 0]},{index:0.630, rgb:[0, 127, 255]},{index:0.805, rgb:[127, 0, 0]},{index:1.000, rgb:[0, 0, 0]}],
};







