// VERSION 1.18.11
// SECTION GUIDE – What Each Section Does:

// J0 – Shows a welcome message with game instructions when the page loads.

// J1 – Loads the images for the ship, including stretched and exploded versions.

// J2 – Sets up the background starfield, like stars you fly past.

// J3 – Gets the canvas ready and adjusts for screen size.

// J4 – Randomly creates thousands of stars for the starfield background.

// J5 – Resizes the game when the player resizes the window.

// J6 – Defines game constants like gravity, speed of light, and sets up ship explosion and glow effects.

// J6.1 – Central config object + utility functions. Stores constants and defines the "universe": black hole, blue planet, and ship.

// J7 – Sets up the black hole with mass and radius (event horizon calculation).

// J8 – Sets up the blue planet with gravity and size based on mass.

// J9 – Sets up the player’s ship with position, fuel, velocity, and size.

// J10 – Controls game mechanics like fuel consumption, propulsion, and reverse thrust.

// J11 – Handles delay logic when the player resets the game so it doesn't respawn immediately.

// J12 – Sets up mouse and touch controls for movement buttons.

// J13 – Hooks up controls to the buttons: propel, reverse, and reset.

// J14 – Controls pause and resume logic when the pause button is clicked.

// J15 – Sets up how long it takes to deposit fuel when landing.

// J16 – Resets the ship position and values when "Redeploy" is pressed or after crash.

// J17 – Checks if the ship hits the black hole or crashes into the blue planet too fast.

// J18 – Main game logic: handles collecting fuel and moving the ship using gravity or thrust.

// J18.1 – Handles asteroid movement, black hole absorption, and glow effects when asteroids fall in.

// J19 – Respawns the ship randomly if it falls in the black hole but not right after a reset.

// J20 – Detects when the ship lands safely on the planet and transfers fuel into score.

// J21 – Shows alert when you're out of fuel.

// J22 – Moves the ship using thrust or gravity from the black hole and blue planet.

// J23 – Updates ship’s position and shows a landing speed warning when near the blue planet.

// J24 – Draws the grid background to help with motion sense.

// J25 – Renders laser shots, background stars, and updates the UI.

// J26 – Sets the camera view centered on the ship to draw everything relative to the player.

// J27 – Draws the glowing ring (accretion disk) around the black hole.

// J28 – Draws the blue planet on the screen.

// J29 – Draws the ship and all asteroids (including stretch/explosion effects).

// J29.1 – Helper function to draw asteroids (used in Section J29).

// J30 – Updates mass text at the top of the screen.

// J30.1 – Updates all UI info (distance, fuel, speed, score).

// J31 – Main game loop: updates the game every frame unless paused.

// J32 – Loads asteroid images and places them randomly near the black hole.

// J32.1 – Creates particles for the glowing ring around the black hole.

// J33 – Adds the laser firing system and lets lasers destroy asteroids.

// J34 – Central place to update the UI: alerts, counters, score, etc.


window.addEventListener('DOMContentLoaded', () => {


// *****Section J0 - Code Reference Point – Start******
window.addEventListener('load', () => {
  alert(`Welcome to Blackhole Run! VERSION 1.18.2

THIS GAME IS IN BETA – FEATURES ARE STILL BEING DEVELOPED

AIM OF GAME:
- Collect fuel by getting close to the Black Hole then return the fuel to the Blue Planet

How To Play:
-Use the LEFT THRUST button to avoid getting sucked in the Black Hole.
-Use the RIGHT THRUST button to move closer to the Black Hole.
-Use the LEFT THRUST button to travel to the Blue Planet.
-Use the RIGHT THRUST button to slow down to 149 px/s to land on the Blue Planet.
-Use the REDEPLOY button to redeploy next to the Black Hole
-Click on the asteroids on the screen to destroy them with your laser

Good luck, Pilot!`);

  updateUI(); // safely initialize all new counters
});
// *****Section J0 - Code Reference Point – Finish******


  
// *****Section J1  - Code Reference Point – Start******

    // === SHIP IMAGE HANDLING ===
    const shipImage = new Image();
    const shipImageStretched = new Image();
    const shipImageExplosion = new Image();
    let imageLoaded = false;
    let shipStretchedLoaded = false;
    let shipExplosionLoaded = false;

    shipImage.onload = () => imageLoaded = true;
    shipImage.onerror = () => imageLoaded = false;
    shipImage.src = './assets/images/playerShip.png';

    shipImageStretched.onload = () => shipStretchedLoaded = true;
    shipImageStretched.onerror = () => shipStretchedLoaded = false;
    shipImageStretched.src = './assets/images/playerShip_stretched.png';

    shipImageExplosion.onload = () => shipExplosionLoaded = true;
    shipImageExplosion.onerror = () => shipExplosionLoaded = false;
    shipImageExplosion.src = './assets/images/playerShip_explosion.png';

// *****Section J1  - Code Reference Point – Finish******



// *****Section J2  - Code Reference Point – Start******

    // === STARFIELD CONFIG ===
    const STAR_COUNT = 100000;         // Adjust star density
    const STARFIELD_WIDTH = 25000;     // Adjust starfield width (px)
    const STARFIELD_HEIGHT = 900;      // Adjust starfield height (px)
    const PARALLAX_FACTOR = 0.2;       // Adjust movement shipSpeed (0-1)
	
// *****Section J2  - Code Reference Point – Finish******

// *****Section J3  - Code Reference Point – Start******

    // === GAME INITIALIZATION ===
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const hudHeight = 140; // Estimate HUD + footer height
    let width = window.innerWidth;
    let height = window.innerHeight - hudHeight;
    canvas.width = width;
    canvas.height = height;

// *****Section J3  - Code Reference Point – Finish******

// *****Section J4  - Code Reference Point – Start******

    // === STARFIELD SETUP ===
    let stars = [];
    for(let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * STARFIELD_WIDTH - STARFIELD_WIDTH/2,
        y: Math.random() * STARFIELD_HEIGHT - STARFIELD_HEIGHT/2,
        size: Math.random() * 1.5
      });
    }

