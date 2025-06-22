// =========================================================
// === BLACKHOLE RUN – DEVELOPER CONFIGURATION GUIDE ====
// =========================================================
//
// === ASTEROID SETTINGS (Section J32)
// - ASTEROID_COUNT: Total number of asteroids spawned
// - ASTEROID_SPREAD_X: Horizontal spawn area around black hole
// - ASTEROID_SPREAD_Y: Vertical spawn area around black hole
//
// === ACCRETION DISK (Sections J6, J32.1, J27)
// - ACCRETION_PARTICLE_COUNT: Total disk particles initialized
// - Radius range: Disk extends from blackHole.radius + 40 to +100
// - diskGlow: Controls visual brightness of the disk
// - diskGlow increases with each asteroid absorbed
// - Particle draw count scales with diskGlow (see Section J27)
//
// === BLACK HOLE PROPERTIES (Sections J6, J7)
// - G_scaled: Shared gravitational constant used for all gravity effects
// - c_scaled: Controls black hole radius (Schwarzschild calculation)
// - blackHole.mass: Starting black hole mass (affects radius and pull)
//
// === BLUE PLANET PROPERTIES (Section J8)
// - bluePlanet.mass: Affects its gravity and size
// - Gravity is calculated using G_scaled (same constant as black hole)
//   → gravityPull = G_scaled × mass
// - NOTE: Both the black hole and blue planet use the same G_scaled
//   value unless changed in the code.
//
// === STRETCH EFFECT (Sections J6, J18, J29)
// - STRETCH_DISTANCE: Distance from black hole where stretched images appear
//
// === SHIP SETTINGS (Section J9)
// - radius: Collision size of the ship
// - mass: Affects gravity influence on the ship
// - fuel: Starting fuel amount
//
// === PROPULSION & FUEL SYSTEM (Section J10)
// - fuelConsumptionRate: Fuel burned per second during thrust
// - fuelCollectionRate: Fuel gained per second near black hole
// - fuelCollectionDistance: Distance from black hole for fuel pickup
// - pushStrength / reverseStrength: Thrust forces applied to the ship
//
// === LANDING CONDITIONS (Section J20)
// - depositDelay: Time (ms) required to deposit fuel on the blue planet
//
// === VERSION DISPLAY (Section J0)
// - Update the welcome alert string to reflect the current version
//
// === GAME RESET (Section J16)
// - resetGame(): Resets all gameplay values including ship state and disk glow
//
// =========================================================



// *****Section J0 - Code Reference Point – Start******
// === DISPLAY GAME INSTRUCTIONS ON FIRST LOAD ===

window.addEventListener('load', () => {
  alert(
    "Welcome to Blackhole Run! BETA VERSION 1.15.7\n\n" +
    "THIS GAME IS IN BETA – FEATURES ARE STILL BEING DEVELOPED\n\n" +
    "HOW TO PLAY:\n" +
    "- Use the Propel and Reverse thruster buttons to control your ship.\n" +
    "- Collect fuel near the black hole, use the Propel button to avoid getting sucked in.\n" +
    "- Keep an eye on your distance to the blue planet and your speed, you will need to slow down to safely land.\n" +
    "- To land safely on the Blue planet, slow down to 149 px/using the Reverse button.\n" +
    "- The Blue Planet has gravity, the closer you get to it, the faster you travel.\n" +
    "- Asteroids increase the mass of the black hole and its gravitational pull.\n" +
    "- Future versions will include asteroid collisions and laser shooting.\n" +
    "- If lost in space, or if the game bugs out press the Reset button.\n\n" +
    "Good luck, Pilot!"

  );
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
    const PARALLAX_FACTOR = 0.2;       // Adjust movement speed (0-1)
	
// *****Section J2  - Code Reference Point – Finish******

// *****Section J3  - Code Reference Point – Start******

    // === GAME INITIALIZATION ===
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight * 0.85;
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
      width = window.innerWidth;
      height = window.innerHeight * 0.85;
      canvas.width = width;
      canvas.height = height;
    });

// *****Section J5  - Code Reference Point – Finish******

// *****Section J6 - Code Reference Point – Start******

    // === GAME OBJECTS ===
    // Gravitational constant (scaled for game physics)
    const G_scaled = 500; // EDIT: Increase for stronger gravity
    // Speed of light constant (scaled for black hole calculations)
    const c_scaled = 1000; // EDIT: Increase for larger black hole radius

    let highScore = 0;

    let isShipStretching = false;
    const STRETCH_DISTANCE = 100; // Stretch trigger zone before black hole event horizon
    let stretchingAsteroids = new Set();

    // === SHIP EXPLOSION FLAG ===
    let isShipExploding = false;

    // === ACCRETION DISK PARTICLES ===
    const ACCRETION_PARTICLE_COUNT = 200;
    let accretionParticles = [];
    let diskGlow = 0.1; // Start slightly brighter

