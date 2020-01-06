import "./styles.scss";
import generate_sunburst from "./modules/sunburst"
import get_data_from_csv from "./modules/csv_handler"

const DEBUG = true

const csvPath = DEBUG ? './sample-data.csv' : './data.txt'

console.log('app start')
get_data_from_csv(csvPath, data => {
	generate_sunburst(data)
})

/* TODO: 
	1.	Using the real data causes the whole thing to crash. There are so many rows we need
		a better way to manage it. (Could be a memory)
		- Use Canvas instead of SVG. Apparently Canvas is significantly more efficient in terms of performance.
		- Figured it out!
			- Break it down into individual steps of the path and only render the segments that are needed
			- so on the root it'll load the landing pages and display them in the sunburst (is it a pie chart at this point? doesn't matter right now...) and then when clicking page X it will load the subsequent steps of page X (a, b, c & d). After clicking one of those steps (a), it'll then load the subsequent steps of page a (e, f, g), etc.
			- This reduces the number of rendered elements significantly (unusued elements can be cleared in between rendering steps)..
			- Might also be able to stick with SVG, but this could be done with Canvas as well.
			
	2.	Wouldn't it be cool if we could upload files directly? - YES
	3.	Different types of graphs would also be cool but let's not think about it for now.
	4.	Need to work out how I can distribute this to the rest of the team
		without everyone having to faff around with installing node, python, etc.
		- Electron is the best shout for this put it's a complete PITA to implement. 
*/