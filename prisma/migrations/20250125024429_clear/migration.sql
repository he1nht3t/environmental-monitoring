-- CreateTable
CREATE TABLE "EnvironmentalData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" REAL NOT NULL,
    "humidity" REAL NOT NULL,
    "soundIntensity" REAL NOT NULL,
    "rainIntensity" REAL NOT NULL,
    "co" REAL NOT NULL,
    "co2" REAL NOT NULL,
    "smoke" REAL NOT NULL,
    "nh3" REAL NOT NULL,
    "lpg" REAL NOT NULL,
    "benzene" REAL NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);
