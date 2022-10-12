# ens-indexing

Get [ENS](https://ens.domains/) names with text subdomains and what they resolve to, stored as sqlite, json, or CSV

## Motivation

There has to be some interesting people on the Ethereum blockchain and by scraping it I can find out who they are, what they are working on, and possibly collaborate.

I should also be able to get a list of Dapps integrated via ENS.

I may even be able to find a [ARG](https://www.thenewatlantis.com/publications/reality-is-just-a-game-now) via ENS.

## Tech/Framework used

* Python with requests package
* Nodejs and NPM with ethersjs, sqlite, and sqlite3 packages
* sqlite3
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

#### Saving data as CSV

``` bash
# Enter one line at a time
sqlite
.open ENS_RECORDS.db
.mode csv
.headers on
.output ENS_NAMES.csv
select * from ENS_NAMES;
.output stdout
.output ens_records_resolved.csv
select * from ens_records_resolved;
.output stdout
```

#### Saving data as JSON

``` bash
# Enter one line at a time
sqlite
.open ENS_RECORDS.db
.mode json
.headers on
.output ENS_NAMES.json
select * from ENS_NAMES;
.output stdout
.output ens_records_resolved.json
select * from ens_records_resolved;
.output stdout
```

## Code Explanation

**./ScrapeTheGraphToSQLITE.py**

Scrape all ENS text records from TheGraph via [ENS Subgraph](https://thegraph.com/hosted-service/subgraph/ensdomains/ens) that are actually set and store in sqlite database.

**./ResolveSubdomains.js**

Takes the database setup from `./ScrapeTheGraphToSQLITE.py`, adds tables for resolved and unresolved ENS records, then proceeds to resolve each record one by one storing them in the database.

## Next Steps

* Find a better way to store the Infura Key, probably Environment Variables or a .env file
* Figure out somewhere else than infura where I can do all the ENS resolutions
* We need to use JS for ethersjs but we do not need to use python so TheGraphToSQLITE.py can be rewritten in JS to reduce dependencies
* Write scripts for people to use rather than exporting tables manually to CSV and JSON
* This project does not support subdomains at this point