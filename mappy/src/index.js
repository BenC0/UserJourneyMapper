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
	1.	Using the real data causes the whole thing to crash. There are so many rows we need
		a better way to manage it. (Could be a memory)
		- Maybe the data needs to be preformatted. Preformatting the data through Python would reduce the amount of shit the app needs to do. There would be a fuck ton less data because it's been smooshed (It's 9am the morning after the work party, doing real thinking and using actual terminology ain't happening...) 
	2.	Wouldn't it be cool if we could upload files directly? - YES
	3.	Different types of graphs would also be cool but let's not think about it for now.
	4.	Need to work out how I can distribute this to the rest of the team
		without everyone having to faff around with installing node, python, etc.
		- Electron is the best shout for this put it's a complete PITA to implement. 
*/