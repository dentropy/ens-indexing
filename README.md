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
cp ./ENS_RECORDS.db /out/./ENS_RECORDS.db

# Export JSON and CSV of full database
sqlite3 -header -csv ./ENS_RECORDS.db \
  "select * from ens_names;" > ./out/ens_names.csv

sqlite3 -header -csv ./ENS_RECORDS.db \
  "select * from ens_records_resolved;" > ./out/ens_records_resolved.csv

sqlite3  -json ./ENS_RECORDS.db \
  "select * from ens_names;" > ./out/ens_names.json

sqlite3 -json ./ENS_RECORDS.db \
  "select * from ens_records_resolved;" > ./out/ens_records_resolved.json

# Generate Sample JSON and CSV Data from database
sqlite3 -header -csv ./ENS_RECORDS.db \
  "select * from ens_names;" > ./sample/sample_ens_names.csv

sqlite3 -header -csv ./ENS_RECORDS.db \
  "select * from ens_records_resolved;" > ./sample/sample_ens_records_resolved.csv

sqlite3  -json ./ENS_RECORDS.db \
  "select * from ens_names;" >./sample/sample_ens_names.json

sqlite3 -json ./ENS_RECORDS.db \
  "select * from ens_records_resolved;" > ./sample/sample_ens_records_resolved.json

# Zip everything up for upload to S3
zip full-ens-indexing.zip out/*
zip sample-ens-indexing.zip sample/*
```

``` bash
# Enter one line at a time
sqlite3
.open ENS_RECORDS.db;
.mode csv;
.headers on;
.output ens_names.csv;
select * from ens_names;
.output stdout;
.output ens_records_resolved.csv;
select * from ens_records_resolved;
.output stdout;
```

#### Saving data as JSON

``` bash
# Enter one line at a time
sqlite3
.open ENS_RECORDS.db;
.mode json;
.headers on;
.output ENS_NAMES.json;
select * from ENS_NAMES;
.output stdout;
.output ens_records_resolved.json;
select * from ens_records_resolved;
.output stdout;
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

## Bugs

Not all inserts have gone through
```
{
  query_ens_name: 'basindao.eth',
  text_records: '["email","url","description","notice","keywords","com.twitter"]'
}
INSERT
INSERT
Error: SQLITE_ERROR: near "project": syntax error
--> in Database#exec('                INSERT INTO ens_records_resolved                     (ens_name, sub_domain, ens_record_data) VALUES (                        "basindao.eth",                        "description",                         "basin is global DAO reducing/removing carbon, restoring/protecting nature and improving human health/wealth.  Also known as the "project developer" DAO, basin works at the real property level building and executing climate, nature and carbon projects with an emphasis on "core benefits" such as biodiversity, ecosystem services and climate resilience.    Our real asset projects create restoration, regeneration & conservation at scale, basin to basin.")', [Function (anonymous)])
    at /home/paul/Projects/ens-indexing/node_modules/sqlite/build/Database.js:212:21
    at new Promise (<anonymous>)
    at Database.exec (/home/paul/Projects/ens-indexing/node_modules/sqlite/build/Database.js:210:16)
    at file:///home/paul/Projects/ens-indexing/ResolveSubdomains.js:191:26 {
  errno: 1,
  code: 'SQLITE_ERROR',
  __augmented: true
}
```
