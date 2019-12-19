import "./styles.scss";
import generate_sunburst from "./modules/sunburst"
import get_data_from_csv from "./modules/csv_handler"

const DEBUG = true

const csvPath = DEBUG ? './sample-data.csv' : './data.txt'

console.log('app start')
get_data_from_csv(csvPath).then(data => {
	generate_sunburst(data)
})

/* TODO: 
	1.	Wouldn't it be cool if we could upload files directly? - YES
	2.	UI needs to be built out, there currently isn't anything other than the graph
	3.	Graph could be more responsive.
	4.	Legend required.
	5.	Different types of graphs would also be cool but let's not think about it for now.
	6.	Need to work out how I can distribute this to the rest of the team
		without everyone having to faff around with installing node, python, etc.
		- Electron is the best shout for this put it's a complete PITA to implement. 
*/