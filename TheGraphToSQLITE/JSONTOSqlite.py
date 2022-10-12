import sqlite3
import json
from glob import glob

file_name_list = glob("../TheGraphTextSubdomains/**.json")

con = sqlite3.connect("ENS_RECORDS.db")
cur = con.cursor()

try:
    create_table = """
        CREATE TABLE ENS_NAMES(
            ENS_RECORD_JSON
        )
    """
    cur.execute(create_table)
except Exception as e:
    s = str(e)

for file_name in file_name_list:
    print(file_name)
    file_contents = json.load(open(file_name))
    for domain in file_contents["data"]["domains"]:
        insert_template = """
        INSERT INTO ENS_NAMES VALUES
            ('%s')
        """
        # print(insert_template % json.dumps(domain))
        # print(file_name, domain["name"])
        try:
            cur.execute(insert_template % json.dumps(domain))
        except Exception as e:
            s = str(e)
            print(file_name, domain["name"], "had an issue")
    con.commit()



