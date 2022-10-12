# ens-indexing

Get [ENS](https://ens.domains/) names with text subdomains and what they resolve to, stored as sqlite, json, or CSV

## Motivation

There has to be some interesting people on the Ethereum blockchain and by scraping it I can find out who they are, what they are working on, and possibly collaborate.

I should also be able to get a list of Dapps integrated via ENS.

I may even be able to find a [ARG](https://www.thenewatlantis.com/publications/reality-is-just-a-game-now) via ENS.

## Tech/Framework used

* Python with requests package
* Nodejs and NPM with ethersjs, sqlite, and sqlite3 packages
* API's used
  * [ENS Subgraph](https://thegraph.com/hosted-service/subgraph/ensdomains/ens)
  * Ethereum API ([Infura](https://infura.io/) in this case)

## Instructions

The scripts are run in the following order

``` bash
pip install requests
python3 TheGraphToSQLITE.py
# This should take about 10 minutes
npm install
# For the next step you require an Ethereum REST endpoint to be added to the code
# Please update line 11 from ResolvedSubdomains.js
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

* Find a better way to store the Infura Key, probably Environment Variables or a .env file
* Figure out somewhere else than infura where I can do all the ENS resolutions
* We need to use JS for ethersjs but we do not need to use python so TheGraphToSQLITE.py can be rewritten in JS to reduce dependencies
* We need to write scripts to export the sqlite as JSON and CSV rather than assuming people know how to do it
