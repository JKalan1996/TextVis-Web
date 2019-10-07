import psycopg2
import json
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def search(parameter):
    database_name = 'video_label'
    conn = psycopg2.connect(database= database_name, user="postgres", password="TJ.idvxlab", host="10.11.50.52",port="5432")
    cur = conn.cursor()

    #subject_string = "'" + "', '".join(parameter['subject']) + "'"

    intent_string  = "'" + "', '".join(parameter['intent']) + "'"

    obj_string = "'" + "', '".join(parameter['object']) + "'"

    #cur.execute("select name from videos where name ~ '"+parameter['txt']+"' and subject in ("+subject_string+") and subintent in ("+intent_string+") and object in ("+obj_string+") and year between 2010 and 2019")
    cur.execute("select name from videos where name ~ '"+parameter['txt']+"' and intent in ("+intent_string+") and object in ("+obj_string+") and year between 2010 and 2019")

    result = cur.fetchall()

    return result

parameter = {}
parameter['txt'] = ''
parameter['year'] = [2010,2019]
#parameter['subject'] = ['Engineering and technology', 'Economics']
parameter['object'] = ['categary','part-to-whole','trend','geospatial','relationship']
parameter['intent'] = ['enter', 'exit']
a = search(parameter)
print(a)