export default function generate_sunburst(hierarchy) {
	var width = 960,
		height = 700,
		radius = (Math.min(width, height) / 2) - 10;

	var formatNumber = d3.format(",d");

	var x = d3.scale.linear()
		.range([0, 2 * Math.PI]);

	var y = d3.scale.sqrt()
		.range([0, radius]);

	var color = d3.scale.category20c();

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });

	var arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


	svg.selectAll("path")
		.data(partition.nodes(hierarchy))
	.enter().append("path")
		.attr("d", arc)
		.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
		// .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0)
		.on("click", click)
	.append("title")
		.text(function(d) { return d.name + "\n" + formatNumber(d.value); });

	d3.select(self.frameElement).style("height", height + "px");1

	function click(d) {
		svg.transition()
			.duration(250)
			.tween("scale", function() {
				var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
					yd = d3.interpolate(y.domain(), [d.y, 1]),
					yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
				return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
			})
			.selectAll("path")
				.attrTween("d", function(d) { return function() { return arc(d); }; });
	}
	function arcVisible(d) {
		console.log(d)
		return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
	}
}