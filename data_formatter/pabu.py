import helper_functions as hf

# A very basic class would look something like this:
class UserSession:
	user_journey_string = "Landing"
	delimiter = "|>"
	session_id = ""

	def add_path(self, new_path):
		self.user_journey_string = "%s%s%s" % (self.user_journey_string, self.delimiter, new_path)

	def end_path(self):
		self.add_path("End")

	def set_session_id(self, new_session_id):
		self.session_id = new_session_id

	def get_session_id(self):
		return self.session_id

	def get_journey_array(self):
		return self.user_journey_string.split(self.delimiter)

	def get_nth_step_of_journey(self, n):
		return self.get_journey_array()[n]

	def log_journey(self):
		hf.log("User Journey for session %s:\n%s\n" % (self.session_id, self.user_journey_string), False)

def get_max_user_journey_length(sessions):
	max_journey_length = 0
	for session in sessions:
		journey_array = session.get_journey_array()
		journey_length = len(journey_array)

		if journey_length > max_journey_length:
			max_journey_length = journey_length
	return max_journey_length

def filter_sessions_by_session_id(session_id, raw_data):
	filtered_rows = []
	for row in raw_data:
		raw_session_id = row["session_id"]
		if raw_session_id == session_id:
			filtered_rows.append(row)
	return filtered_rows

def order_sessions_by_sequence_number(data):
	bah = sorted(data, key = lambda i: int(i["sequence_number"])) 
	return bah

def group_session_details(session_id, raw_data):
	verbose = False
	hf.log("Grouping session details for session %s" % (session_id), False)

	filtered_sessions = filter_sessions_by_session_id(session_id, raw_data)
	session_details = order_sessions_by_sequence_number(filtered_sessions)

	session = UserSession()
	x = 0
	for impression in session_details:
		session_id = impression["session_id"]
		sequence_number = hf.ordinal(impression["sequence_number"])
		page_type = impression["page_type"]
		page_title = impression["page_title"]

		if x == 0:
			session.set_session_id(session_id)

		if verbose:
			session.add_path("%s:%s" % (page_type, page_title))
		else:
			session.add_path("%s" % (page_type))

		if x == len(session_details) - 1:
			session.end_path()
		x += 1
	return session

def check_if_impression_exists_at_level(impression, current_level):
	exists = False
	for key, val in current_level.items():
		if key == "name" and val == impression:
			exists = True

	return exists

def build_hierarchy(sessions):
	hierarchy = {
		"name": "Landing",
		"children": []
	}

	for session in sessions:
		journey_array = session.get_journey_array()
		current_level = hierarchy
		print("Building hierarchy for session %s" % session.get_session_id())
		for impression in journey_array:
			exists = check_if_impression_exists_at_level(impression, current_level)
			print(exists)
			if exists == False and impression != "End":
				current_level["children"].append({
					"name": impression,
					"children": []
				})
			elif exists == False and impression == "End":
				current_level["children"].append({
					"name": impression,
					"size": 1
				})
			current_level = current_level["children"]
			print(current_level)
