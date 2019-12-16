# Returns the date ordinal for the passed integer. e.g. 1 returns 1st, 2 returns 2nd, etc.
def ordinal(num):
	try:
		if type(num) != int:
			num = int(num)
	except Exception as e:
		raise e

	return '%d%s' % (num, { 11: 'th', 12: 'th', 13: 'th' }.get(num % 100, { 1: 'st',2: 'nd',3: 'rd',}.get(num % 10, 'th')))

# Prints messages
def log(message = "", title = False):
	line = "-"*52
	if title == True:
		message = "\n%s\n%s\n%s" % (line, message, line)
		
	print("%s\n" % message)