// *****Section J4  - Code Reference Point – Finish******

// *****Section J5  - Code Reference Point – Start******

    // === WINDOW RESIZE HANDLER ===
    window.addEventListener('resize', () => {
      const hudHeight = 140;
      width = window.innerWidth;
      height = window.innerHeight - hudHeight;
      canvas.width = width;
      canvas.height = height;
    });

// *****Section J5  - Code Reference Point – Finish******

// *****Section J6 - Code Reference Point – Start******

    // === GAME OBJECTS ===
    // Gravitational constant (scaled for game physics)
    const G_scaled = 500; // EDIT: Increase for stronger gravity 
    // shipSpeed of light constant (scaled for black hole calculations)
    const c_scaled = 1000; // EDIT: Increase for larger black hole radius

    let currentScore = 0; // Score counter

    let isShipStretching = false;
    const STRETCH_DISTANCE = 100; // Stretch trigger zone before black hole event horizon
    let stretchingAsteroids = new Set();

    // === SHIP EXPLOSION FLAG ===
    let isShipExploding = false;

    // === ACCRETION DISK PARTICLES ===
    const ACCRETION_PARTICLE_COUNT = 600;
    let accretionParticles = [];
    let diskGlow = 0.1; // Start slightly brighter

// *****Section J6 - Code Reference Point – Finish******



// *****Section J6.1 - Code Reference Point – Start******
// === GLOBAL CONFIGURATION & UTILITIES ===

const CONFIG = {
  gravityConstant: 500,
  lightSpeed: 1000,
  initialFuel: 50,
  fuelCollectionRate: 30,
  fuelCollectionDistance: 450,
  fuelConsumptionRate: 20,
  pushStrength: 300,
  reverseStrength: 300,
  depositDelay: 2000,
  stretchDistance: 100,
};

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function getSpeed(vx, vy) {
  return Math.sqrt(vx ** 2 + vy ** 2);
}

// Game state container
const GameState = {
  blackHole: {
    x: 0,
    y: 0,
    mass: 100000,
    get radius() {
      return (2 * CONFIG.gravityConstant * this.mass) / (CONFIG.lightSpeed ** 2);
    }
  },
  bluePlanet: {
    x: 35000,
    y: 0,
    mass: 3000,
    get radius() {
      return 50 * Math.pow(this.mass, 0.27);
    },
    get gravityPull() {
      return CONFIG.gravityConstant * this.mass;
    }
  },
  playerShip: {
    x: 1200,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 15,
    mass: 1,
    fuel: CONFIG.initialFuel,
    fuelDeposited: 0
  }
};
// *****Section J6.1 - Code Reference Point – Finish******





// *****Section J7  - Code Reference Point – Start******

    // Black hole object with computed property
    let blackHole = {
      x: 0, // Center of the universe
      y: 0,
      mass: 100000, // EDIT: Increase for stronger gravitational pull
      get radius() {
        // Schwarzschild radius formula: (2GM)/c²
        // This defines the event horizon of a black hole.
        return (2 * G_scaled * this.mass) / (c_scaled * c_scaled);
      }
    };


// *****Section J7  - Code Reference Point – Finish******

// *****Section J8  - Code Reference Point – Start******

    // Blue planet object with gravitational pull calculation
    let bluePlanet = {
      x: 35000, // Distance from black hole (in game units)
      y: 0,     // Same y as black hole for simplicity
      mass: 3000, // EDIT: Increase for stronger planetary gravity
      // Compute the blue planet's radius using an empirical mass–radius relationship:
      // R = K * (M)^0.27
      // K is a constant chosen for game scaling. Here we choose K = 50.
      // The exponent 0.27 is taken from empirical studies of rocky planets.
      get radius() {
        return 50 * Math.pow(this.mass, 0.27);
      },
      get gravityPull() {
        // Gravity force based on Newton's law: F = G * m
        return G_scaled * this.mass;
      }
    };

