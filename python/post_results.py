#!/usr/bin/env python

# import various dependencies
import MySQLdb, sys, cgi, connection

try:
	import json
except:
	import simplejson as json

print "Content-type: text/html\n"

The_Form = cgi.FieldStorage()
if The_Form:	
	columns = "(`date`"
	cells =  "(CURRENT_TIMESTAMP"
	
	for i in The_Form:
		columns += ", `" + i + "`"
		cells += ", '" + The_Form.getvalue(i) + "'"
		
	columns += ")"
	cells += ")"
		
	try:
		conn = MySQLdb.connect (host = connection.db_host,  user = connection.db_user, passwd = connection.db_pass, db = connection.db)
	except MySQLdb.Error, e:
		print "Error %d: %s" % (e.args[0], e.args[1])
		sys.exit (1)
	
	sql = "INSERT INTO `zombie_data`.`zombie_sim_outcomes` " + columns + " VALUES " + cells
		
	try:
		cursor = conn.cursor ()
		cursor.execute (sql)
		cursor.close ()
	except MySQLdb.Error, e:
		print "Error %d: %s" % (e.args[0], e.args[1])
		sys.exit (1)
