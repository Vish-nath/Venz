# Emergency contact lookup

The assessment location button requests device coordinates, then asks the API to resolve the country. The API uses OpenStreetMap Nominatim reverse geocoding and displays attribution in the app. The lookup is initiated only after the user taps the location control; requests are cached and serialized to stay within Nominatim's public service policy.

Verified number mappings currently included:

- India: 112, per the [Ministry of Home Affairs ERSS](https://www.mha.gov.in/emergency-response-support-system-erss).
- United States: 911, per [911.gov](https://www.911.gov/).
- European Union countries: 112, per the [European Commission](https://digital-strategy.ec.europa.eu/en/policies/112).
- United Kingdom: 999 and 112, per [GOV.UK](https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers).

If a country is detected but not in this mapping, Venz shows the country and asks the user to call the locally verified emergency number rather than guessing. Reverse geocoding can fail or report the wrong country near borders; confirm the number with local authorities when possible. Emergency calls should never be delayed for the app.