// *****Section J8  - Code Reference Point – Finish******

// *****Section J9  - Code Reference Point – Start******

    // Player ship object with physics properties
    let playerShip = {
      x: 1200,      // Starting x position (fixed)
      y: 0,         // Starting y position (fixed)
      vx: 0,        // Velocity in x direction
      vy: 0,        // Velocity in y direction
      radius: 15,   // EDIT: Increase for larger ship collision area
      mass: 1,      // EDIT: Increase for heavier ship (affects movement)
      fuel: 50,     // EDIT: Increase starting fuel
      fuelDeposited: 0
    };


// *****Section J9  - Code Reference Point – Finish******

// *****Section J10  - Code Reference Point – Start******

    // === GAME MECHANICS ===
    const fuelConsumptionRate = 20;  // EDIT: Increase for faster fuel usage
    const fuelCollectionRate = 30;   // EDIT: Increase for faster fuel collection
    const fuelCollectionDistance = 450; // EDIT: Increase for larger collection range
    const pushStrength = 300;        // EDIT: Increase for stronger propulsion
    const reverseStrength = 300;     // EDIT: Increase for stronger reverse thrust
    let isPropelling = false;
    let isReversing = false;
	
// *****Section J10  - Code Reference Point – Finish******	

// *****Section J11  - Code Reference Point – Start******

    // Flag and timestamp to prevent random respawn immediately after reset
    let justReset = false;
    let resetTime = 0;
	
// *****Section J11  - Code Reference Point – Finish******	

// *****Section J12  - Code Reference Point – Start******

    // === TOUCH AND MOUSE EVENT HANDLERS ===
    function setupButtonEvents(button, action) {
      // Mouse events
      button.addEventListener('mousedown', () => action(true));
      button.addEventListener('mouseup', () => action(false));
      button.addEventListener('mouseleave', () => action(false));
      // Touch events
      button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        action(true);
      });
      button.addEventListener('touchend', () => action(false));
      button.addEventListener('touchcancel', () => action(false));
    }

// *****Section J12  - Code Reference Point – Finish******

// *****Section J13  - Code Reference Point – Start******

    // Setup button events for Propel and Reverse
    setupButtonEvents(document.getElementById('propelButton'), (state) => isPropelling = state);
    setupButtonEvents(document.getElementById('reverseButton'), (state) => isReversing = state);
    document.getElementById('resetButton').addEventListener('click', () => resetGame());
	
// *****Section J13 - Code Reference Point – Finish******

// *****Section J14  - Code Reference Point – Start******

    // NEW: Start/Pause Button setup
    // The game will start in a running state.
    let gamePaused = false;
    const startPauseButton = document.getElementById('startPauseButton');
    startPauseButton.addEventListener('click', () => {
      gamePaused = !gamePaused;
      // Toggle button text between "Pause" and "Start"
      startPauseButton.textContent = gamePaused ? "Start" : "Pause";
    });

// *****Section J14  - Code Reference Point – Finish******

// *****Section J15  - Code Reference Point – Start******

    // === GAME FUNCTIONS ===
    let depositStartTime = null;
    const depositDelay = 2000; // EDIT: Increase for longer landing alert

// *****Section J15  - Code Reference Point – Finish******

// *****Section J16  - Code Reference Point – Start******

function resetGame() {
  // Reset player ship to a fixed starting position with zero velocity
  playerShip.x = 1200;
  playerShip.y = 0;
  playerShip.vx = 0;
  playerShip.vy = 0;
  playerShip.radius = 15;
  playerShip.mass = 1;
  playerShip.fuel = 50;
  playerShip.fuelDeposited = 0;

  // FIX: Clear any leftover propulsion flags and deposit timing to prevent random thrust after reset
  isPropelling = false;
  isReversing = false;
  depositStartTime = null;

  // NEW: Reset ship explosion state
  isShipExploding = false;

  // DO NOT reset currentScore here anymore – crash logic will handle it instead

  // Set flag and timestamp to prevent immediate black hole respawn effects after reset
  justReset = true;
  resetTime = performance.now();

  // NEW: Reinitialize asteroids on game reset
  initializeAsteroids();
}

// *****Section J16  - Code Reference Point – Finish******







