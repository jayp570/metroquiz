import osmnx as ox
import pandas as pd
import geopandas as gpd
from pathlib import Path
import matplotlib.pyplot as plt
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



def get_population(name):
    gc = geonamescache.GeonamesCache()
    cities = gc.get_cities()
    for city_id, city_data in cities.items():
        if city_data["name"].lower() == name.lower() and city_data["admin1code"] == state_code:
            return city_data.get("population", "Pop data not available")
    return "city not found"

# go through every city --> get a dataframe from osmnx with the polygon
boundaries = []
populations = {}
for i in range(0, len(cities)):
    city = cities[i]
    try:
        city_gdf = ox.geocode_to_gdf(city + ", " + state + ", " + country)
        boundaries.append(city_gdf)
        name = city_gdf["name"].loc[city_gdf.index[0]]
        pop = get_population(name)
        populations.update({name: pop})
    except Exception as e:
        print(f"Failed to get boundary or population for {city}: {e}")

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

# gdf = gpd.read_file(ROOT_DIR / "boundaries/boundaries.shp")
# gdf.plot()
# plt.show()

# get the intersection between city polygons and earth's land polygon to clip off parts of city in water
land = gpd.read_file(ROOT_DIR / "land/ne_10m_land.shp")
clipped_boundaries = gpd.overlay(boundaries, land, how="intersection", keep_geom_type=False)
file_name = "clipped_boundaries/" + metro_area + ".geojson"
clipped_boundaries.to_file(ROOT_DIR / file_name, driver="GeoJSON")



