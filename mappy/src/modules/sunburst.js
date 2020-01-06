import * as d3 from "d3"
import * as randomcolor from "randomcolor"

const body = document.body
const body_width = body.clientWidth
const body_height = body.clientHeight

const width = (body_width < body_height) ? body_width : body_height
const radius = width / 6;
const nBrown_orange = "#ee6d00"
const nBrown_blue = "#2c2954"

let totalSize = 0
let colors = {
    "Home Page": nBrown_orange,
    "End": nBrown_blue,
    "error": "#ff2828"
}

let night = (body.getAttribute('night') === undefined) ? false : ((body.getAttribute('night')) ? true : false) 
let luminosity = night ? "bright" : "dark"

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function pick_random_color_from_palette() {
    let palette = [nBrown_orange, nBrown_blue]
    let random_int = randomIntFromInterval(0, palette.length)
    return palette[random_int]
}

function get_colour(name) {
    let col = randomcolor({
        luminosity: luminosity,
        hue: pick_random_color_from_palette()
    })

    if (colors[name] === undefined) {
        colors[name] = col
    } else {
        col = colors[name]
    }
    return col
}

export function build_leg(color, text) {
    return `<li style="background-color: ${color}"><span>${text}</span></li>`

}

export function build_legend() {
    let legend_list = document.querySelector('#legend_list')
    for( var color in colors ) {
        if (color !== "End" && color !== "error") {
            legend_list.insertAdjacentHTML('beforeend',build_leg(colors[color], color))
        }
    }
    legend_list.insertAdjacentHTML('beforeend',build_leg(colors["error"], "error"))
    legend_list.insertAdjacentHTML('beforeend',build_leg(colors["End"], "End"))
}

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

export function build_crumb(name, color) {
	return `<li name="${name}" style="background-color: ${color}"> <span>${name}</span> </li>`
}

export function update_percentage(value) {
	let percentage = parseFloat((value/totalSize)*100).toFixed(2)
	let percentage_string =  percentage == 0 ? "" : `${percentage}% of sessions`
	let target = document.querySelector('#sequence > #percentage')
	target.textContent = percentage_string
}

// Update the breadcrumb trail to show the current sequence and percentage.
export function updateBreadcrumbs(nodeArray) {
	let totalVal = 0
	let breadcrumbs = document.querySelector('#breadcrumbs')
	breadcrumbs.innerHTML = ""
	nodeArray.forEach(node => {
		let data = node.data
		let name = data.name
		let color = colors[name]
		let crumb = build_crumb(name, color)
		totalVal += node.value
		breadcrumbs.insertAdjacentHTML('beforeend', crumb)
	})
	update_percentage(totalVal)
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
    root.each(d => d.current = d);

    const svg = d3.select('#partitionSVG')
            .style("width", "100%")
            .style("height", "auto")
            .style("font", "10px sans-serif");

    const g = svg.append("g")
            .attr("transform", `translate(${width / 1.75},${width / 1.75})`);

    const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                if (colors[d.data.name] === undefined) {
                    colors[d.data.name] = get_colour(d.data.name)
                }
                return colors[d.data.name];
            })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
	        .attr("style", d => `display: ${arcVisible(d.current) ? "inherit" : "none"}`)
            .attr("d", d => arc(d.current));

    path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

    path.append("text")
            .text(d => {
            	// console.log(d.value) 
            	totalSize += d.value
            	return `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`
            });

    build_legend()

    const label = g.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("style", d => `display: ${labelVisible(d.current) ? "inherit" : "none"}`)
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = g.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

    function clicked(p) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

        var sequenceArray = getAncestors(p);
		updateBreadcrumbs(sequenceArray);

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
                .attr("style", d => `display: ${arcVisible(d.target) ? "inherit" : "none"}`)
                .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attr("style", d => `display: ${labelVisible(d.target) ? "inherit" : "none"}`)
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