// *****Section J17  - Code Reference Point – Start******

    // Function to check collisions for game over events
    function checkCollisions() {
      // Calculate distance from ship to black hole using the Pythagorean theorem
      const bhDist = Math.sqrt((blackHole.x - playerShip.x) ** 2 + (blackHole.y - playerShip.y) ** 2);
      if (bhDist < blackHole.radius + playerShip.radius) {
        alert("You have Fallen into the Black Hole and have been Spaghettified, Game Over!!");
        playerShip.fuel = 0;
        currentScore = 0; // Reset score on black hole death
        UI.updateScore(currentScore);
        resetGame();
        return;
      }

      // Calculate distance from ship to blue planet
      const bpDist = Math.sqrt((bluePlanet.x - playerShip.x) ** 2 + (bluePlanet.y - playerShip.y) ** 2);
      const shipSpeed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
      if (bpDist < bluePlanet.radius + playerShip.radius && shipSpeed > 150 && !isShipExploding) {
        isShipExploding = true;

        // === Freeze the ship's position and motion ===
        playerShip.vx = 0;
        playerShip.vy = 0;

        // Optionally adjust position to lock at impact point (keep explosion centered)
        const directionX = playerShip.x - bluePlanet.x;
        const directionY = playerShip.y - bluePlanet.y;
        const magnitude = Math.sqrt(directionX ** 2 + directionY ** 2);
        const distanceToEdge = bluePlanet.radius + playerShip.radius;
        if (magnitude !== 0) {
          playerShip.x = bluePlanet.x + (directionX / magnitude) * distanceToEdge;
          playerShip.y = bluePlanet.y + (directionY / magnitude) * distanceToEdge;
        }

        // Delay the reset to allow explosion image to render
        setTimeout(() => {
          alert("You have entered the Blue Planet's Atmosphere Too Fast! You have Crashed Your Ship and Lost All Your Fuel, Game Over!!!!");
          playerShip.fuel = 0;
          currentScore = 0; // Reset score on crash
          UI.updateScore(currentScore);
          resetGame();
        }, 500);
      }
    }

// *****Section J17  - Code Reference Point – Finish******




      // Calculate distance from ship to blue planet
      const bpDist = Math.sqrt((bluePlanet.x - playerShip.x) ** 2 + (bluePlanet.y - playerShip.y) ** 2);
      const shipSpeed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
      if (bpDist < bluePlanet.radius + playerShip.radius && shipSpeed > 150) {
        alert("You have entered the Blue Planet's Atmosphere Too Fast! You have Crashed Your Ship and Lost All Your Fuel, Game Over!!!!");
        playerShip.fuel = 0;
        resetGame();
      }
    
	

// === [SECTION: UPDATE LOGIC] ===
// --- Modular update loop for game mechanics
// *****Section J18 - Code Reference Point – REFACTORED ******

function handleFuelCollection(deltaTime) {
  const bhDist = getDistance(GameState.blackHole.x, GameState.blackHole.y, GameState.playerShip.x, GameState.playerShip.y);
  let distanceFromField = Math.max(0, bhDist - GameState.blackHole.radius);
  if (distanceFromField <= CONFIG.fuelCollectionDistance) {
    GameState.playerShip.fuel += CONFIG.fuelCollectionRate * deltaTime;
    UI.showAlert('top', 'Collecting Fuel from Black Hole...');
  } else {
    UI.hideAlert('top');
  }
}

function handlePhysics(deltaTime) {
  const bhDist = getDistance(GameState.blackHole.x, GameState.blackHole.y, GameState.playerShip.x, GameState.playerShip.y);
  const bpDist = getDistance(GameState.bluePlanet.x, GameState.bluePlanet.y, GameState.playerShip.x, GameState.playerShip.y);

  if (isPropelling && GameState.playerShip.fuel > 0) {
    const dirX = GameState.playerShip.x - GameState.blackHole.x;
    const dirY = GameState.playerShip.y - GameState.blackHole.y;
    const magnitude = Math.sqrt(dirX ** 2 + dirY ** 2);
    if (magnitude !== 0) {
      GameState.playerShip.vx += (dirX / magnitude) * CONFIG.pushStrength * deltaTime;
      GameState.playerShip.vy += (dirY / magnitude) * CONFIG.pushStrength * deltaTime;
      GameState.playerShip.fuel = Math.max(0, GameState.playerShip.fuel - CONFIG.fuelConsumptionRate * deltaTime);
    }
  } else if (isReversing && GameState.playerShip.fuel > 0) {
    const dirX = GameState.blackHole.x - GameState.playerShip.x;
    const dirY = GameState.blackHole.y - GameState.playerShip.y;
    const magnitude = Math.sqrt(dirX ** 2 + dirY ** 2);
    if (magnitude !== 0) {
      GameState.playerShip.vx += (dirX / magnitude) * CONFIG.reverseStrength * deltaTime;
      GameState.playerShip.vy += (dirY / magnitude) * CONFIG.reverseStrength * deltaTime;
      GameState.playerShip.fuel = Math.max(0, GameState.playerShip.fuel - CONFIG.fuelConsumptionRate * deltaTime);
    }
  } else {
    const bhAccel = CONFIG.gravityConstant * GameState.blackHole.mass / (bhDist ** 2);
    const bpAccel = GameState.bluePlanet.gravityPull / (bpDist ** 2);
    GameState.playerShip.vx += ((GameState.blackHole.x - GameState.playerShip.x) / bhDist * bhAccel +
                                (GameState.bluePlanet.x - GameState.playerShip.x) / bpDist * bpAccel) * deltaTime;
    GameState.playerShip.vy += ((GameState.blackHole.y - GameState.playerShip.y) / bhDist * bhAccel +
                                (GameState.bluePlanet.y - GameState.playerShip.y) / bpDist * bpAccel) * deltaTime;
  }

  GameState.playerShip.x += GameState.playerShip.vx * deltaTime;
  GameState.playerShip.y += GameState.playerShip.vy * deltaTime;
}