// *****Section J6 - Code Reference Point – Finish******




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
      x: 50000, // Distance from black hole (in game units)
      y: 0,     // Same y as black hole for simplicity
      mass: 500, // EDIT: Increase for stronger planetary gravity
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
      fuel: 5000,     // EDIT: Increase starting fuel
      fuelDeposited: 0
    };


// *****Section J9  - Code Reference Point – Finish******

// *****Section J10  - Code Reference Point – Start******

    // === GAME MECHANICS ===
    const fuelConsumptionRate = 20;  // EDIT: Increase for faster fuel usage
    const fuelCollectionRate = 30;   // EDIT: Increase for faster fuel collection
    const fuelCollectionDistance = 450; // EDIT: Increase for larger collection range
    const pushStrength = 800;        // EDIT: Increase for stronger propulsion
    const reverseStrength = 200;     // EDIT: Increase for stronger reverse thrust
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
    const depositDelay = 2000; // EDIT: Increase for longer landing sequence

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

      // Reset stretching and explosion states
      isShipExploding = false;

      // Reset accretion disk brightness
      diskGlow = 0.5;

      // Update high score display (remains unchanged if reset due to crash)
      document.getElementById('highScore').textContent = `High Score: ${highScore.toFixed(1)}`;

      // Set flag and timestamp to prevent immediate black hole respawn effects after reset
      justReset = true;
      resetTime = performance.now();
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
        resetGame();
        return;
      }

      // Calculate distance from ship to blue planet
      const bpDist = Math.sqrt((bluePlanet.x - playerShip.x) ** 2 + (bluePlanet.y - playerShip.y) ** 2);
      const speed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
      if (bpDist < bluePlanet.radius + playerShip.radius && speed > 150 && !isShipExploding) {
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
          resetGame();
        }, 500);
      }
    }

// *****Section J17  - Code Reference Point – Finish******



      // Calculate distance from ship to blue planet
      const bpDist = Math.sqrt((bluePlanet.x - playerShip.x) ** 2 + (bluePlanet.y - playerShip.y) ** 2);
      const speed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
      if (bpDist < bluePlanet.radius + playerShip.radius && speed > 150) {
        alert("You have entered the Blue Planet's Atmosphere Too Fast! You have Crashed Your Ship and Lost All Your Fuel, Game Over!!!!");
        playerShip.fuel = 0;
        resetGame();
      }
    
	
/// *****Section J18  - Code Reference Point – Start******	

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
      document.getElementById('fuelAlertMessage').style.display = 'block';
    } else {
      document.getElementById('fuelAlertMessage').style.display = 'none';
    }

    checkCollisions();
    updateAsteroids(deltaTime);
	
// *****Section J18  - Code Reference Point – Finish******


// *****Section J18.1 - Code Reference Point – Start******
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
        const speed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
        if (speed <= 150) {
          if (!depositStartTime) depositStartTime = performance.now();
          if (performance.now() - depositStartTime >= depositDelay) {
            playerShip.fuelDeposited += playerShip.fuel;
            highScore = Math.max(highScore, playerShip.fuelDeposited);
            playerShip.fuel = 0;
            document.getElementById('highScore').textContent = `High Score: ${playerShip.fuelDeposited.toFixed(1)}`;
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
      document.getElementById('outOfFuelMessage').style.display = playerShip.fuel <= 0 ? 'block' : 'none';

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

      // Speed alerts: Show a message if near the blue planet and speed is too high
      const speed = Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2);
      const alertElement = document.getElementById('alertMessage');
      if (bpDist < 20000) {
        alertElement.style.display = 'block';
        alertElement.textContent = speed > 150 ? 'Slow down to 149px/s to land on the Blue Planet!' : 'Ready to land!';
      } else {
        alertElement.style.display = 'none';
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
        p.angle += p.speed;
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




// *****Section J30  - Code Reference Point – Start******

      // UI TEXT: Each piece of info on a new line using <br>
      document.getElementById('info').innerHTML =
        `Black Hole: ${Math.sqrt((blackHole.x - playerShip.x) ** 2 + (blackHole.y - playerShip.y) ** 2).toFixed(2)}px<br>` +
        `Blue Planet: ${Math.sqrt((bluePlanet.x - playerShip.x) ** 2 + (bluePlanet.y - playerShip.y) ** 2).toFixed(2)}px<br>` +
        `Fuel: ${playerShip.fuel.toFixed(2)}<br>` +
        `Speed: ${Math.sqrt(playerShip.vx ** 2 + playerShip.vy ** 2).toFixed(2)}px/s`;
    }

// *****Section J30  - Code Reference Point – Finish******

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
	
// *****Section J30  - Code Reference Point – Finish******

// *****Section J32 - Code Reference Point – Start******
// === ASTEROID SETUP AND DRAWING ===

const ASTEROID_COUNT = 1000;
const ASTEROID_SPREAD_X = 45000;  // Editable spread range in x-direction
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
      speed: 0.002 + Math.random() * 0.003
    });
  }
}

initializeAccretionDisk();

// *****Section J32.1 - Code Reference Point – Finish******
