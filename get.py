import osmnx as ox
import pandas as pd
import geopandas as gpd
from pathlib import Path
import matplotlib.pyplot as plt


ROOT_DIR = Path(__file__).parent

ox.settings.log_console = True
ox.settings.max_query_area_size = 25e12

def get_cities_in_county(county_name):
    county_boundary = ox.geocode_to_gdf(county_name + " County, United States")
    county_polygon = county_boundary.geometry.iloc[0]
    subareas = ox.geometries_from_polygon(county_polygon, tags={"place": ["city", "town", "village", "CDP"]})
    subareas = subareas[subareas.within(county_polygon)] # make sure that the cities are fully within the county
    subarea_names = subareas["name"].unique()
    return subarea_names

file = open(ROOT_DIR / "bayareacities.txt", "r")
text = file.read()
cities = text.splitlines()
# print(cities)

boundaries = []
for i in range(0, len(cities)):
    city = cities[i]
    try:
        city_gdf = ox.geocode_to_gdf(city + ", California, United States")
        boundaries.append(city_gdf)
    except Exception as e:
        print(f"Failed to get boundary for {city}: {e}")
boundaries = pd.concat(boundaries, ignore_index=True)
print(boundaries)
boundaries.columns = [col[:10] for col in boundaries.columns]
boundaries.to_file(ROOT_DIR / "boundaries.geojson", driver="GeoJSON")
boundaries.to_file(ROOT_DIR / "boundaries/boundaries.shp")

# gdf = gpd.read_file(ROOT_DIR / "boundaries/boundaries.shp")
# gdf.plot()
# plt.show()

land = gpd.read_file(ROOT_DIR / "land/ne_10m_land.shp")
clipped_boundaries = gpd.overlay(boundaries, land, how="intersection", keep_geom_type=False)
clipped_boundaries.to_file(ROOT_DIR / "clipped_boundaries/clipped_boundaries.geojson", driver="GeoJSON")