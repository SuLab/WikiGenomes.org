define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/request/xhr',
    'dojo/io-query',
    'JBrowse/Store/SeqFeature/SPARQL',
    'JBrowse/Store/LRUCache'
],
function (
    declare,
    lang,
    array,
    xhr,
    ioQuery,
    SPARQL,
    LRUCache
) {
    return declare(SPARQL, {
        getFeatures: function (query, featCallback, finishCallback, errorCallback) {
            var thisB = this;
            var cache = this.featureCache = this.featureCache || new LRUCache({
                name: 'wikiDataFeatureCache',
                fillCallback: dojo.hitch(this, '_readChunk'),
                sizeFunction: function (features) {
                    return features.length;
                },
                maxSize: 100000 // cache up to 100,000 BAM features
            });
            query.toString = function () {
                return query.ref + ',' + query.start + ',' + query.end;
            };
            var chunkSize = 100000;

            var s = query.start - query.start % chunkSize;
            var e = query.end + (chunkSize - (query.end % chunkSize));
            var chunks = [];

            var chunksProcessed = 0;
            var haveError = false;
            for (var start = s; s < e; s += chunkSize) {
                var chunk = { ref: query.ref, start: s, end: s + chunkSize };
                chunk.toString = function () {
                    return query.ref + ',' + query.start + ',' + query.end;
                };
                chunks.push(chunk);
            }

            array.forEach(chunks, function (c) {
                cache.get(c, function (f, e) {
                    if (e && !haveError)                        {errorCallback(e);}
                    if ((haveError = haveError || e)) {
                        return;
                    }
                    var feats = thisB._resultsToFeatures(f, function (feature) {
                        if (feature.get('start') > query.end) // past end of range, can stop iterating
                            {return;}                        else if (feature.get('end') >= query.start) // must be in range
                            {featCallback(feature);}
                    });

                    if (++chunksProcessed == chunks.length) {
                        finishCallback();
                    }
                });
            });
        },
        _readChunk: function (query, callback) {
            var thisB = this;
            var backoff = 200;
            var headers = {
                'Accept': 'application/json',
                'X-Requested-With': null
            };

            xhr.get(this.url + '?' + ioQuery.objectToQuery({ query: thisB._makeQuery(query) }), {
                headers: headers,
                handleAs: 'json',
                failOk: true
            }).then(function (o) {
                callback(o);
            }, function (e) {
                setTimeout(function () {
                    thisB._readChunk(query, callback);
                }, query.backoff);

                if (query.backoff) {
                    query.backoff *= 2;
                } else {
                    query.backoff = 200;
                }
            });
        }
    });
});

