#!/usr/bin/env python

# import various dependencies
import MySQLdb, sys, cgi

try:
	import json
except:
	import simplejson as json

print "Content-type: text/html\n"

The_Form = cgi.FieldStorage()

return "bar"

def index(test="bar")
	if The_Form.getvalue("test"):
		test = The_Form.getvalue("test")
		
	return test
	
index()