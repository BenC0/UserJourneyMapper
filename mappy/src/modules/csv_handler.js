import * as csv from 'parse-csv'
import * as Papa from 'papaparse'
import build_hierarchy from "./build_hierarchy"

const delimiter = "|>"
const journey_start_string = "Landing"
const journey_end_string = "End"

export function build_journey_string(data) {
	let journey_string = ''
	data.forEach(obj => {
		// console.log(obj)
		journey_string = `${journey_string}${obj['"page_type"'].replace(/"/g, '')}${delimiter}`
	})
	journey_string = `${journey_string}${journey_end_string}`
	// journey_string = journey_string.replace(`${delimiter}${journey_end_string}`, '')
	return journey_string
}

export function order_impressions(data) {
	for (var session in data) {
		let arr = data[session]
		arr.sort((a, b) => {
			const orderA = parseInt(a['"sequence_number"'])
			const orderB = parseInt(b['"sequence_number"'])
			let comparison = 0;
			if (orderA > orderB) {
				comparison = 1;
			} else if (orderA < orderB) {
				comparison = -1;
			}
			return comparison;
		})
	}
	return data
}

export function group_data_by_session_id(data) {
	let session_ids = {}
	data.forEach(row => {
		// console.log('group_data_by_session_id', row)
		let session_id = row['"session_id"']
		if (session_ids[session_id] === undefined) {
			session_ids[session_id] = []
		}
		session_ids[session_id].push(row)
	})
	return session_ids
}

export function calc_count(arr, string) {
	let count = 0
	arr.forEach(item => {
		if (item === string) {
			count++
		}
	})
	// console.log(count)
	return count
}

export function add_count_to_journeys(data) {
	let journey_arr = []
	let known_journeys = []
	let gen_row = (js, count) => {
		return [js, count]
	}

	data.forEach(journey => {
		if (known_journeys.indexOf(journey) === -1) {
			known_journeys.push(journey)
			// journey_arr.push(gen_row(journey, 1))
			journey_arr.push(gen_row(journey, calc_count(data, journey)))
		}
	})
	return journey_arr
}

export function format_data(data) {
	console.log('csv format start')
	let grouped_data = group_data_by_session_id(data)
	let ordered_data = order_impressions(grouped_data)
	let journey_strings = []
	for (var session in ordered_data) {
		let journey = ordered_data[session]
		let journey_string = build_journey_string(journey)
		journey_strings.push(journey_string)
	}
	let journeys_with_counts = add_count_to_journeys(journey_strings)
	console.log('csv format end')
	let hierarchy = build_hierarchy(journeys_with_counts, delimiter)
	console.log("hierarchy built")
	return hierarchy
}

export default function get_data_from_csv(csvPath, callback) {
	console.log('csv handler start')
	fetch(csvPath)
	.then(csvData => csvData.text())
	.then(csvData => {
		console.log('csv loaded')
		// var obj = csv.toJSON(csvData, {headers: {included: true}});
		Papa.parse(csvData, {
			header: true,
			quoteChar: '"',
			fastMode: true,
			skipEmptyLines: true,
			transformHeader:function(h) {
				return h.toLowerCase();
			},
			complete: (results, file) => {
				console.log('csv parsed')
				console.log(results.data)
				let d = format_data(results.data)
				callback(d)
			}
		})
		// return format_data(obj)
	})
	// return fetch("./example.json")
	// .then(data => data.json())
}