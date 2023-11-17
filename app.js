const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dataBasePath = path.join(__dirname, "cricket_team.db");

const app = express();

app.use(express.json());
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("server is running"));
  } catch (e) {
    console.log(`message: ${e.message}`);
    process.exit(1);
  }
};

initialize();

const objectToResponsiveObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT * 
    FROM 
    cricket_team;`;
  const playerTeam = await db.all(playersQuery);
  response.send(
    playerTeam.map((eachPlayer) => objectToResponsiveObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const newPlayer = `
    INSERT INTO
    cricket_team(player_name, jersey_number, role)
    VALUES 
('${playerName}', ${jerseyNumber},'${role}');`;
  await db.run(newPlayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const data = `
    SELECT * 
    FROM cricket_team 
     WHERE player_id = ${playerId};`;
  const dataPlay = await db.all(data);
  response.send(objectToResponsiveObject(dataPlay));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayer = `
      UPDATE 
     cricket_team
      SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
      WHERE 
      player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const data2 = `
    DELETE  
    FROM cricket_team 
    WHERE 
    player_id = ${playerId};`;
  await db.run(data2);
  response.send("player Removed");
});

module.exports = app;
