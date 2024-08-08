import osmnx as ox
import pandas as pd
import geopandas as gpd
from pathlib import Path
import matplotlib.pyplot as plt
from qwikidata.sparql import return_sparql_query_results
import geonamescache
import json


ROOT_DIR = Path(__file__).parent

# ox.settings.log_console = True
ox.settings.max_query_area_size = 25e12

metro_area = "bayarea"
state = "California"
state_code = "CA"
country = "United States"

file_name = "citylists/" + metro_area + "cities.txt"
file = open(ROOT_DIR / file_name, "r")
text = file.read()
cities = text.splitlines()
# print(cities)



def get_populations(osm_ids):
    osm_ids_formatted = ' '.join([f'"{osm_id}"^^xsd:string' for osm_id in osm_ids])
    query = f"""
    SELECT ?osm_id ?population WHERE {{
        VALUES ?osm_id {{ {osm_ids_formatted} }} .
        ?city wdt:P402 ?osm_id .
        ?city wdt:P1082 ?population .
    }}
    """
    result = return_sparql_query_results(query)
    populations = result["results"]["bindings"]
    population_data = {}
    for item in populations:
        osm_id = item["osm_id"]["value"]
        population = item["population"]["value"]
        population_data.update({osm_id: population})
    return population_data


# go through every city --> get a dataframe from osmnx with the polygon
boundaries = []
populations = {}
names = {}
for i in range(0, len(cities)):
    city = cities[i]
    try:
        query = city + ", " + state + ", " + country
        city_gdf = ox.geocode_to_gdf(query)
        boundaries.append(city_gdf)
        name = city_gdf["name"].loc[city_gdf.index[0]]
        osm_id = city_gdf["osm_id"].loc[city_gdf.index[0]]
        names.update({osm_id: name})
    except Exception as e:
        print(f"Failed to get boundary or population for {city}: {e}")


populations_osm_id = get_populations(names.keys())
print(populations_osm_id)
for osm_id in names.keys():
    try:
        populations.update({names[osm_id]: populations_osm_id[str(osm_id)]})
    except Exception as e:
        print("Error with matching names to population:", e, names[osm_id])

# condense all of those polys into one data frame
boundaries = pd.concat(boundaries, ignore_index=True) 
print(boundaries)
boundaries.columns = [col[:10] for col in boundaries.columns]
boundaries.to_csv(ROOT_DIR / "boundaries.csv")
boundaries.to_file(ROOT_DIR / "boundaries.geojson", driver="GeoJSON")
boundaries.to_file(ROOT_DIR / "boundaries/boundaries.shp")
# take all the populations in the metro area and shove it into a json
file_name = "populations/" + metro_area + ".json"
with open(ROOT_DIR / file_name, "w") as outfile:
    json.dump(populations, outfile)


# there are currently no populations for the following citieshealdsburg
# sebastopol
# sonoma
# calistoga
# st. helena
# suisun city
# cloverdale
# yountville
# this is because the osmnx query brings up a way instead of a relation
# the population sqarql query relies on the osm RELATION id
# fix this

# gdf = gpd.read_file(ROOT_DIR / "boundaries/boundaries.shp")
# gdf.plot()
# plt.show()

# get the intersection between city polygons and earth's land polygon to clip off parts of city in water
land = gpd.read_file(ROOT_DIR / "land/ne_10m_land.shp")
clipped_boundaries = gpd.overlay(boundaries, land, how="intersection", keep_geom_type=False)
file_name = "clipped_boundaries/" + metro_area + ".geojson"
clipped_boundaries.to_file(ROOT_DIR / file_name, driver="GeoJSON")



