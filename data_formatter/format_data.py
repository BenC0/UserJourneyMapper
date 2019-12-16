import helper_functions as hf
import pabu, csv

def main():
	hf.log("Loading CSV", False)
	# Load the data
	with open("sample_raw_data.csv", newline="") as raw_data:
		loaded_data = csv.reader(raw_data, delimiter=",")
		# Skip first row from CSV, assumes the first row is a header row
		next(loaded_data, None)

		hf.log("Rows loaded, Looping through each row", False)
		session_id_list = []
		data = []
		# Loop through rows, create a dictionary from the details and place them into a list
		for row in loaded_data:
			site_name = row[0]
			session_id = row[1]
			sequence_number = row[2]
			page_type = row[3]
			page_title = row[4]

			user_page_view_details = {
				"site_name": site_name,
				"session_id": session_id,
				"sequence_number": sequence_number,
				"page_type": page_type,
				"page_title": page_title
			}

			data.append(user_page_view_details)

			# Place unique session IDs into a list
			if session_id not in session_id_list:
				session_id_list.append(session_id)

		hf.log("Session IDs collated, %d IDs found" % (len(session_id_list)), False)
		sessions = []

		hf.log("Grouping Sessions based on IDs", True)
		# Loop through each session_id and group the session details by the ID
		for session_id in session_id_list:
			session = pabu.group_session_details(session_id, data)
			hf.log("Session %s User Journey\n%s" % (session.session_id, session.user_journey_string), False)
			# Place grouped sessions into a list
			sessions.append(session)

		# get max length of user journey for future usage
		max_journey_length = pabu.get_max_user_journey_length(sessions)
		hf.log("Max Journey Length: %d" % max_journey_length, False)

		pabu.build_hierarchy(sessions)

if __name__ == '__main__':
	hf.log("Script Start", True)
	main()
	hf.log("Script End", True)