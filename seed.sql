-- Add latitude and longitude columns to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS latitude decimal;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS longitude decimal;

-- Insert your two starter locations
INSERT INTO locations (name, description, latitude, longitude, color)
VALUES 
  (
    'Bliss & 46th — The Gateway',
    'Street-level view from beneath the elevated rail viaduct portal, framing the iconic Sunnyside arch and the 7 train station entrance. A threshold between the subway and the street life of Sunnyside.',
    40.7441,
    -73.9228,
    '#C8873A'
  ),
  (
    'Bliss Street Crossing',
    'Pedestrian crossing beneath the monumental concrete rail viaduct at 46th Street — the great arch that frames daily life in Sunnyside. A gathering point where the neighborhood comes together.',
    40.7443,
    -73.9225,
    '#3D6B5A'
  );