function update(deltaTime) {
  handleFuelCollection(deltaTime);
  handlePhysics(deltaTime);
  checkCollisions(); // Already uses GameState internally in Stage 2
  updateAsteroids(deltaTime); // Will migrate in next stage
}
	

  function update(deltaTime) {
    const bhDist = Math.sqrt((blackHole.x - playerShip.x) ** 2 + (blackHole.y - playerShip.y) ** 2);
    const bpDist = Math.sqrt((bluePlanet.x - playerShip.x) ** 2 + (bluePlanet.y - playerShip.y) ** 2);

    // Stretch trigger if close to black hole
    if (bhDist < blackHole.radius + STRETCH_DISTANCE) {
      isShipStretching = true;
    } else {
      isShipStretching = false;
    }

    // Fuel system: Collect fuel when close to the black hole
    let distanceFromField = Math.max(0, bhDist - blackHole.radius);
    if (distanceFromField <= fuelCollectionDistance) {
      playerShip.fuel += fuelCollectionRate * deltaTime;
      UI.showAlert('top', 'Collecting Fuel from Black Hole...');
    } else {
      UI.hideAlert('top');
    }

    checkCollisions();
    updateAsteroids(deltaTime);
	
// *****Section J18  - Code Reference Point – Finish******


// === [SECTION: ASTEROID PHYSICS] ===
// --- Handles asteroid gravity, absorption, and stretch effects
// *****Section J18.1 - Code Reference Point – REFACTORED ******

function updateAsteroids(deltaTime) {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    const dx = GameState.blackHole.x - asteroid.x;
    const dy = GameState.blackHole.y - asteroid.y;
    const dist = getDistance(GameState.blackHole.x, GameState.blackHole.y, asteroid.x, asteroid.y);

    if (dist > 0) {
      const accel = (CONFIG.gravityConstant * GameState.blackHole.mass) / (dist * dist);
      asteroid.vx += (dx / dist) * accel * deltaTime;
      asteroid.vy += (dy / dist) * accel * deltaTime;
    }

    asteroid.x += asteroid.vx * deltaTime;
    asteroid.y += asteroid.vy * deltaTime;

    if (dist < GameState.blackHole.radius + CONFIG.stretchDistance) {
      stretchingAsteroids.add(i);
    }

    if (dist < GameState.blackHole.radius + asteroid.radius) {
      GameState.blackHole.mass += asteroid.mass;
      asteroids.splice(i, 1);
      diskGlow = Math.min(diskGlow + 0.1, 1.5);
    }
  }
}

// === ASTEROID PHYSICS: Gravity and Black Hole Absorption ===

function updateAsteroids(deltaTime) {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];

    // Vector from asteroid to black hole
    const dx = blackHole.x - asteroid.x;
    const dy = blackHole.y - asteroid.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Apply gravitational acceleration toward the black hole
    if (dist > 0) {
      const accel = (G_scaled * blackHole.mass) / (dist * dist);
      asteroid.vx += (dx / dist) * accel * deltaTime;
      asteroid.vy += (dy / dist) * accel * deltaTime;
    }

    // Update asteroid position
    asteroid.x += asteroid.vx * deltaTime;
    asteroid.y += asteroid.vy * deltaTime;

    // Detect proximity for stretch effect
    if (dist < blackHole.radius + STRETCH_DISTANCE) {
      stretchingAsteroids.add(i);
    }

    // Check if asteroid is consumed by the black hole
    if (dist < blackHole.radius + asteroid.radius) {
      blackHole.mass += asteroid.mass;
      asteroids.splice(i, 1); // Remove asteroid

      // BOOST DISK GLOW when something falls in
      diskGlow = Math.min(diskGlow + 0.1, 1.5); // brighter and capped higher
    }
  }
}

// *****Section J18.1 - Code Reference Point – Finish******




// *****Section J19  - Code Reference Point – Start******

      // Black hole respawn:
      // Only trigger respawn if NOT just reset (to prevent random spawn on restart)
      if (!justReset && bhDist < blackHole.radius + playerShip.radius) {
        const angle = Math.random() * 2 * Math.PI;
        const spawnDistance = blackHole.radius + 50 + Math.random() * 1200;
        playerShip.x = blackHole.x + Math.cos(angle) * spawnDistance;
        playerShip.y = blackHole.y + Math.sin(angle) * spawnDistance;
        playerShip.vx = 0;
        playerShip.vy = 0;
        playerShip.fuel = 50;
      }
      // After 1 second from reset, allow normal respawn behavior again
      if (justReset && performance.now() - resetTime > 1000) {
        justReset = false;
      }


// *****Section J19  - Code Reference Point – Finish******

