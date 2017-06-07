function interpolate([r1,g1,b1], [r2,g2,b2], x){
	return [
		r1 + (r2 - r1) * x,
		g1 + (g2 - g1) * x,
		b1 + (b2 - b1) * x
	]
}

function gradient(name, r){
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
	hotish:[{index:0,rgb:[230,0,0]},{index:0.3,rgb:[255,210,0]},{index:.5,rgb:[200,200,200]}, {index:1,rgb:[255,255,255]}],
	yiorrd:[{index:0,rgb:[128,0,38]},{index:0.125,rgb:[189,0,38]},{index:0.25,rgb:[227,26,28]},{index:0.375,rgb:[252,78,42]},{index:0.5,rgb:[253,141,60]},{index:0.625,rgb:[254,178,76]},{index:0.75,rgb:[254,217,118]},{index:0.875,rgb:[255,237,160]},{index:1,rgb:[255,255,204]}]
};