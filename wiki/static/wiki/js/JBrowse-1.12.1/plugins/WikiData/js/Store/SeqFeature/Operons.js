define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    './SPARQL'
],
function (
    declare,
    lang,
    SPARQL
) {
    return declare(SPARQL, {
        _readChunk: function (query, callback) {
            this.queryTemplate = "PREFIX wdt: <http://www.wikidata.org/prop/direct/> PREFIX wd: <http://www.wikidata.org/entity/>  PREFIX qualifier: <http://www.wikidata.org/prop/qualifier/>  SELECT ?uniqueID ?description ?strand  (MIN(?gstart) AS ?start)  (MAX(?gend) AS ?end) ?uri  WHERE {  ?strain wdt:P685 '{organism}'. ?operon wdt:P279 wd:Q139677;  wdt:P703 ?strain;  rdfs:label ?description;  wdt:P2548 ?wdstrand;  wdt:P527 ?genes.  ?genes wdt:P644 ?gstart;  wdt:P645 ?gend.  bind( IF(?wdstrand = wd:Q22809680, '1', '-1') as ?strand).  bind(str(?operon) as ?uri)  bind( strafter( str(?operon), \"entity/\" ) as ?uniqueID ). }  GROUP BY ?uniqueID ?description ?strand ?uri ?prefix"
            this.inherited(arguments);
        }
    });
});

