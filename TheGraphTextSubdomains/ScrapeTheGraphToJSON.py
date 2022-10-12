import requests
import json
import pprint


def get_ens_text_subdomains(unix_time, file_num):
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


    print( query_template_str % unix_time + "\n")

    x = requests.post(url, json = {"query" : query_template_str % unix_time })
    response = x.json()
    next_time = response["data"]["domains"][-1]["createdAt"]
    print(next_time)
    with open('data.json', 'w') as f:
      json.dump(response, open("texts_subdomains_%s.json" % file_num, 'w'))
    return next_time, file_num+1

next_unix_time, next_file_num = get_ens_text_subdomains(0, 1)

got_error = True
while got_error:
    try:
        next_unix_time, next_file_num = get_ens_text_subdomains(next_unix_time, next_file_num)
    except Exception as e:
        s = str(e)
        print(s)
        got_error = False
