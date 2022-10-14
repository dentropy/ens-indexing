import requests
import json
import sqlite3
import json
from datetime import datetime

con = sqlite3.connect("ENS_RECORDS.db")
cur = con.cursor()

try:
    create_table = """
        CREATE TABLE ens_names(
            ENS_RECORD_JSON
        )
    """
    cur.execute(create_table)
    init_unix_time = 0
except Exception as e:
    s = str(e)
    print("Database is already created")
    tmp_query = """
        SELECT json_extract(ENS_RECORD_JSON,'$.createdAt') as unix_time FROM ens_names
        WHERE unix_time != 'NULL'
        ORDER BY unix_time DESC
        LIMIT 1;
    """
    res = cur.execute(tmp_query)
    init_unix_time = res.fetchone()[0]


def get_ens_text_subdomains(unix_time):
    url = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'
    query_template_str = """
      query {
        domains(where: {
          resolver_: {
            texts_not: null
          },
          createdAt_gt: %s
        },
        orderBy: createdAt, 
        orderDirection: asc,
        first : 1000
        ) {
          id
          name
          labelName
          labelhash
          subdomainCount
          resolvedAddress {
            id
          }
          owner {
            id
          }
          resolver {
            addr {
              id
            }
            id
            texts
            coinTypes
          }
          ttl
          isMigrated
          createdAt
        }
      }
    """


    # print( query_template_str % unix_time + "\n")


    x = requests.post(url, json = {"query" : query_template_str % unix_time })
    response = x.json()
    next_time = response["data"]["domains"][-1]["createdAt"]
    print(next_time)
    print(datetime.utcfromtimestamp(int(next_time)).strftime('%Y-%m-%d %H:%M:%S'), "\n")
    # Loop through results here rather than storing as JSON
    for domain in response["data"]["domains"]:
        insert_template = """
        INSERT INTO ens_names VALUES
            ('%s')
        """
        try:
            cur.execute(insert_template % json.dumps(domain))
        except Exception as e:
            s = str(e)
            print(file_name, domain["name"], "had an issue")
    con.commit()
    return next_time, len(response["data"]["domains"])

print("Querying TheGraph for the next 1000 results")
next_unix_time, num_results= get_ens_text_subdomains(init_unix_time)
print(num_results)
while num_results == 1000:
    try:
        print("Querying TheGraph for the next 1000 results")
        next_unix_time, num_results = get_ens_text_subdomains(next_unix_time)
        print(num_results)
    except Exception as e:
        s = str(e)
        print(s)
        got_error = False