// *****Section J20  - Code Reference Point – Start******

      // Landing sequence at blue planet
      if (bpDist < bluePlanet.radius + playerShip.radius) {
        const shipSpeed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
        if (shipSpeed <= 150) {
          if (!depositStartTime) depositStartTime = performance.now();
          if (performance.now() - depositStartTime >= depositDelay) {
            playerShip.fuelDeposited += playerShip.fuel;
            currentScore += playerShip.fuelDeposited;
            playerShip.fuel = 0;
            UI.updateScore(currentScore);
            alert(`You Have Landed Safely on the Blue Planet, Total Fuel Collected: ${playerShip.fuelDeposited.toFixed(1)}`);
            resetGame();
          }
        }
      } else {
        depositStartTime = null;
      }

// *****Section J20  - Code Reference Point – Finish******


// *****Section J21  - Code Reference Point – Start******

      // Display out-of-fuel alert if needed
      playerShip.fuel <= 0 ? UI.showAlert('bottom', 'OUT OF FUEL!') : UI.hideAlert('bottom');

// *****Section J21  - Code Reference Point – Finish******

// *****Section J22  - Code Reference Point – Start******

      // Movement controls: Apply thrust if propelling or reversing
      if (isPropelling && playerShip.fuel > 0) {
        const dirX = playerShip.x - blackHole.x;
        const dirY = playerShip.y - blackHole.y;
        const magnitude = Math.sqrt(dirX ** 2 + dirY ** 2);
        if (magnitude !== 0) {
          playerShip.vx += (dirX / magnitude) * pushStrength * deltaTime;
          playerShip.vy += (dirY / magnitude) * pushStrength * deltaTime;
          playerShip.fuel = Math.max(0, playerShip.fuel - fuelConsumptionRate * deltaTime);
        }
      } else if (isReversing && playerShip.fuel > 0) {
        const dirX = blackHole.x - playerShip.x;
        const dirY = blackHole.y - playerShip.y;
        const magnitude = Math.sqrt(dirX ** 2 + dirY ** 2);
        if (magnitude !== 0) {
          playerShip.vx += (dirX / magnitude) * reverseStrength * deltaTime;
          playerShip.vy += (dirY / magnitude) * reverseStrength * deltaTime;
          playerShip.fuel = Math.max(0, playerShip.fuel - fuelConsumptionRate * deltaTime);
        }
      } else {
        // Natural gravity from both black hole and blue planet
        const bhAccel = G_scaled * blackHole.mass / (bhDist ** 2);
        const bpAccel = bluePlanet.gravityPull / (bpDist ** 2);
        playerShip.vx += ((blackHole.x - playerShip.x) / bhDist * bhAccel +
                          (bluePlanet.x - playerShip.x) / bpDist * bpAccel) * deltaTime;
        playerShip.vy += ((blackHole.y - playerShip.y) / bhDist * bhAccel +
                          (bluePlanet.y - playerShip.y) / bpDist * bpAccel) * deltaTime;
      }

// *****Section J22  - Code Reference Point – Finish******

// *****Section J23  - Code Reference Point – Start******

      // Update ship's position based on its velocity
      playerShip.x += playerShip.vx * deltaTime;
      playerShip.y += playerShip.vy * deltaTime;

      // shipSpeed alerts: Show a message if near the blue planet and shipSpeed is too high
      const shipSpeed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
      if (bpDist < 10000) {
        shipSpeed > 150 ? UI.showAlert('speed', 'Slow down to 149px/s to land on the Blue Planet!') : UI.showAlert('speed', 'Ready to land!');
      } else {
        UI.hideAlert('speed');
      }
    }

// *****Section J23  - Code Reference Point – Finish******

// *****Section J24  - Code Reference Point – Start******

    // === RENDERING ===
    function drawGrid() {
      const gridSize = 50;
      const startX = playerShip.x - width / 2;
      const startY = playerShip.y - height / 2;

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Vertical lines
      for (let x = startX - (startX % gridSize); x < startX + width; x += gridSize) {
        ctx.moveTo(x - startX, 0);
        ctx.lineTo(x - startX, height);
      }
      // Horizontal lines
      for (let y = startY - (startY % gridSize); y < startY + height; y += gridSize) {
        ctx.moveTo(0, y - startY);
        ctx.lineTo(width, y - startY);
      }
      ctx.stroke();
    }

// *****Section J24  - Code Reference Point – Finish******

