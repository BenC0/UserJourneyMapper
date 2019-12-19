import * as d3 from "d3"

const width = 932;
const radius = width / 6;
let totalSize = 0
let color = null

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
	w: 75, h: 30, s: 3, t: 10
};

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
export function getAncestors(node) {
	var path = [];
	var current = node;
	while (current.parent) {
		path.unshift(current);
		current = current.parent;
	}
	return path;
}

// Generate a string that describes the points of a breadcrumb polygon.
export function breadcrumbPoints(d, i) {
	var points = [];
	points.push("0,0");
	points.push(b.w + ",0");
	points.push(b.w + b.t + "," + (b.h / 2));
	points.push(b.w + "," + b.h);
	points.push("0," + b.h);
	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
		points.push(b.t + "," + (b.h / 2));
	}
	return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
export function updateBreadcrumbs(nodeArray, percentageString) {
	// Data join; key function combines name and depth (= position in sequence).
	var g = d3.select("#trail")
		.selectAll("g")
		.data(nodeArray, function(d) { return d.name + d.depth; });

	// Add breadcrumb and label for entering nodes.
	var entering = g.enter().append("svg:g");

	entering.append("svg:polygon")
		.attr("points", breadcrumbPoints)
		.style("fill", function(d) { return color(d.data.name); });

	entering.append("svg:text")
		.attr("x", (b.w + b.t) / 2)
		.attr("y", b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; });

	// Set position for entering and updating nodes.
	g.attr("transform", function(d, i) {
		return "translate(" + i * (b.w + b.s) + ", 0)";
	});

	// Remove exiting nodes.
	g.exit().remove();

	// Now move and update the percentage at the end.
	d3.select("#trail").select("#endlabel")
		.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
		.attr("y", b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(percentageString);

	// Make the breadcrumb trail visible, if it's hidden.
	d3.select("#trail")
		.style("visibility", "");
}

export function initializeBreadcrumbTrail() {
	// Add the svg area.
	var trail = d3.select("#sequence").append("svg:svg")
		.attr("width", width)
		.attr("height", 50)
		.attr("id", "trail");
	// Add the label at the end, for the percentage.
	trail.append("svg:text")
		.attr("id", "endlabel")
		.style("fill", "#000");
}

export default function generate_sunburst(data) {
	const format = d3.format(",d");

	const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    initializeBreadcrumbTrail();

	const partition = data => {
	    const root = d3.hierarchy(data)
	            .sum(d => d.size)
	            .sort((a, b) => b.value - a.value);
	    return d3.partition()
	            .size([2 * Math.PI, root.height + 1])
	            (root);
	}
    console.log(data);
    const root = partition(data);
    color = d3.scaleOrdinal().range(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    root.each(d => d.current = d);

    const svg = d3.select('#partitionSVG')
            .style("width", "100%")
            .style("height", "auto")
            .style("font", "10px sans-serif");

    const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

    const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                while (d.depth > 1)
                    d = d.parent;
                return color(d.data.name);
            })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d.current));

    path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

    path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = g.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

    const parent = g.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

    totalSize = path.node().__data__.value;

    function clicked(p) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

		var percentage = (100 * p.value / totalSize).toPrecision(3);
		var percentageString = percentage + "%";
		if (percentage < 0.1) {
			percentageString = "< 0.1%";
		}

        var sequenceArray = getAncestors(p);
		updateBreadcrumbs(sequenceArray, percentageString);

        const t = g.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function (d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
    }

    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
}