# Original code by Cal Brooks

import math

def CalculateSubmergedAreas(rower_weight_kg, rho, boat_length):
    # Boat weight assumptions
    oar_weight = 2.5 # kg
    boat_rigged_weight = 112/2.2 # 112 lbs in kg, https://www.pocock.com/shells/hypercarbon-k4/
    coxswain_weight = 125/2.2 # 125 lbs in kg
    # Not used boat_width = 0.47 # meters, https://www.empacher.com/en/products/racing-boats/empacher-racing-four
    # Calculate submerged surface area & cross sectional area
    total_boat_weight = 4*rower_weight_kg+boat_rigged_weight+coxswain_weight+4*oar_weight
    displaced_water_vol = total_boat_weight/rho
    boat_depth = math.sqrt(math.sqrt(3)*displaced_water_vol/boat_length) # volume of triangular prism = depth^2*length/sqrt(3)
    submerged_surface_area = 4*boat_length*boat_depth/math.sqrt(3) # side length of equilateral triangle = 2*depth/sqrt(3), 2 sides
    submerged_cross_sectional_area = math.pow(boat_depth,2)/math.sqrt(3)
    # print(f"depth = {boat_depth}, SA = {submerged_surface_area}, XA ={submerged_cross_sectional_area}")
    return submerged_surface_area, submerged_cross_sectional_area

def WeightAdjustment(distance_m, minutes, seconds, rower_weight_kg):
    # Assumptions
    reference_rower_weight_kg = 270/2.2 # 270 lbs in kg, use same reference weight as C2
    drag_coeff_hydro = 0.04 # This value is a pretty sketchy guess based on this forum: https://www.boatdesign.net/threads/calculating-friction-resistance-drag-coefficient.62553/
    rho = 998 # kg/m^3, fresh water http://web.mit.edu/2.016/www/handouts/2005intro_1x.pdf
    mu = 0.001 # pascal-seconds, dynamic viscosity of water
    boat_length = 13.58 # meters, https://www.empacher.com/en/products/racing-boats/empacher-racing-four
    # Calculate boatspeed
    v = distance_m/(minutes*60+seconds)
    # Calculate Reynolds number
    Re = rho*v*boat_length/mu # treat boat as a foil in a flow of water: https://en.wikipedia.org/wiki/Reynolds_number#Flow_around_airfoils
    # Calculate areas for reference weight rowers
    submerged_surface_area_ref, submerged_cross_sectional_area_ref = CalculateSubmergedAreas(reference_rower_weight_kg, rho, boat_length)
    # Calculate skin friction drag. Approximate coefficient using Prandtl's 1/7 power law: https://en.wikipedia.org/wiki/Skin_friction_drag#Prandtl's_one-seventh-power_law
    drag_coeff_skin_fric = 0.027/math.pow(Re,(1/7))
    D_fric = 1/2*drag_coeff_skin_fric*rho*math.pow(v,2)*submerged_surface_area_ref # Should be an area integral but assume nothing varies across the surface
    # Calculate hydrodynamic (pressure) drag (https://ocw.mit.edu/courses/2-20-marine-hydrodynamics-13-021-spring-2005/pages/lecture-notes/, L15 & L16)
    D_hydro = 1/2*drag_coeff_hydro*rho*math.pow(v,2)*submerged_cross_sectional_area_ref
    # Rowing force = drag force with reference rower weights
    F_rowing = D_fric + D_hydro
    submerged_surface_area, submerged_cross_sectional_area = CalculateSubmergedAreas(rower_weight_kg, rho, boat_length)
    # Solve for v_adjusted (assume that Reynolds number doesn't change significantly so skin friction drag coeff is constant)
    v_adjusted = math.sqrt(2*F_rowing/(rho*(drag_coeff_skin_fric*submerged_surface_area+drag_coeff_hydro*submerged_cross_sectional_area)))
    # print(f"v = {v}, v_adj = {v_adjusted}")
    # Calculate adjusted time & return values
    time_adjusted_sec = distance_m/v_adjusted
    minutes_adjusted = math.floor(time_adjusted_sec/60) 
    seconds_adjusted = round(time_adjusted_sec - minutes_adjusted*60,1)
    return (minutes_adjusted, seconds_adjusted)

def C2WeightAdjustment(distance, minutes, seconds, weight_lbs):
    # distance not actually needed
    Wf = math.pow(weight_lbs/270,.222)
    time_adjusted_sec = (minutes*60+seconds)*Wf
    minutes_adjusted = math.floor(time_adjusted_sec/60)
    seconds_adjusted = round(time_adjusted_sec - minutes_adjusted*60,1) 
    return(minutes_adjusted, seconds_adjusted)


if __name__ == "__main__":

    distance_m = 5000 # distance of piece in meters 
    minutes = 17 # minutes of time of piece
    seconds = 37.0 # seconds of time of piece 
    rower_weight_lbs = 192.4 # weight of rower in lbs 
    rower_weight_kg = rower_weight_lbs/2.2

    minutes_adjusted, seconds_adjusted = WeightAdjustment(distance_m, minutes, seconds, rower_weight_kg)
    print(f"Weight-adjusted time for {distance_m} meter piece: {minutes_adjusted}:{seconds_adjusted}")

    minutes_adjusted, seconds_adjusted = C2WeightAdjustment(distance_m, minutes, seconds, rower_weight_lbs)
    print(f"Concept 2 weight-adjusted time for {distance_m} meter piece: {minutes_adjusted}:{seconds_adjusted}")