// *****Section J25  - Code Reference Point – Start******

    function render() {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
	  
	  // Draw lasers
		const now = performance.now();
		activeLasers = activeLasers.filter(laser => now - laser.createdAt < 200);
		ctx.save();
		ctx.translate(width / 2 - playerShip.x, height / 2 - playerShip.y);
			ctx.strokeStyle = 'red';
		ctx.lineWidth = 2;
		activeLasers.forEach(laser => {
		  ctx.beginPath();
		  ctx.moveTo(playerShip.x, playerShip.y);  // Dynamic origin
		  ctx.lineTo(laser.targetX, laser.targetY);
		  ctx.stroke();
		});

		ctx.restore();

      // Draw stars with parallax effect
      ctx.save();
      ctx.translate(width/2 - playerShip.x * PARALLAX_FACTOR, height/2 - playerShip.y * PARALLAX_FACTOR);
      ctx.fillStyle = '#FFF';
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();


    updateUI();
	
	// *****Section J25  - Code Reference Point – Finish******

// *****Section J26  - Code Reference Point – Start******

      // Draw game world relative to playerShip's position
      ctx.save();
      ctx.translate(width/2 - playerShip.x, height/2 - playerShip.y);

      drawGrid();

// *****Section J26  - Code Reference Point – Finish******

// *****Section J27  - Code Reference Point – Start******

      // Draw accretion disk particles (glowing ring around black hole)
      const glowAlpha = Math.min(diskGlow, 1.0); // Clamp alpha to browser-safe range
      ctx.fillStyle = `rgba(255, 150, 50, ${glowAlpha.toFixed(2)})`;

      const particleMultiplier = Math.floor((diskGlow / 0.5) * ACCRETION_PARTICLE_COUNT);

      for (let i = 0; i < particleMultiplier; i++) {
        const p = accretionParticles[i % accretionParticles.length];
        p.angle += p.rotationSpeed;
        const x = blackHole.x + Math.cos(p.angle) * p.radius;
        const y = blackHole.y + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw black hole (lighter shade)
      ctx.beginPath();
      ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI*2);
      ctx.fillStyle = '#222'; // Lighter black
      ctx.fill();

// *****Section J27  - Code Reference Point – Finish******



// *****Section J28  - Code Reference Point – Start******

      // Draw blue planet
      ctx.beginPath();
      ctx.arc(bluePlanet.x, bluePlanet.y, bluePlanet.radius, 0, Math.PI*2);
      ctx.fillStyle = 'blue';
      ctx.fill();
	  
// *****Section J28  - Code Reference Point – Finish******	  

// *****Section J29  - Code Reference Point – Start******

    // Draw player ship or red dot
    if (imageLoaded) {
      const imgSize = playerShip.radius * 2;
      let img = shipImage;

      if (isShipExploding && shipExplosionLoaded) {
        img = shipImageExplosion;
      } else if (isShipStretching && shipStretchedLoaded) {
        img = shipImageStretched;
      }

      ctx.drawImage(
        img,
        playerShip.x - imgSize,
        playerShip.y - imgSize,
        imgSize * 3,
        imgSize * 2
      );
    } else {
      ctx.beginPath();
      ctx.arc(playerShip.x, playerShip.y, playerShip.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    }

    // Draw asteroids
    drawAsteroids(ctx);
    // [Replaced inline asteroid drawing]
    for (let i = 0; i < asteroids.length; i++) {
      const asteroid = asteroids[i];
      const size = asteroid.radius * 2;
      const isStretched = stretchingAsteroids.has(i);
      const img = (isStretched && asteroidStretchedLoaded) ? asteroidImageStretched : asteroidImage;

      if ((isStretched && asteroidStretchedLoaded) || asteroidImageLoaded) {
        ctx.drawImage(
          img,
          asteroid.x - size,
          asteroid.y - size,
          size * 2,
          size * 2
        );
      } else {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'gray';
        ctx.fill();
      }
    }

    ctx.restore();

// *****Section J29  - Code Reference Point – Finish******

// *****Section J29.1 - Code Reference Point – Start******

function drawAsteroids(ctx) {
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    const size = asteroid.radius * 2;
    const isStretched = stretchingAsteroids.has(i);
    const img = (isStretched && asteroidStretchedLoaded) ? asteroidImageStretched : asteroidImage;

    if ((isStretched && asteroidStretchedLoaded) || asteroidImageLoaded) {
      ctx.drawImage(
        img,
        asteroid.x - size,
        asteroid.y - size,
        size * 2,
        size * 2
      );
    } else {
      ctx.beginPath();
      ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'gray';
      ctx.fill();
    }
  }
}

// *****Section J29.1 - Code Reference Point – Finish******






// *****Section J30  - Code Reference Point – Start******

      // UI TEXT: Each piece of info on a new line using <br>
      updateUI();
	  
	  document.getElementById('blackHoleMass').textContent =
		`Blackhole Mass: ${blackHole.mass.toFixed(0)}`;

	 
    }



// *****Section J30  - Code Reference Point – Finish******
// *****Section J30.1 - Code Reference Point – Start******
function updateUI() {
  const ship = playerShip;
  const bhDist = getDistance(blackHole.x, blackHole.y, ship.x, ship.y);
  const bpDist = getDistance(bluePlanet.x, bluePlanet.y, ship.x, ship.y);
  const speed = getSpeed(ship.vx, ship.vy);

  document.getElementById('bhDistance').textContent = `Black Hole: ${bhDist.toFixed(2)}px`;
  document.getElementById('bpDistance').textContent = `Blue Planet: ${bpDist.toFixed(2)}px`;
  document.getElementById('fuelLevel').textContent = `Fuel: ${ship.fuel.toFixed(2)}`;
  document.getElementById('shipSpeed').textContent = `Speed: ${speed.toFixed(2)}px/s`;
  document.getElementById('blackHoleMass').textContent = `Blackhole Mass: ${blackHole.mass.toFixed(0)}`;
  document.getElementById('scoreCounter').textContent = `Score: ${currentScore.toFixed(0)}`;
}
// *****Section J30.1 - Code Reference Point – Finish*******







