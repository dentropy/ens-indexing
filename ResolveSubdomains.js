// const sqlite3 = require('sqlite3').verbose();
// const { ethers } = require("ethers");

import { ethers } from "ethers";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite'
const SQLite3 = sqlite3.verbose();
// const db = new SQLite3.Database('../TheGraphToSQLITE/ENS_RECORDS.db');

let JsonRpcProviderURL = "https://eth-mainnet.g.alchemy.com/v2/"
const provider = new ethers.providers.JsonRpcProvider(JsonRpcProviderURL);

async function create_tables(){
    db.serialize(() => {
        try {
            var create_table_query = "\
                CREATE TABLE ens_records_resolved(\
                    ens_name,       \
                    sub_domain,     \
                    ens_record_data \
                )"
            db.run(create_table_query, (err, result) => {
                console.log("Well fuck")
            });
        } catch (err) {
            console.log(err)
        }
        try {
            var create_table_query = "\
            CREATE TABLE ens_records_resolved_errors(\
                dusbomain, \
                ens_name   \
            )"
            db.run(create_table_query, (err, result) => {
                console.log("Well fuck")
            });
        } catch (err) {
            console.log(err)
        }
        // const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        // for (let i = 0; i < 10; i++) {
        //     stmt.run("Ipsum " + i);
        // }
        // stmt.finalize();

        // db.each("SELECT * FROM ens_names LIMIT 5", (err, row) => {
        //     console.log(row);
        // });
    });
    db.close();
}


async function get_ens_name(){
    const select_query = "\
    SELECT * FROM ens_metadata \
        WHERE texts != 'null' AND \
        ens_name NOT IN (SELECT DISTINCT ens_name FROM ens_records_resolved) \
        AND ens_name NOT IN (SELECT DISTINCT ens_name FROM ens_records_resolved_errors) \
        LIMIT 1;"
    let result = ""
    try {
        await db.get(select_query, (err, row) => {
            console.log(`ens_name = ${row.ens_name}`)
            // process the row here 
            result = row
            // console.log(result)
            resolve_ens_records(result.ens_name, JSON.parse(result.texts))
        });
    } catch (err) {
        console.log(err)
    }
    console.log(result) // Database
    return result
}

async function resolve_ens_records(ens_name, ens_records){
    console.log(`\n${ens_name}\n`)
    // console.log(ens_records)
    if (ens_records == null){
        // WRITE NO RECORDS TO DATABASE
        var our_query = `INSERT INTO ens_records_resolved_errors (ens_name) VALUES ('${ens_name}');`
        console.log(our_query)
        await db.get(our_query, (err, row) => {
            console.log(row)
        });
        return 0;
    }
    let records = {}
    const resolver = await provider.getResolver(ens_name);
    for(var i = 0; i < ens_records.length; i++){
        let record = await resolver.getText(ens_records[i]);
        records[ens_records[i]] = record
    }
    console.log(records)
    console.log(JSON.stringify(records))


    // How the fuck do I loop through this
    // Can I just insert multiple rows like a real top G?
    // Why of course
    var insert_query = `\
    INSERT INTO ens_records_resolved \
        (ens_name, ens_record, ens_record_data) VALUES`
    for(var record_name in records){
        insert_query += "('" + ens_name + "', '" + record_name + "', '" + JSON.stringify(records[record_name]) + "'),"
    }
    insert_query = insert_query.substring(0, insert_query.length - 1);
    console.log(insert_query)
    try {
        await db.get(insert_query, (err, row) => {
            console.log(row)
            get_ens_name()
        });
    } catch (err) {
        console.log(err)
    }
}
async function resolve_ens_record(ens_name, ens_record){

}

async function main(){
    // await create_tables()
    // console.log(await get_ens_name() ) // Undefined
    // await resolve_ens_records("rickmoo.eth")

    // Example Record Query
    const resolver = await provider.getResolver("000937.eth");
    let record = await resolver.getText("avatar");
    console.log(record)
}

// main()


// this is a top-level await 
(async () => {
    // open the database
    const db = await open({
      filename: './out/ENS_RECORDS.db',
      driver: sqlite3.Database
    })

    // Test a basic query
    let query = "SELECT json_extract(ENS_RECORD_JSON,'$.name'), json_extract(ENS_RECORD_JSON,'$.resolver.texts') FROM  ens_names ORDER BY json_extract(ENS_RECORD_JSON,'$.name')"
    const result = await db.get(query)
    console.log(result)

    var create_table_query = "\
    CREATE TABLE IF NOT EXISTS ens_records_resolved(\
        ens_name,       \
        sub_domain,     \
        ens_record_data \
    )"
    await db.exec(create_table_query);
    var create_table_query = "\
    CREATE TABLE IF NOT EXISTS ens_records_resolved_errors(\
        dusbomain, \
        ens_name   \
    )"
    await db.exec(create_table_query);

    const select_ens_name_metadata_query = "\
    SELECT json_extract(ENS_RECORD_JSON,'$.name') query_ens_name, json_extract(ENS_RECORD_JSON,'$.resolver.texts') text_records \
    FROM  ens_names \
    WHERE \
        query_ens_name NOT IN  (SELECT DISTINCT ens_name FROM ens_records_resolved) AND \
        query_ens_name NOT IN  (SELECT DISTINCT ens_name FROM ens_records_resolved_errors) \
    ORDER BY query_ens_name\
    LIMIT 1;"

    let next_ens_name = await db.get(select_ens_name_metadata_query)
    while (next_ens_name != undefined){
        console.log(next_ens_name)
        try {
            let subdomains = JSON.parse(next_ens_name.text_records)
            let subdomain_results = []
            let resolver = await provider.getResolver(next_ens_name.query_ens_name);
            for (var i = 0, len = subdomains.length; i < len; i++) {
                let record = await resolver.getText(subdomains[i]);
                subdomain_results.push([next_ens_name.query_ens_name, subdomains[i], record])
            }
            for (var i = 0, len = subdomain_results.length; i < len; i++) {
                var result_insert_query = `\
                INSERT INTO ens_records_resolved \
                    (ens_name, sub_domain, ens_record_data) VALUES (\
                        "${subdomain_results[i][0]}",\
                        "${subdomain_results[i][1]}", \
                        "${subdomain_results[i][2]}")`
                await db.exec(result_insert_query);
                console.log("INSERT")
            }
        } catch (err) {
            console.log(err)
            var error_insert_query = `INSERT INTO ens_records_resolved_errors (ens_name) VALUES ('${next_ens_name.query_ens_name}');`
            await db.exec(error_insert_query);
        }
        next_ens_name = await db.get(select_ens_name_metadata_query)
    
    }

})()