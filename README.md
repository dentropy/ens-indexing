# ens-indexing

Get ENS names with text subdomains and what they resolve to, stored as sqlite, json, or CSV

## Motivation

There has to be some interesting people on the Ethereum blockchain and by scraping it I can find out who they are, what they are working on, and possibly collaborate.

I should also be able to get a list of Dapps integrated via ENS.

I may even be able to find a [ARG](https://www.thenewatlantis.com/publications/reality-is-just-a-game-now) via ENS.

## Tech/Framework used

* Python with requests package
* Nodejs with ethersjs, sqlite, and sqlite3 packages
* API's used
  * [ENS Subgraph](https://thegraph.com/hosted-service/subgraph/ensdomains/ens)
  * Ethereum API ([Infura](https://infura.io/) in this case)

## Instructions

The scripts are run in the following order

``` bash
pip install requests
cd ./TheGraphTextSubdomains && python3 ScrapeTheGraphToJSON.py
# This should take about 10 minutes
cd ..
cd ./TheGraphToSQLITE && python3 JSONTOSqlite.py
# For the next step you require an Ethereum REST endpoint to be added to the code
cd ./TextSubdomainsResolved
npm install
node ResolveSubdomains.js
```

## Code Explanation

**./TheGraphTextSubdomains/ScrapeTheGraphToJSON.py**

Scrapes all ENS text records that are actually set

**./TheGraphToSQLITE/JSONTOSqlite.py**

`./TheGraphTextSubdomains/ScrapeTheGraphToJSON.py` transforms all the results from JSON into a sqlite database, this script just puts all those results into a sqlite database so it is easier to manage, query, update etc...

**./TextSubdomainsResolved/ResolveSubdomains.js**

This takes the database from `./TheGraphTextSubdomains/ScrapeTheGraphToJSON.py`, adds tables for ENS resolved and unresolved ENS records, then proceeds to resolve each record one by one storing them in the database.

## Next Steps

Merge `./TheGraphToSQLITE/JSONTOSqlite.py` and `./TheGraphTextSubdomains/ScrapeTheGraphToJSON.py` into a single script