// *****Section J31  - Code Reference Point – Start******

    // === GAME LOOP ===
    let lastTime = performance.now();
    function gameLoop(now) {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Only update and render if the game is not paused
      if (!gamePaused) {
        update(deltaTime);
        render();
      }
      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
	


// *****Section J31  - Code Reference Point – Finish******

// *****Section J32 - Code Reference Point – Start******
// === ASTEROID SETUP AND DRAWING ===

const ASTEROID_COUNT = 1500;
const ASTEROID_SPREAD_X = 25000;  // Editable spread range in x-direction
const ASTEROID_SPREAD_Y = 1000;   // Editable spread range in y-direction

const asteroidImage = new Image();
const asteroidImageStretched = new Image();
let asteroidImageLoaded = false;
let asteroidStretchedLoaded = false;

asteroidImage.onload = () => asteroidImageLoaded = true;
asteroidImage.onerror = () => asteroidImageLoaded = false;
asteroidImage.src = './assets/images/asteroid.png';

asteroidImageStretched.onload = () => asteroidStretchedLoaded = true;
asteroidImageStretched.onerror = () => asteroidStretchedLoaded = false;
asteroidImageStretched.src = './assets/images/asteroid_stretched.png';

let asteroids = [];

function initializeAsteroids() {
  asteroids = [];
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const offsetX = Math.random() * ASTEROID_SPREAD_X * 2 - ASTEROID_SPREAD_X;
    const offsetY = Math.random() * ASTEROID_SPREAD_Y * 2 - ASTEROID_SPREAD_Y;
    asteroids.push({
      x: blackHole.x + offsetX,
      y: blackHole.y + offsetY,
      vx: 0,
      vy: 0,
      radius: playerShip.radius / 2,
      mass: Math.random() * 1.5 + 0.5  // Random mass between 0.5 and 2.0
    });
  }
}

initializeAsteroids();

// *****Section J32 - Code Reference Point – Finish******

// *****Section J32.1 - Code Reference Point – Start******
// === ACCRETION DISK PARTICLE INITIALIZATION ===

function initializeAccretionDisk() {
  accretionParticles = [];
  for (let i = 0; i < ACCRETION_PARTICLE_COUNT; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = blackHole.radius + 40 + Math.random() * 60;
    accretionParticles.push({
      angle: angle,
      radius: radius,
      rotationSpeed: 0.002 + Math.random() * 0.003
    });
  }
}

initializeAccretionDisk();

// *****Section J32.1 - Code Reference Point – Finish******

// *****Section J33 - Code Reference Point – Start******

// === LASER SYSTEM ===
let activeLasers = [];

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const targetX = event.clientX - rect.left;
  const targetY = event.clientY - rect.top;

  // Translate screen coordinates to game world coordinates
  const worldX = playerShip.x + (targetX - canvas.width / 2);
  const worldY = playerShip.y + (targetY - canvas.height / 2);

  activeLasers.push({
    targetX: worldX,
    targetY: worldY,
    createdAt: performance.now()
  });

  // Laser collision detection with asteroids
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    const dx = worldX - asteroid.x;
    const dy = worldY - asteroid.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < asteroid.radius + 10) {
      asteroids.splice(i, 1);
      currentScore += 10;
      UI.updateScore(currentScore);
      break;
    }
  }
});

// *****Section J33 - Code Reference Point – Finish******

// *****Section J34 - Code Reference Point – Start******
// === UI CONTROLLER – Centralized UI State Management ===

const UI = {
  updateScore(score) {
    document.getElementById('scoreCounter').textContent = `Score: ${score.toFixed(0)}`;
  },
  updateBlackHoleMass(mass) {
    document.getElementById('blackHoleMass').textContent = `Blackhole Mass: ${mass.toFixed(0)}`;
  },
  updateInfoPanel(bhDist, bpDist, fuel, speed) {
    updateUI();
  },
  showAlert(type, message = '') {
    const alertMap = {
      top: 'fuelAlertMessage',
      bottom: 'outOfFuelMessage',
      speed: 'alertMessage'
    };
    const el = document.getElementById(alertMap[type]);
    if (el) {
      el.textContent = message || el.textContent;
      el.style.display = 'block';
    }
  },
  hideAlert(type) {
    const alertMap = {
      top: 'fuelAlertMessage',
      bottom: 'outOfFuelMessage',
      speed: 'alertMessage'
    };
    const el = document.getElementById(alertMap[type]);
    if (el) el.style.display = 'none';
  }
};

// *****Section J34 - Code Reference Point – Finish******

});
