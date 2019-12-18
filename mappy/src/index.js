import "./styles.scss";
import generate_sunburst from "./modules/sunburst"
import get_data_from_csv from "./modules/csv_handler"

const DEBUG = true

const csvPath = DEBUG ? './sample-data.csv' : './data.txt'

console.log('app start')
get_data_from_csv(csvPath).then(data => {
	generate_sunburst(data)
})