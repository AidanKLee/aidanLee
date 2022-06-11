Postal Code Search
Url: api.geonames.org/postalCodeSearch?
Result:	returns a list of postal codes and places for the placename/postalcode query as xml document
For the US the first returned zip code is determined using zip code area shapes, the following zip codes are based on the centroid. For all other supported countries all returned postal codes are based on centroids.
Parameter Value Description
postalcode string (postalcode or placename required) postal code
postalcode_startsWith	string	the first characters or letters of a postal code
placename	string (postalcode or placename required)	all fields: placename,postal code, country, admin name (Important:urlencoded utf8)
placename_startsWith	string	the first characters of a place name
country	string: country code, ISO-3166 (optional)	Default is all countries. The country parameter may occur more than once, example: country=FR&country=GP
countryBias	string	records from the countryBias are listed first
maxRows	integer (optional)	the maximal number of rows in the document returned by the service. Default is 10
style	string SHORT,MEDIUM,LONG,FULL (optional)	verbosity of returned xml document, default = MEDIUM
operator	string AND,OR (optional)	the operator 'AND' searches for all terms in the placename parameter, the operator 'OR' searches for any term, default = AND
charset	string (optional)	default is 'UTF8', defines the encoding used for the document returned by the web service.
isReduced	true or false (optional)	default is 'false', when set to 'true' only the UK outer codes respectivel the NL 4-digits are returned. Attention: the default value on the commercial servers is currently set to 'true'. It will be changed later to 'false'.
east,west,north,south	float (optional)	bounding box, only features within the box are returned
Example http://api.geonames.org/postalCodeSearch?postalcode=9011&maxRows=10&username=demo
This service is also available in JSON format: http://api.geonames.org/postalCodeSearchJSON?postalcode=9011&maxRows=10&username=demo

Address Geocoding Webservice
Find lat/lng for Address
Returns the location lat/lng for a given address.
Url: api.geonames.org/geoCodeAddress?
Parameters: q (query term, url encoded)
Optional Parameters: country (iso countrycode), postalcode
Restriction: this webservice is only available for selected countries, see list below.
Result: returns the nearest address for the given latitude/longitude.
Example http://api.geonames.org/geoCodeAddress?q=Museumplein+6+amsterdam&username=demo
This service is also available in JSON format:
http://api.geonames.org/geoCodeAddressJSON?q=Museumplein+6+amsterdam&username=demo

Country Info (Bounding Box, Capital, Area in square km, Population)
Webservice Type: REST
Url: api.geonames.org/countryInfo?
Parameters: country (default = all countries)
lang: ISO-639-1 language code (en,de,fr,it,es,...) (default = english)
Result: Country information: Capital, Population, Area in square km, Bounding Box of mainland (excluding offshore islands)
Example: http://api.geonames.org/countryInfo?username=demo
An other countryInfo service is available as csv output:
Example: http://api.geonames.org/countryInfoCSV?lang=it&country=DE&username=demo