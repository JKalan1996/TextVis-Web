import psycopg2
import json
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def search(parameter):

	database_name = db_name
    conn = psycopg2.connect(database= database_name, user="postgres", password="TJ.VisLab", host="202.120.188.26",port="5432")
    cur = conn.cursor()

    cur.execute("select distinct name from videos where name ~ '"+parameter['txt']+"' and year between"+parameter['year'][0]+' and '+parameter['year'][1])

    result = cur.fetchall()

	return result
	
