/* eslint-disable prefer-const */
function CalculateSubmergedAreas(
  rower_weight_kg: number,
  rho: number,
  boat_length: number
) {
  let boat_depth,
    boat_rigged_weight,
    coxswain_weight,
    displaced_water_vol,
    oar_weight,
    submerged_cross_sectional_area,
    submerged_surface_area,
    total_boat_weight;
  oar_weight = 2.5;
  boat_rigged_weight = 112 / 2.2;
  coxswain_weight = 125 / 2.2;
  total_boat_weight =
    4 * rower_weight_kg + boat_rigged_weight + coxswain_weight + 4 * oar_weight;
  displaced_water_vol = total_boat_weight / rho;
  boat_depth = Math.sqrt((Math.sqrt(3) * displaced_water_vol) / boat_length);
  submerged_surface_area = (4 * boat_length * boat_depth) / Math.sqrt(3);
  submerged_cross_sectional_area = Math.pow(boat_depth, 2) / Math.sqrt(3);
  return [submerged_surface_area, submerged_cross_sectional_area];
}

export function WeightAdjustment(
  distance_m: number,
  minutes: number,
  seconds: number,
  rower_weight_kg: number
) {
  let D_fric,
    D_hydro,
    F_rowing,
    Re,
    boat_length,
    drag_coeff_hydro,
    drag_coeff_skin_fric,
    mu,
    reference_rower_weight_kg,
    rho,
    submerged_cross_sectional_area,
    submerged_cross_sectional_area_ref,
    submerged_surface_area,
    submerged_surface_area_ref,
    time_adjusted_sec,
    v,
    v_adjusted;
  reference_rower_weight_kg = 270 / 2.2;
  drag_coeff_hydro = 0.04;
  rho = 998;
  mu = 0.001;
  boat_length = 13.58;
  v = distance_m / (minutes * 60 + seconds);
  Re = (rho * v * boat_length) / mu;
  [submerged_surface_area_ref, submerged_cross_sectional_area_ref] =
    CalculateSubmergedAreas(reference_rower_weight_kg, rho, boat_length);
  drag_coeff_skin_fric = 0.027 / Math.pow(Re, 1 / 7);
  D_fric =
    (1 / 2) *
    drag_coeff_skin_fric *
    rho *
    Math.pow(v, 2) *
    submerged_surface_area_ref;
  D_hydro =
    (1 / 2) *
    drag_coeff_hydro *
    rho *
    Math.pow(v, 2) *
    submerged_cross_sectional_area_ref;
  F_rowing = D_fric + D_hydro;
  [submerged_surface_area, submerged_cross_sectional_area] =
    CalculateSubmergedAreas(rower_weight_kg, rho, boat_length);
  v_adjusted = Math.sqrt(
    (2 * F_rowing) /
      (rho *
        (drag_coeff_skin_fric * submerged_surface_area +
          drag_coeff_hydro * submerged_cross_sectional_area))
  );
  time_adjusted_sec = distance_m / v_adjusted;
  const minutes_adjusted = Math.floor(time_adjusted_sec / 60);
  console.log(distance_m, v_adjusted, minutes_adjusted);
  const seconds_adjusted = Math.round(
    time_adjusted_sec - minutes_adjusted * 60
  );
  return [minutes_adjusted, seconds_adjusted];
}

export function C2WeightAdjustment(
  distance: number,
  minutes: number,
  seconds: number,
  weight_lbs: number
) {
  let Wf, time_adjusted_sec;
  Wf = Math.pow(weight_lbs / 270, 0.222);
  time_adjusted_sec = (minutes * 60 + seconds) * Wf;
  const minutes_adjusted = Math.floor(time_adjusted_sec / 60);
  const seconds_adjusted = Math.round(
    time_adjusted_sec - minutes_adjusted * 60
  );
  return [minutes_adjusted, seconds_adjusted];
}
